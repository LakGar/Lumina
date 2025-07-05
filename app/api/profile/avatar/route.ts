import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { getFileUrl, deleteFile } from "@/lib/multer";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const extension = file.name.split(".").pop();
    const filename = `avatar-${timestamp}-${randomSuffix}.${extension}`;

    // Save file to uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads");
    const filePath = join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Delete old avatar if it exists
    if (profile.avatarUrl) {
      const oldFilename = profile.avatarUrl.split("/").pop();
      if (oldFilename) {
        deleteFile(oldFilename);
      }
    }

    // Generate new avatar URL
    const avatarUrl = getFileUrl(filename);

    // Update profile with new avatar URL
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        avatarUrl: avatarUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: updatedProfile.avatarUrl,
        filename: filename,
      },
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("POST /api/profile/avatar error:", error);

    if (error instanceof Error) {
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

export async function DELETE(request: NextRequest) {
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

    // Delete avatar file if it exists
    if (profile.avatarUrl) {
      const filename = profile.avatarUrl.split("/").pop();
      if (filename) {
        deleteFile(filename);
      }
    }

    // Update profile to remove avatar URL
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        avatarUrl: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: null,
      },
      message: "Avatar removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/profile/avatar error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
