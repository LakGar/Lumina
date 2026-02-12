import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";

const prisma = new PrismaClient();

/** Lumina level thresholds: 0–99 → 1, 100–299 → 2, 300–599 → 3, 600–999 → 4, 1000+ → 5 */
function levelFromScore(score: number): number {
  if (score >= 1000) return 5;
  if (score >= 600) return 4;
  if (score >= 300) return 3;
  if (score >= 100) return 2;
  return 1;
}

/**
 * Lumina score: positively affected by entries, streaks, consistency, quality score, prompt completion;
 * negatively affected by missing scheduled journal days (when daily reminder is on).
 */
function computeLuminaScore(params: {
  totalEntries: number;
  currentStreak: number;
  consistency: number;
  avgQualityScore: number | null;
  promptsCompletedLast30: number;
  missedScheduledDays: number; // only > 0 when daily reminder is on
}): number {
  const {
    totalEntries,
    currentStreak,
    consistency,
    avgQualityScore,
    promptsCompletedLast30,
    missedScheduledDays,
  } = params;
  const entryPoints = totalEntries * 2;
  const streakBonus = currentStreak * 8;
  const consistencyBonus = Math.round((consistency / 100) * 30);
  const qualityBonus =
    avgQualityScore != null && avgQualityScore >= 0 && avgQualityScore <= 100
      ? Math.round((avgQualityScore / 100) * 40)
      : 0;
  const promptBonus = Math.min(promptsCompletedLast30 * 5, 100);
  const missedPenalty = missedScheduledDays * 3;
  const raw =
    entryPoints +
    streakBonus +
    consistencyBonus +
    qualityBonus +
    promptBonus -
    missedPenalty;
  return Math.max(0, Math.round(raw));
}

/** Consecutive days with at least one entry, including today. */
function computeStreak(dates: Date[]): number {
  const distinctDays = [
    ...new Set(dates.map((d) => d.toISOString().slice(0, 10))),
  ].sort();
  if (distinctDays.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  if (distinctDays[distinctDays.length - 1] !== today) return 0;
  let streak = 0;
  let expect = today;
  for (let i = distinctDays.length - 1; i >= 0; i--) {
    if (distinctDays[i] !== expect) break;
    streak++;
    const next = new Date(expect);
    next.setUTCDate(next.getUTCDate() - 1);
    expect = next.toISOString().slice(0, 10);
  }
  return streak;
}

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * GET /api/users/me/stats
 * Aggregated stats for dashboard and Lumina level: score, level, last journal,
 * entries this week, mood, streak, consistency, etc.
 */
export async function GET(req: NextRequest) {
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
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
    startOfWeek.setUTCHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(now.getUTCDate() - 30);

    const [
      entriesThisWeek,
      lastEntry,
      moodAgg,
      entryDatesLast30,
      allEntriesForStreak,
      totalEntries,
      gratitudeCount,
      wordCounts,
      notification,
      qualityAgg,
      promptsCompletedLast30,
    ] = await Promise.all([
      prisma.journalEntry.count({
        where: {
          journal: { authorId: userId },
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.journalEntry.findFirst({
        where: { journal: { authorId: userId } },
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
          journal: { select: { id: true, title: true } },
        },
      }),
      prisma.entryMood.aggregate({
        where: { entry: { journal: { authorId: userId } } },
        _avg: { score: true },
        _count: true,
      }),
      prisma.journalEntry.findMany({
        where: {
          journal: { authorId: userId },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true },
      }),
      prisma.journalEntry.findMany({
        where: { journal: { authorId: userId } },
        select: { createdAt: true },
      }),
      prisma.journalEntry.count({
        where: { journal: { authorId: userId } },
      }),
      prisma.journalEntry.count({
        where: {
          journal: { authorId: userId },
          OR: [
            { mood: { isNot: null } },
            {
              tags: {
                some: { tag: { equals: "gratitude", mode: "insensitive" } },
              },
            },
          ],
        },
      }),
      prisma.journalEntry.findMany({
        where: { journal: { authorId: userId } },
        select: { content: true },
      }),
      prisma.notification.findUnique({
        where: { authorId: userId },
        select: { dailyReminderEnabled: true },
      }),
      prisma.entrySummary.aggregate({
        where: { entry: { journal: { authorId: userId } } },
        _avg: { qualityScore: true },
        _count: { qualityScore: true },
      }),
      prisma.promptCompletion.count({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    const lastJournal = lastEntry
      ? {
          title: lastEntry.journal.title,
          journalId: lastEntry.journal.id,
          daysAgo: Math.floor(
            (now.getTime() - lastEntry.createdAt.getTime()) /
              (24 * 60 * 60 * 1000),
          ),
        }
      : null;

    const moodScore =
      moodAgg._count > 0 && moodAgg._avg.score != null
        ? Math.round(moodAgg._avg.score * 10) / 10
        : null;

    const entryDates = allEntriesForStreak.map((e) => e.createdAt);
    const currentStreak = computeStreak(entryDates);

    const distinctDays30 = new Set(
      entryDatesLast30.map((e) => e.createdAt.toISOString().slice(0, 10)),
    ).size;
    const consistency = Math.min(100, Math.round((distinctDays30 / 30) * 100));

    const missedScheduledDays =
      notification?.dailyReminderEnabled === true
        ? Math.max(0, 30 - distinctDays30)
        : 0;

    const entryQualityScore =
      qualityAgg._count.qualityScore > 0 && qualityAgg._avg.qualityScore != null
        ? Math.round(qualityAgg._avg.qualityScore * 10) / 10
        : null;

    const luminaScore = computeLuminaScore({
      totalEntries,
      currentStreak,
      consistency,
      avgQualityScore: entryQualityScore,
      promptsCompletedLast30,
      missedScheduledDays,
    });
    const luminaLevel = levelFromScore(luminaScore);

    const totalWords = wordCounts.reduce(
      (sum, e) =>
        sum + (e.content.trim().split(/\s+/).filter(Boolean).length || 0),
      0,
    );
    const wordsPerEntry =
      wordCounts.length > 0
        ? Math.round((totalWords / wordCounts.length) * 10) / 10
        : null;

    const data = {
      luminaScore,
      luminaLevel,
      lastJournal,
      entriesThisWeek,
      moodScore,
      entryQualityScore,
      currentStreak,
      reflections: totalEntries,
      gratitudeEntries: gratitudeCount,
      wordsPerEntry,
      consistency,
      promptsCompleted: promptsCompletedLast30,
    };

    const res = NextResponse.json({ data });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to get stats" },
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
