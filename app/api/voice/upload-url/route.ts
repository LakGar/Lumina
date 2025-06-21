import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { validateRequest } from "@/utils/validation";
import { z } from "zod";
import { generateSignedUploadUrl } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

// Validation schema for upload URL request
const uploadUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().regex(/^audio\/mp3$/, "Only MP3 files are allowed"),
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
    const fileName = searchParams.get("fileName");
    const contentType = searchParams.get("contentType") || "audio/mp3";

    // Validate input
    const validatedData = await validateRequest(uploadUrlSchema, {
      fileName,
      contentType,
    });

    // Generate unique key for S3
    const fileExtension = validatedData.fileName.split(".").pop();
    const key = `uploads/${user.id}/${uuidv4()}.${fileExtension}`;

    // Generate signed upload URL
    const uploadUrl = await generateSignedUploadUrl(
      key,
      validatedData.contentType,
      300 // 5 minutes expiration
    );

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        key,
        expiresAt,
        contentType: validatedData.contentType,
      },
    });
  } catch (error) {
    console.error("GET /api/voice/upload-url error:", error);

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
