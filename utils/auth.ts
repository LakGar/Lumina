import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return session.user;
}

export async function requireAuthWithProfile(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get user profile
  const profile = await prisma.profile.findUnique({
    where: { userId: (session.user as any).id },
    // Note: plan and settings must be fetched separately via Subscription and Settings models
  });

  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  return { user: session.user, profile };
}

export function validateMembership(
  userTier: string,
  requiredTier: "free" | "pro" | "premium"
) {
  const tiers = ["free", "pro", "premium"];
  const userTierIndex = tiers.indexOf(userTier);
  const requiredTierIndex = tiers.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
}

export async function getUserWithProfile(userId: string) {
  return await prisma.profile.findUnique({
    where: { userId },
    // Note: plan and settings must be fetched separately via Subscription and Settings models
  });
}
