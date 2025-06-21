import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserNamespaceInfo } from "@/lib/pinecone";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name too long")
    .optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user, profile } = authResult;

    // Get subscription info
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // Get Pinecone namespace info
    const pineconeInfo = getUserNamespaceInfo(user.id);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        subscription: subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              currentPeriodStart:
                subscription.currentPeriodStart?.toISOString(),
              currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
            }
          : null,
        pinecone: pineconeInfo,
      },
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
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
    const validatedData = await validateRequest(updateProfileSchema, body);

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        fullName: validatedData.fullName,
        avatarUrl: validatedData.avatarUrl,
      },
      // Note: settings must be fetched separately via loadUserSettings
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/profile error:", error);

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
