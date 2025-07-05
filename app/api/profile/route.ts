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
    .max(100, "Full name too long"),
  bio: z.string().max(500, "Bio too long").optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user, profile } = authResult;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    const profileData = {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      membershipTier: profile.membershipTier,
      createdAt: profile.createdAt.toISOString(),
      bio: profile.bio || "",
    };

    return NextResponse.json({
      success: true,
      data: profileData,
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

    const { user, profile } = authResult;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = await validateRequest(updateProfileSchema, body);

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        fullName: validatedData.fullName,
        bio: validatedData.bio,
        avatarUrl: validatedData.avatarUrl,
        updatedAt: new Date(),
      },
    });

    const profileData = {
      id: updatedProfile.id,
      fullName: updatedProfile.fullName,
      email: updatedProfile.email,
      avatarUrl: updatedProfile.avatarUrl,
      membershipTier: updatedProfile.membershipTier,
      createdAt: updatedProfile.createdAt.toISOString(),
      bio: updatedProfile.bio || "",
    };

    return NextResponse.json({
      success: true,
      data: profileData,
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
