import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { chatCompletion } from "@/app/api/_lib/openrouter";

const prisma = new PrismaClient();

const TIP_SYSTEM = `You are Lumina's insight coach. Based on the user's journaling stats and recent activity, generate ONE weekly tip that is genuinely helpful and specific to their situation. Consider:
- If they're missing scheduled journaling or have low consistency, suggest a small habit or reminder.
- If entry quality or depth seems to be dropping, offer a reflection prompt or "go deeper" idea.
- If they have a streak, encourage it and suggest how to keep it.
- Always be warm, non-judgmental, and actionable.
Respond with a JSON object only (no markdown, no extra text):
{
  "title": "Short title (e.g. 3–6 words)",
  "shortDescription": "1–2 sentences for a card or list.",
  "detailedText": "Markdown-friendly detailed advice. Use **bold** and lists where helpful. Several paragraphs or bullet points are fine.",
  "tipType": "missed_journal" | "quality_down" | "streak" | "consistency" | "general"
}`;

export async function OPTIONS() {
  return corsPreflight();
}

function parseTipJson(raw: string): {
  title: string;
  shortDescription: string;
  detailedText: string;
  tipType: string;
} | null {
  const trimmed = raw
    .trim()
    .replace(/^```json?\s*|\s*```$/g, "")
    .trim();
  try {
    const o = JSON.parse(trimmed) as unknown;
    if (typeof o !== "object" || o === null) return null;
    const t = o as Record<string, unknown>;
    const title = typeof t.title === "string" ? t.title.trim() : "";
    const shortDescription =
      typeof t.shortDescription === "string" ? t.shortDescription.trim() : "";
    const detailedText =
      typeof t.detailedText === "string" ? t.detailedText.trim() : "";
    const tipType =
      typeof t.tipType === "string" ? t.tipType.trim() : "general";
    if (!title || !shortDescription || !detailedText) return null;
    return { title, shortDescription, detailedText, tipType };
  } catch {
    return null;
  }
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
    const userId = auth.user.id;
    const [prefs, notification, entriesThisWeek, lastEntry, recentEntries] =
      await Promise.all([
        prisma.userPrefferences.findUnique({
          where: { authorId: userId },
          select: { goal: true, topics: true, reason: true },
        }),
        prisma.notification.findUnique({
          where: { authorId: userId },
          select: { dailyReminderEnabled: true, dailyReminderTime: true },
        }),
        prisma.journalEntry.count({
          where: {
            journal: { authorId: userId },
            createdAt: {
              gte: (() => {
                const n = new Date();
                n.setUTCDate(n.getUTCDate() - ((n.getUTCDay() + 6) % 7));
                n.setUTCHours(0, 0, 0, 0);
                return n;
              })(),
            },
          },
        }),
        prisma.journalEntry.findFirst({
          where: { journal: { authorId: userId } },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
        prisma.journalEntry.findMany({
          where: { journal: { authorId: userId } },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            content: true,
            createdAt: true,
            summary: true,
            mood: true,
          },
        }),
      ]);
    const lastJournalDaysAgo = lastEntry
      ? Math.floor(
          (Date.now() - lastEntry.createdAt.getTime()) / (24 * 60 * 60 * 1000),
        )
      : null;
    const context = [
      `Journaling goal: ${prefs?.goal ?? "not set"}`,
      `Topics of interest: ${prefs?.topics ?? "not set"}`,
      `Reason for journaling: ${prefs?.reason ?? "not set"}`,
      `Entries this week: ${entriesThisWeek}`,
      `Days since last entry: ${lastJournalDaysAgo ?? "never"}`,
      `Daily reminder: ${notification?.dailyReminderEnabled ? "on" : "off"}${notification?.dailyReminderTime ? ` at ${notification.dailyReminderTime}` : ""}`,
      "Recent entries (summaries/content snippets):",
      ...recentEntries.map(
        (e) =>
          `- ${e.createdAt.toISOString().slice(0, 10)}: ${(e.summary?.text ?? e.content.slice(0, 200)).replace(/\n/g, " ")}`,
      ),
    ].join("\n");
    const { content } = await chatCompletion(
      [
        { role: "system", content: TIP_SYSTEM },
        { role: "user", content: `User context:\n\n${context}` },
      ],
      { temperature: 0.6, maxTokens: 800 },
    );
    const parsed = parseTipJson(content);
    if (!parsed) {
      const res = NextResponse.json(
        { error: "AI did not return a valid weekly tip" },
        { status: 502 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 502,
      });
    }
    const tip = await prisma.weeklyTip.create({
      data: {
        userId,
        title: parsed.title,
        shortDescription: parsed.shortDescription,
        detailedText: parsed.detailedText,
        tipType: parsed.tipType,
      },
    });
    const res = NextResponse.json({
      data: {
        id: tip.id,
        title: tip.title,
        shortDescription: tip.shortDescription,
        detailedText: tip.detailedText,
        tipType: tip.tipType,
        readAt: tip.readAt?.toISOString() ?? null,
        createdAt: tip.createdAt.toISOString(),
      },
    });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 201,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: err.message ?? "Failed to generate weekly tip" },
      { status: 502 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 502,
      errorName: err.name,
      errorMessage: err.message,
    });
  }
}
