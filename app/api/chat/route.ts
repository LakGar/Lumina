import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { getPineconeIndex } from "@/lib/pinecone";
import { checkFeatureAccess } from "@/utils/access";
import { loadUserSettings } from "@/utils/settings";
import type { MembershipTier } from "@/types";

// Validation schema for chat request
const chatRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt too long"),
  sessionId: z.string().optional(),
});

// Interface for chat context
interface ChatContext {
  entryId: string;
  content: string;
  summary: string | null;
  tags: string[];
  mood: string | null;
  createdAt: string;
  relevanceScore: number;
}

// Function to retrieve relevant context from Pinecone
async function retrieveChatContext(
  userId: string,
  prompt: string,
  limit: number = 10
): Promise<ChatContext[]> {
  try {
    // Generate embedding for the user's prompt
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: prompt,
    });

    const promptEmbedding = embeddingResponse.data[0].embedding;

    // Query Pinecone for relevant chunks
    const index = getPineconeIndex();
    const queryResponse = await index.query({
      vector: promptEmbedding,
      topK: limit * 2, // Get more to filter
      includeMetadata: true,
      filter: {
        userId: { $eq: userId },
        type: { $eq: "journal_chunk" },
      },
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return [];
    }

    // Get unique entry IDs
    const entryIds = Array.from(
      new Set(
        queryResponse.matches
          .map((match) => match.metadata?.entryId)
          .filter(Boolean) as string[]
      )
    ).slice(0, limit);

    if (entryIds.length === 0) {
      return [];
    }

    // Fetch full entries from database
    const entries = await prisma.journalEntry.findMany({
      where: {
        id: { in: entryIds },
        userId,
      },
      select: {
        id: true,
        content: true,
        summary: true,
        tags: true,
        mood: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to chat context format
    const context: ChatContext[] = entries.map((entry: any) => {
      const bestMatch = queryResponse.matches?.find(
        (match) => match.metadata?.entryId === entry.id
      );

      return {
        entryId: entry.id,
        content: entry.content,
        summary: entry.summary,
        tags: entry.tags,
        mood: entry.mood,
        createdAt: entry.createdAt.toISOString(),
        relevanceScore: bestMatch?.score || 0.5,
      };
    });

    return context.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error("Error retrieving chat context:", error);
    return [];
  }
}

// Function to build the system prompt with context
function buildSystemPrompt(context: ChatContext[]): string {
  if (context.length === 0) {
    return `You are the user's private journaling assistant. You help users reflect on their thoughts and feelings based on their journal entries. If you don't have enough context to answer a question, say so and suggest they write more journal entries. Be supportive, empathetic, and encouraging.`;
  }

  const contextText = context
    .map((entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString();
      const tags = entry.tags.length > 0 ? `[${entry.tags.join(", ")}]` : "";
      const mood = entry.mood ? `(Mood: ${entry.mood})` : "";

      return `Entry from ${date} ${tags} ${mood}:
${entry.summary || entry.content.substring(0, 200)}...`;
    })
    .join("\n\n");

  return `You are the user's private journaling assistant. Answer based on their past reflections only. Here is relevant context from their journal entries:

${contextText}

Instructions:
- Base your response only on the provided journal context
- Be supportive, empathetic, and encouraging
- If the context doesn't provide enough information, say so
- Don't make up information not present in their entries
- Help them reflect on patterns, emotions, and growth
- Keep responses conversational and personal`;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const settings = await loadUserSettings(user.id);
    // Fetch plan from Subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    const plan = (subscription?.plan ?? "free") as MembershipTier;
    const userAccess = {
      plan,
      settings: {
        ai_memory_enabled: settings.aiMemoryEnabled,
        mood_analysis_enabled: settings.moodAnalysisEnabled,
        summary_generation_enabled: settings.summaryGenerationEnabled,
      },
    };
    // Enforce Pro+ for AI chat
    checkFeatureAccess(userAccess, "ai_chat");
    // Enforce memory flag for context
    if (
      !checkFeatureAccess(userAccess, "ai_memory", { throwIfDenied: false })
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Memory is currently disabled in your settings. You can re-enable it in your profile to get contextual responses.",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = await validateRequest(chatRequestSchema, body);

    // Retrieve relevant context from journal entries
    const context = await retrieveChatContext(user.id, validatedData.prompt);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Create chat completion with streaming
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: validatedData.prompt },
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          // Send end signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    // Store chat session in Redis if sessionId provided
    if (validatedData.sessionId) {
      try {
        // Store in Redis (implementation depends on your Redis setup)
        // await redis.setex(`chat:${validatedData.sessionId}:${Date.now()}`, 3600, JSON.stringify(chatHistory))
      } catch (error) {
        console.error("Error storing chat history:", error);
        // Continue without storing history
      }
    }

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);

    if (error instanceof Error && error.message.includes("Validation error")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
