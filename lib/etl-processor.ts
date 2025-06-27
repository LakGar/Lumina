import { Worker } from "bullmq";
import { redis } from "./redis";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { getPineconeIndex, getUserNamespace } from "@/lib/pinecone";
import { ETLJobData } from "./queue";
import { checkFeatureAccess } from "@/utils/access";
import type { MembershipTier } from "@/types";

// OpenAI prompt templates
const SUMMARY_PROMPT = `Please provide a concise summary (2-3 sentences) of the following journal entry, focusing on the main themes and emotions expressed:

"{content}"

Summary:`;

const TAGS_PROMPT = `Analyze the following journal entry and extract 3-5 relevant tags that capture the main themes, emotions, or topics discussed. Return only the tags as a comma-separated list:

"{content}"

Tags:`;

const MOOD_PROMPT = `Analyze the emotional tone of the following journal entry and classify it into one of these categories: happy, sad, anxious, excited, calm, frustrated, grateful, angry, hopeful, or neutral. Return only the mood category:

"{content}"

Mood:`;

// Function to chunk text into ~400 token pieces
function chunkText(text: string, maxTokens: number = 400): string[] {
  console.log(
    `[ETL] [TRANSFORM] Starting text chunking for ${text.length} characters`
  );

  // Rough approximation: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  const chunks: string[] = [];

  if (text.length <= maxChars) {
    console.log(
      `[ETL] [TRANSFORM] Text fits in single chunk (${text.length} chars)`
    );
    return [text];
  }

  // Split by sentences first, then by words if needed
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  let currentChunk = "";

  for (const sentence of sentences) {
    if (
      (currentChunk + sentence).length > maxChars &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  console.log(`[ETL] [TRANSFORM] Text chunked into ${chunks.length} chunks`);
  return chunks;
}

// Function to transcribe audio using Whisper
async function transcribeAudio(voiceUrl: string): Promise<string> {
  console.log(
    `[ETL] [TRANSFORM] Starting voice transcription for: ${voiceUrl}`
  );

  try {
    // Download the audio file from S3
    console.log(`[ETL] [TRANSFORM] Downloading audio file from S3...`);
    const response = await fetch(voiceUrl);
    const audioBuffer = await response.arrayBuffer();

    // Transcribe using OpenAI Whisper
    console.log(
      `[ETL] [TRANSFORM] Sending to OpenAI Whisper for transcription...`
    );
    const transcription = await openai.audio.transcriptions.create({
      file: new Blob([audioBuffer], { type: "audio/mp3" }) as any,
      model: "whisper-1",
    });

    console.log(
      `[ETL] [TRANSFORM] Transcription completed: ${transcription.text.substring(
        0,
        100
      )}...`
    );
    return transcription.text;
  } catch (error) {
    console.error("[ETL] [TRANSFORM] Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// Function to generate embeddings for text chunks
async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  console.log(
    `[ETL] [TRANSFORM] Generating embeddings for ${chunks.length} chunks...`
  );

  try {
    const embeddings = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: chunks,
    });

    console.log(
      `[ETL] [TRANSFORM] Embeddings generated successfully (${embeddings.data.length} vectors, ${embeddings.data[0]?.embedding.length} dimensions)`
    );
    return embeddings.data.map((item) => item.embedding);
  } catch (error) {
    console.error("[ETL] [TRANSFORM] Embedding generation error:", error);
    throw new Error("Failed to generate embeddings");
  }
}

// Function to store embeddings in Pinecone
async function storeEmbeddings(
  userId: string,
  entryId: string,
  chunks: string[],
  embeddings: number[][]
): Promise<void> {
  console.log(
    `[ETL] [LOAD] Storing ${embeddings.length} embeddings in Pinecone...`
  );

  try {
    const index = getPineconeIndex();
    const namespace = getUserNamespace(userId);

    const vectors = chunks.map((chunk, i) => ({
      id: `${userId}:${entryId}:${i}`,
      values: embeddings[i],
      metadata: {
        userId,
        entryId,
        chunkIndex: i,
        text: chunk,
        type: "journal_chunk",
        namespace,
      },
    }));

    await index.upsert(vectors);
    console.log(
      `[ETL] [LOAD] Embeddings stored successfully in namespace: ${namespace}`
    );
  } catch (error) {
    console.error("[ETL] [LOAD] Pinecone storage error:", error);
    throw new Error("Failed to store embeddings");
  }
}

// Main ETL processing function
export async function processJournalEntry(jobData: ETLJobData): Promise<void> {
  const { entryId, userId, content: originalContent, voiceUrl } = jobData;
  const startTime = Date.now();

  console.log(`[ETL] Starting job processing for entry ${entryId}`);
  console.log(
    `[ETL] Job data: ${JSON.stringify({
      entryId,
      userId,
      contentLength: originalContent.length,
      hasVoice: !!voiceUrl,
    })}`
  );

  try {
    // Get user settings to determine what to process
    console.log(`[ETL] [EXTRACT] Fetching user settings for user ${userId}...`);
    const userSettings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!userSettings) {
      throw new Error("User settings not found");
    }

    // Fetch plan from Subscription
    console.log(
      `[ETL] [EXTRACT] Fetching subscription plan for user ${userId}...`
    );
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    const plan = (subscription?.plan ?? "free") as MembershipTier;
    const user = {
      plan,
      settings: {
        ai_memory_enabled: userSettings.aiMemoryEnabled,
        mood_analysis_enabled: userSettings.moodAnalysisEnabled,
        summary_generation_enabled: userSettings.summaryGenerationEnabled,
      },
    };

    console.log(
      `[ETL] [EXTRACT] User plan: ${plan}, AI Memory: ${userSettings.aiMemoryEnabled}, Mood Analysis: ${userSettings.moodAnalysisEnabled}, Summary: ${userSettings.summaryGenerationEnabled}`
    );

    let finalContent = originalContent;
    console.log(
      `[ETL] [EXTRACT] Original content length: ${originalContent.length} characters`
    );

    // Step 1: Transcribe voice if provided
    if (voiceUrl && userSettings.aiMemoryEnabled) {
      console.log(
        `[ETL] [TRANSFORM] Voice transcription enabled, processing voice file...`
      );
      try {
        const transcription = await transcribeAudio(voiceUrl);
        finalContent = transcription;
        console.log(
          `[ETL] [TRANSFORM] Voice transcription completed, new content length: ${finalContent.length} characters`
        );
      } catch (error) {
        console.error("[ETL] [TRANSFORM] Voice transcription failed:", error);
        // Continue with original content if transcription fails
      }
    } else {
      console.log(
        `[ETL] [TRANSFORM] Voice transcription skipped (voiceUrl: ${!!voiceUrl}, aiMemoryEnabled: ${
          userSettings.aiMemoryEnabled
        })`
      );
    }

    // Step 2: Generate AI insights (if enabled)
    let summary: string | null = null;
    let tags: string[] = [];
    let mood: string | null = null;

    if (
      checkFeatureAccess(user, "summary_generation", { throwIfDenied: false })
    ) {
      console.log(`[ETL] [TRANSFORM] Generating AI summary...`);
      try {
        const summaryResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: SUMMARY_PROMPT.replace("{content}", finalContent),
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        });
        summary = summaryResponse.choices[0]?.message?.content?.trim() || null;
        console.log(`[ETL] [TRANSFORM] Summary generated: ${summary}`);
      } catch (error) {
        console.error("[ETL] [TRANSFORM] Summary generation failed:", error);
      }
    } else {
      console.log(
        `[ETL] [TRANSFORM] Summary generation skipped (not enabled for ${plan} tier)`
      );
    }

    if (checkFeatureAccess(user, "mood_analysis", { throwIfDenied: false })) {
      console.log(`[ETL] [TRANSFORM] Analyzing mood and sentiment...`);
      try {
        const moodResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: MOOD_PROMPT.replace("{content}", finalContent),
            },
          ],
          max_tokens: 20,
          temperature: 0.3,
        });
        mood = moodResponse.choices[0]?.message?.content?.trim() || null;
        console.log(`[ETL] [TRANSFORM] Mood detected: ${mood}`);
      } catch (error) {
        console.error("[ETL] [TRANSFORM] Mood analysis failed:", error);
      }
    } else {
      console.log(
        `[ETL] [TRANSFORM] Mood analysis skipped (not enabled for ${plan} tier)`
      );
    }

    // Generate tags if enabled
    if (
      checkFeatureAccess(user, "summary_generation", { throwIfDenied: false })
    ) {
      console.log(`[ETL] [TRANSFORM] Extracting auto-tags...`);
      try {
        const tagsResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: TAGS_PROMPT.replace("{content}", finalContent),
            },
          ],
          max_tokens: 100,
          temperature: 0.5,
        });
        const tagsText = tagsResponse.choices[0]?.message?.content?.trim();
        if (tagsText) {
          tags = tagsText
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        }
        console.log(`[ETL] [TRANSFORM] Auto-tags: ${tags.join(", ")}`);
      } catch (error) {
        console.error("[ETL] [TRANSFORM] Tag generation failed:", error);
      }
    } else {
      console.log(
        `[ETL] [TRANSFORM] Tag generation skipped (not enabled for ${plan} tier)`
      );
    }

    // Step 3: Generate chunks and embeddings (if memory is enabled)
    let chunks: string[] = [];
    if (checkFeatureAccess(user, "ai_memory", { throwIfDenied: false })) {
      console.log(
        `[ETL] [TRANSFORM] AI memory enabled, generating embeddings...`
      );
      chunks = chunkText(finalContent);

      try {
        const embeddings = await generateEmbeddings(chunks);
        await storeEmbeddings(userId, entryId, chunks, embeddings);
      } catch (error) {
        console.error("[ETL] [TRANSFORM] Embedding processing failed:", error);
        // Continue without embeddings if they fail
      }
    } else {
      console.log(`[ETL] [TRANSFORM] AI memory disabled, skipping embeddings`);
    }

    // Step 4: Update journal entry with AI insights
    console.log(`[ETL] [LOAD] Updating journal entry with processed data...`);
    await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        content: finalContent,
        summary,
        tags,
        mood,
        chunks,
        updatedAt: new Date(),
      },
    });
    console.log(`[ETL] [LOAD] Entry updated successfully`);

    const processingTime = Date.now() - startTime;
    console.log(`[ETL] Job completed successfully for entry ${entryId}`);
    console.log(`[ETL] Processing time: ${processingTime}ms`);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[ETL] [ERROR] Failed to process entry ${entryId}:`, error);
    console.error(
      `[ETL] [ERROR] Processing time before failure: ${processingTime}ms`
    );
    throw error;
  }
}

// Create ETL worker
export function createETLWorker() {
  console.log(`[ETL] Creating ETL worker with concurrency: 2`);

  return new Worker(
    "etl-pipeline",
    async (job) => {
      const jobData = job.data as ETLJobData;
      console.log(
        `[ETL] Worker processing job ${job.id} for entry ${jobData.entryId}`
      );
      await processJournalEntry(jobData);
      console.log(`[ETL] Worker completed job ${job.id}`);
    },
    {
      connection: redis,
      concurrency: 2, // Process 2 jobs at a time
    }
  );
}
