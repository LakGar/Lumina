import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for settings update
const updateSettingsSchema = z.object({
  aiMemoryEnabled: z.boolean().optional(),
  moodAnalysisEnabled: z.boolean().optional(),
  summaryGenerationEnabled: z.boolean().optional(),
});

// Interface for settings response
interface SettingsResponse {
  id: string;
  userId: string;
  aiMemoryEnabled: boolean;
  moodAnalysisEnabled: boolean;
  summaryGenerationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get or create user settings
    let settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: user.id,
          aiMemoryEnabled: true,
          moodAnalysisEnabled: true,
          summaryGenerationEnabled: true,
        },
      });
    }

    const settingsResponse: SettingsResponse = {
      id: settings.id,
      userId: settings.userId,
      aiMemoryEnabled: settings.aiMemoryEnabled,
      moodAnalysisEnabled: settings.moodAnalysisEnabled,
      summaryGenerationEnabled: settings.summaryGenerationEnabled,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: settingsResponse,
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = await validateRequest(updateSettingsSchema, body);

    // Get or create user settings
    let settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      // Create settings with defaults and provided values
      settings = await prisma.settings.create({
        data: {
          userId: user.id,
          aiMemoryEnabled: validatedData.aiMemoryEnabled ?? true,
          moodAnalysisEnabled: validatedData.moodAnalysisEnabled ?? true,
          summaryGenerationEnabled:
            validatedData.summaryGenerationEnabled ?? true,
        },
      });
    } else {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { userId: user.id },
        data: {
          ...(validatedData.aiMemoryEnabled !== undefined && {
            aiMemoryEnabled: validatedData.aiMemoryEnabled,
          }),
          ...(validatedData.moodAnalysisEnabled !== undefined && {
            moodAnalysisEnabled: validatedData.moodAnalysisEnabled,
          }),
          ...(validatedData.summaryGenerationEnabled !== undefined && {
            summaryGenerationEnabled: validatedData.summaryGenerationEnabled,
          }),
        },
      });
    }

    const settingsResponse: SettingsResponse = {
      id: settings.id,
      userId: settings.userId,
      aiMemoryEnabled: settings.aiMemoryEnabled,
      moodAnalysisEnabled: settings.moodAnalysisEnabled,
      summaryGenerationEnabled: settings.summaryGenerationEnabled,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: settingsResponse,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/settings error:", error);

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
