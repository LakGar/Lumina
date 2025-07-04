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

// Validation schema for search parameters
const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(500, "Query too long"),
  tags: z.array(z.string()).optional(),
  mood: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).max(50).default(1),
  limit: z.number().min(1).max(50).default(10),
});

// Interface for search results
interface SearchResult {
  id: string;
  content: string;
  summary: string | null;
  tags: string[];
  mood: string | null;
  createdAt: string;
  matchSource: "text" | "vector";
  matchScore: number;
  entryId: string;
}

// Function to perform keyword search using PostgreSQL full-text search
async function performKeywordSearch(
  userId: string,
  query: string,
  filters: {
    tags?: string[];
    mood?: string;
    startDate?: string;
    endDate?: string;
  },
  page: number,
  limit: number
): Promise<{ results: SearchResult[]; total: number }> {
  const offset = (page - 1) * limit;

  // Build WHERE clause
  const whereClause: {
    userId: string;
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
    tags?: { hasSome: string[] };
    mood?: string;
  } = { userId };

  if (filters.startDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      gte: new Date(filters.startDate),
    };
  }
  if (filters.endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      lte: new Date(filters.endDate),
    };
  }
  if (filters.tags && filters.tags.length > 0) {
    whereClause.tags = { hasSome: filters.tags };
  }
  if (filters.mood) {
    whereClause.mood = filters.mood;
  }

  // Get total count
  const total = await prisma.journalEntry.count({ where: whereClause });

  // Get entries
  const entries = await prisma.journalEntry.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    select: {
      id: true,
      content: true,
      summary: true,
      tags: true,
      mood: true,
      createdAt: true,
    },
  });

  // Convert to search results format
  const results: SearchResult[] = entries.map((entry: any) => ({
    id: entry.id,
    content: entry.content,
    summary: entry.summary,
    tags: entry.tags,
    mood: entry.mood,
    createdAt: entry.createdAt.toISOString(),
    matchSource: "text" as const,
    matchScore: 1,
    entryId: entry.id,
  }));

  return { results, total };
}

// Function to perform semantic search using Pinecone
async function performSemanticSearch(
  userId: string,
  query: string,
  filters: {
    tags?: string[];
    mood?: string;
    startDate?: string;
    endDate?: string;
  },
  page: number,
  limit: number
): Promise<{ results: SearchResult[]; total: number }> {
  try {
    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Query Pinecone in the user's namespace
    const index = getPineconeIndex();
    const namespace = require("@/lib/pinecone").getUserNamespace(userId);
    const queryResponse = await index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: limit * 2, // Get more results to filter
      includeMetadata: true,
      filter: {
        userId: { $eq: userId },
        type: { $eq: "journal_chunk" },
      },
    });

    // Get unique entry IDs from the results
    const entryIds = Array.from(
      new Set(
        queryResponse.matches
          ?.map((match) => match.metadata?.entryId)
          .filter((id): id is string => Boolean(id)) || []
      )
    );

    if (entryIds.length === 0) {
      return { results: [], total: 0 };
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
    });

    // Apply additional filters
    let filteredEntries = entries;

    if (filters.startDate) {
      filteredEntries = filteredEntries.filter(
        (entry: any) => entry.createdAt >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filteredEntries = filteredEntries.filter(
        (entry: any) => entry.createdAt <= new Date(filters.endDate!)
      );
    }
    if (filters.tags && filters.tags.length > 0) {
      filteredEntries = filteredEntries.filter((entry: any) =>
        filters.tags!.some((tag: string) => entry.tags.includes(tag))
      );
    }
    if (filters.mood) {
      filteredEntries = filteredEntries.filter(
        (entry: any) =>
          entry.mood?.toLowerCase() === filters.mood!.toLowerCase()
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedEntries = filteredEntries.slice(offset, offset + limit);

    // Convert to search results format
    const results: SearchResult[] = paginatedEntries.map((entry: any) => {
      // Find the best matching chunk for this entry
      const bestMatch = queryResponse.matches?.find(
        (match) => match.metadata?.entryId === entry.id
      );

      return {
        id: entry.id,
        content: entry.content,
        summary: entry.summary,
        tags: entry.tags,
        mood: entry.mood,
        createdAt: entry.createdAt.toISOString(),
        matchSource: "vector" as const,
        matchScore: bestMatch?.score || 0.5,
        entryId: entry.id,
      };
    });

    return { results, total: filteredEntries.length };
  } catch (error) {
    console.error("Semantic search error:", error);
    // Fallback to keyword search
    return performKeywordSearch(userId, query, filters, page, limit);
  }
}

export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      q: searchParams.get("q"),
      tags: searchParams.getAll("tags[]"),
      mood: searchParams.get("mood"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      page: parseInt(searchParams.get("page") || "1"),
      limit: Math.min(parseInt(searchParams.get("limit") || "10"), 50),
    };

    const validatedParams = await validateRequest(searchSchema, queryParams);

    // Ensure validatedParams.page and limit are defined
    const page = validatedParams.page ?? 1;
    const limit = validatedParams.limit ?? 10;

    let searchResults: { results: SearchResult[]; total: number };

    if (
      checkFeatureAccess(userAccess, "semantic_search", {
        throwIfDenied: false,
      })
    ) {
      // Use semantic search
      searchResults = await performSemanticSearch(
        user.id,
        validatedParams.q,
        validatedParams,
        page,
        limit
      );
    } else {
      // Use keyword search
      searchResults = await performKeywordSearch(
        user.id,
        validatedParams.q,
        validatedParams,
        page,
        limit
      );
    }

    const totalPages = Math.ceil(searchResults.total / limit);

    return NextResponse.json({
      success: true,
      data: {
        results: searchResults.results,
        total: searchResults.total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        searchMethod: checkFeatureAccess(userAccess, "semantic_search", {
          throwIfDenied: false,
        })
          ? "semantic"
          : "keyword",
        query: validatedParams.q,
      },
    });
  } catch (error) {
    console.error("GET /api/search error:", error);

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
