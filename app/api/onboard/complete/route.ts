import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { EntrySource } from "@/app/generated/prisma/enums";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

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
    const body = await req.json().catch(() => ({}));
    const displayName =
      typeof body?.displayName === "string" ? body.displayName.trim() : null;
    const journalName =
      typeof body?.journalName === "string"
        ? body.journalName.trim() || "My Journal"
        : "My Journal";
    const firstEntryContent =
      typeof body?.firstEntryContent === "string"
        ? body.firstEntryContent.trim()
        : "";
    const goal =
      typeof body?.goal === "string" ? body.goal.trim() || null : null;
    const topics =
      typeof body?.topics === "string" ? body.topics.trim() || null : null;
    const reason =
      typeof body?.reason === "string" ? body.reason.trim() || null : null;
    const dailyReminderTime =
      typeof body?.dailyReminderTime === "string" &&
      /^\d{2}:\d{2}$/.test(body.dailyReminderTime)
        ? body.dailyReminderTime
        : null;
    const dailyReminderEnabled =
      typeof body?.dailyReminderEnabled === "boolean"
        ? body.dailyReminderEnabled
        : Boolean(dailyReminderTime);

    if (!firstEntryContent) {
      const res = NextResponse.json(
        { error: "firstEntryContent is required" },
        { status: 400 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 400,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const journal = await tx.journal.create({
        data: {
          title: journalName,
          authorId: auth.user.id,
          public: false,
        },
      });
      const entry = await tx.journalEntry.create({
        data: {
          journalId: journal.id,
          content: firstEntryContent,
          source: EntrySource.TEXT,
        },
      });
      await tx.userPrefferences.upsert({
        where: { authorId: auth.user.id },
        create: {
          authorId: auth.user.id,
          goal,
          topics,
          reason,
        },
        update: { goal, topics, reason },
      });
      await tx.notification.upsert({
        where: { authorId: auth.user.id },
        create: {
          authorId: auth.user.id,
          dailyReminderEnabled,
          dailyReminderTime: dailyReminderTime ?? null,
        },
        update: {
          dailyReminderEnabled,
          dailyReminderTime: dailyReminderTime ?? null,
        },
      });
      await tx.user.update({
        where: { id: auth.user.id },
        data: {
          prefferdName: displayName ?? undefined,
          onboardingComplete: true,
        },
      });
      return { journal, entry };
    });

    const res = NextResponse.json(
      {
        data: {
          journalId: result.journal.id,
          entryId: result.entry.id,
        },
      },
      { status: 201 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 201,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to complete onboarding" },
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
