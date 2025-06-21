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
  // Rough approximation: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  const chunks: string[] = [];

  if (text.length <= maxChars) {
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

  return chunks;
}

// Function to transcribe audio using Whisper
async function transcribeAudio(voiceUrl: string): Promise<string> {
  try {
    // Download the audio file from S3
    const response = await fetch(voiceUrl);
    const audioBuffer = await response.arrayBuffer();

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new Blob([audioBuffer], { type: "audio/mp3" }) as any,
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// Function to generate embeddings for text chunks
async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  try {
    const embeddings = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: chunks,
    });

    return embeddings.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Embedding generation error:", error);
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
  } catch (error) {
    console.error("Pinecone storage error:", error);
    throw new Error("Failed to store embeddings");
  }
}

// Main ETL processing function
export async function processJournalEntry(jobData: ETLJobData): Promise<void> {
  const { entryId, userId, content: originalContent, voiceUrl } = jobData;

  try {
    // Get user settings to determine what to process
    const userSettings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!userSettings) {
      throw new Error("User settings not found");
    }

    // Fetch plan from Subscription
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

    let finalContent = originalContent;

    // Step 1: Transcribe voice if provided
    if (voiceUrl && userSettings.aiMemoryEnabled) {
      try {
        const transcription = await transcribeAudio(voiceUrl);
        finalContent = transcription;
      } catch (error) {
        console.error("Voice transcription failed:", error);
        // Continue with original content if transcription fails
      }
    }

    // Step 2: Generate AI insights (if enabled)
    let summary: string | null = null;
    let tags: string[] = [];
    let mood: string | null = null;

    if (
      checkFeatureAccess(user, "summary_generation", { throwIfDenied: false })
    ) {
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
      } catch (error) {
        console.error("Summary generation failed:", error);
      }
    }

    if (checkFeatureAccess(user, "mood_analysis", { throwIfDenied: false })) {
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
      } catch (error) {
        console.error("Mood analysis failed:", error);
      }
    }

    // Generate tags if enabled
    if (
      checkFeatureAccess(user, "summary_generation", { throwIfDenied: false })
    ) {
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
      } catch (error) {
        console.error("Tag generation failed:", error);
      }
    }

    // Step 3: Generate chunks and embeddings (if memory is enabled)
    let chunks: string[] = [];
    if (checkFeatureAccess(user, "ai_memory", { throwIfDenied: false })) {
      chunks = chunkText(finalContent);

      try {
        const embeddings = await generateEmbeddings(chunks);
        await storeEmbeddings(userId, entryId, chunks, embeddings);
      } catch (error) {
        console.error("Embedding processing failed:", error);
        // Continue without embeddings if they fail
      }
    }

    // Step 4: Update journal entry with AI insights
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

    console.log(`ETL processing completed for entry ${entryId}`);
  } catch (error) {
    console.error(`ETL processing failed for entry ${entryId}:`, error);
    throw error;
  }
}

// Create ETL worker
export function createETLWorker() {
  return new Worker(
    "etl-pipeline",
    async (job) => {
      const jobData = job.data as ETLJobData;
      await processJournalEntry(jobData);
    },
    {
      connection: redis,
      concurrency: 2, // Process 2 jobs at a time
    }
  );
}
