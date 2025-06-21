import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { etlQueue } from "@/lib/queue";

// Validation schemas
const createJournalEntrySchema = z.object({
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  mood: z.string().optional(),
  voiceUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Validate pagination
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const total = await prisma.journalEntry.count({
      where: { userId: user.id },
    });

    // Get journal entries with pagination
    const entries = await prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit,
      select: {
        id: true,
        content: true,
        voiceUrl: true,
        mood: true,
        tags: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        entries,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/journal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = await validateRequest(createJournalEntrySchema, body);

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content: validatedData.content,
        voiceUrl: validatedData.voiceUrl,
        tags: validatedData.tags || [],
      },
    });

    // Enqueue ETL job for AI processing
    await etlQueue.add("journal-etl", {
      entryId: journalEntry.id,
      userId: user.id,
      content: validatedData.content,
      voiceUrl: validatedData.voiceUrl,
    });

    return NextResponse.json(
      {
        success: true,
        data: journalEntry,
        message: "Journal entry created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/journal error:", error);

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
