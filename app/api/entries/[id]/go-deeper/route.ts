import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { entriesCompletion } from "@/app/api/_lib/openrouter";

const prisma = new PrismaClient();

const GO_DEEPER_SYSTEM = `You are a thoughtful journaling coach. Given a journal entry (or draft), suggest 2-4 short, insightful questions that would help the writer go deeper: reflect more, add detail, or explore their feelings. Be warm and specific. Respond with a JSON object only: { "questions": ["question one?", "question two?", ...] }. No other text.`;

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

function parseGoDeeperJson(raw: string): string[] | null {
  const trimmed = raw
    .trim()
    .replace(/^```json?\s*|\s*```$/g, "")
    .trim();
  try {
    const o = JSON.parse(trimmed) as unknown;
    if (typeof o !== "object" || o === null) return null;
    const q = (o as Record<string, unknown>).questions;
    if (!Array.isArray(q)) return null;
    return q.filter((x): x is string => typeof x === "string").slice(0, 6);
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
    let contentToUse = entry.content;
    try {
      const body = await req.json();
      if (
        typeof body?.currentContent === "string" &&
        body.currentContent.trim()
      )
        contentToUse = body.currentContent.trim();
    } catch {
      // no body or invalid JSON
    }
    const { content } = await entriesCompletion(
      [
        { role: "system", content: GO_DEEPER_SYSTEM },
        { role: "user", content: `Entry:\n\n${contentToUse}` },
      ],
      { temperature: 0.6, maxTokens: 400 },
    );
    const questions = parseGoDeeperJson(content);
    const list =
      Array.isArray(questions) && questions.length > 0 ? questions : [];
    await prisma.promptCompletion.create({
      data: {
        userId: auth.user.id,
        source: "go_deeper",
        entryId: entry.id,
      },
    });
    const res = NextResponse.json({ data: { questions: list } });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: err.message ?? "Failed to get go-deeper questions" },
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
