import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for updating journal entries
const updateJournalEntrySchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content too long")
    .optional(),
  voiceUrl: z.string().url("Invalid voice URL").optional(),
  tags: z.array(z.string()).max(20, "Too many tags").optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = params;

    // Get journal entry
    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!journalEntry) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: journalEntry,
    });
  } catch (error) {
    console.error("GET /api/journal/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = params;

    // Check if journal entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = await validateRequest(updateJournalEntrySchema, body);

    // Update journal entry (only allow updating content, voiceUrl, and tags)
    const updatedEntry = await prisma.journalEntry.update({
      where: { id },
      data: {
        content: validatedData.content,
        voiceUrl: validatedData.voiceUrl,
        tags: validatedData.tags,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: "Journal entry updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/journal/[id] error:", error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = params;

    // Check if journal entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: "Journal entry not found" },
        { status: 404 }
      );
    }

    // Delete journal entry
    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/journal/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
