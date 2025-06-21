import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 401 }
      );
    }

    // Get user profile with settings and subscription
    const profile = await prisma.profile.findUnique({
      where: { userId: (session.user as any).id },
      // Note: settings must be fetched separately via loadUserSettings
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: session.user,
        profile,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/session error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
