import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * POST /api/users/me/delete-all-data
 * Permanently delete all app-owned data for the current user (journals, entries,
 * preferences, notification settings, onboarding state). Does not delete the
 * user's auth identity (Clerk). Used by Privacy settings → Delete all data.
 */
export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const start = Date.now();
  const auth = await requireAuth();
  if (!auth.ok) {
    return finishRequest(req, auth.response, {
      requestId,
      start,
      statusCode: auth.response.status,
    });
  }
  try {
    const userId = auth.user.id;

    await prisma.$transaction(async (tx) => {
      await tx.journal.deleteMany({ where: { authorId: userId } });
      await tx.userPrefferences.deleteMany({ where: { authorId: userId } });
      await tx.notification.deleteMany({ where: { authorId: userId } });
      await tx.mood.deleteMany({ where: { authorId: userId } });
      await tx.reminder.deleteMany({ where: { authorId: userId } });
      await tx.chatSession.deleteMany({ where: { userId } });
      await tx.weeklyTip.deleteMany({ where: { userId } });
      await tx.promptCompletion.deleteMany({ where: { userId } });
      await tx.user.update({
        where: { id: userId },
        data: { onboardingComplete: false },
      });
    });

    const res = new NextResponse(null, { status: 204 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 204,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to delete all data" },
      { status: 500 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 500,
      errorName: err.name,
      errorMessage: err.message,
    });
  }
}
