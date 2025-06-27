import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No active session" },
        { status: 401 }
      );
    }

    // Get user profile with settings and subscription
    const profile = await prisma.profile.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get settings and subscription separately
    const [settings, subscription] = await Promise.all([
      prisma.settings.findUnique({
        where: { userId: (session.user as any).id },
      }),
      prisma.subscription.findUnique({
        where: { userId: (session.user as any).id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: session.user,
        profile,
        settings,
        subscription,
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
