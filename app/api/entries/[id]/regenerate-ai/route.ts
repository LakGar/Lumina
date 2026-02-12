import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { entriesCompletion } from "@/app/api/_lib/openrouter";

const prisma = new PrismaClient();

const ENTRY_AI_SYSTEM = `You are a supportive journaling assistant. Given a journal entry, respond with a JSON object only (no markdown, no explanation) with these exact keys:
- summary: string (1-2 sentence concise summary)
- mood: string (single word or short phrase, e.g. "calm", "anxious", "grateful")
- tags: string[] (3-6 short tags like "work", "relationships", "health", "gratitude")
- qualityScore: number 0-100 (reflects depth, clarity, and reflection quality)`;

export async function OPTIONS() {
  return corsPreflight();
}

async function getEntryAndCheckOwnership(entryId: string, userId: number) {
  const id = parseInt(entryId, 10);
  if (Number.isNaN(id)) return { entry: null, error: "Invalid id" as const };
  const entry = await prisma.journalEntry.findFirst({
    where: {
      id,
      journal: { authorId: userId },
    },
  });
  return { entry, error: entry ? null : ("not_found" as const) };
}

function parseEntryAiJson(raw: string): {
  summary: string;
  mood: string;
  tags: string[];
  qualityScore?: number;
} | null {
  const trimmed = raw
    .trim()
    .replace(/^```json?\s*|\s*```$/g, "")
    .trim();
  try {
    const o = JSON.parse(trimmed) as unknown;
    if (typeof o !== "object" || o === null) return null;
    const summary =
      typeof (o as Record<string, unknown>).summary === "string"
        ? ((o as Record<string, unknown>).summary as string)
        : "";
    const mood =
      typeof (o as Record<string, unknown>).mood === "string"
        ? ((o as Record<string, unknown>).mood as string)
        : "";
    const tags = Array.isArray((o as Record<string, unknown>).tags)
      ? ((o as Record<string, unknown>).tags as unknown[])
          .filter((t): t is string => typeof t === "string")
          .slice(0, 10)
      : [];
    let qualityScore: number | undefined;
    const q = (o as Record<string, unknown>).qualityScore;
    if (typeof q === "number" && q >= 0 && q <= 100) qualityScore = q;
    return { summary, mood, tags, qualityScore };
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
  const { id } = await params;
  const { entry, error } = await getEntryAndCheckOwnership(id, auth.user.id);
  if (error === "Invalid id") {
    const res = NextResponse.json({ error: "Invalid id" }, { status: 400 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 400,
    });
  }
  if (error === "not_found" || !entry) {
    const res = NextResponse.json(
      { error: "Entry not found" },
      { status: 404 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 404,
    });
  }
  try {
    const { content } = await entriesCompletion(
      [
        { role: "system", content: ENTRY_AI_SYSTEM },
        { role: "user", content: `Journal entry:\n\n${entry.content}` },
      ],
      { temperature: 0.3, maxTokens: 512 },
    );
    const parsed = parseEntryAiJson(content);
    if (!parsed || !parsed.summary) {
      const res = NextResponse.json(
        { error: "AI did not return valid summary/mood/tags" },
        { status: 502 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 502,
      });
    }
    const moodLabel = parsed.mood.trim() || "neutral";
    const qualityScore =
      parsed.qualityScore != null &&
      parsed.qualityScore >= 0 &&
      parsed.qualityScore <= 100
        ? parsed.qualityScore
        : null;

    await prisma.$transaction(async (tx) => {
      await tx.entrySummary.upsert({
        where: { entryId: entry.id },
        create: {
          entryId: entry.id,
          text: parsed.summary,
          model: "openrouter",
          qualityScore,
        },
        update: {
          text: parsed.summary,
          model: "openrouter",
          qualityScore,
        },
      });
      await tx.entryMood.upsert({
        where: { entryId: entry.id },
        create: {
          entryId: entry.id,
          label: moodLabel,
          score: qualityScore != null ? qualityScore / 100 : null,
        },
        update: {
          label: moodLabel,
          score: qualityScore != null ? qualityScore / 100 : null,
        },
      });
      await tx.entryTag.deleteMany({
        where: { entryId: entry.id, source: "AI" },
      });
      for (const tag of parsed.tags.slice(0, 10)) {
        const t = tag.trim();
        if (!t) continue;
        await tx.entryTag.upsert({
          where: {
            entryId_tag: { entryId: entry.id, tag: t },
          },
          create: { entryId: entry.id, tag: t, source: "AI" },
          update: {},
        });
      }
    });

    const updated = await prisma.journalEntry.findUnique({
      where: { id: entry.id },
      include: { summary: true, mood: true, tags: true },
    });
    const res = NextResponse.json({ data: updated });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: err.message ?? "Failed to regenerate AI" },
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
