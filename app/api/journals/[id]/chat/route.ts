import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { chatCompletion } from "@/app/api/_lib/openrouter";

const prisma = new PrismaClient();

const CHAT_SYSTEM_PREFIX = `You are Lumina's supportive journaling coach. You have access to the user's journal and recent entries for context. You can:
- Discuss their entries and patterns, offer reflections and gentle insights.
- Suggest updates to their journaling goals or topics when it feels natural (you may say e.g. "Would you like me to update your goal to ...?" and they can confirm).
- Give one weekly tip when relevant (e.g. if they're missing scheduled journaling or quality is slipping): include a clear title, a short description, and detailed actionable advice.
Be concise, warm, and insightful. Do not make up entry content; only refer to what you're given.`;

const MAX_CONTEXT_ENTRIES = 20;
const MAX_HISTORY_MESSAGES = 30;

export async function OPTIONS() {
  return corsPreflight();
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
  const { id: journalIdParam } = await params;
  const journalId = parseInt(journalIdParam, 10);
  if (Number.isNaN(journalId)) {
    const res = NextResponse.json(
      { error: "Invalid journal id" },
      { status: 400 },
    );
    return finishRequest(req, res, { requestId, start, statusCode: 400 });
  }
  const journal = await prisma.journal.findFirst({
    where: { id: journalId, authorId: auth.user.id },
    include: {
      entries: {
        orderBy: { createdAt: "desc" },
        take: MAX_CONTEXT_ENTRIES,
        select: {
          id: true,
          content: true,
          createdAt: true,
          summary: true,
          mood: true,
          tags: { select: { tag: true } },
        },
      },
    },
  });
  if (!journal) {
    const res = NextResponse.json(
      { error: "Journal not found" },
      { status: 404 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 404,
    });
  }
  let body: { message?: string; sessionId?: number };
  try {
    body = await req.json();
  } catch {
    const res = NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 400,
    });
  }
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    const res = NextResponse.json(
      { error: "message is required" },
      { status: 400 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 400,
    });
  }
  let sessionId =
    typeof body?.sessionId === "number" ? body.sessionId : undefined;
  let session: {
    id: number;
    messages: { role: string; content: string }[];
  } | null = null;
  if (sessionId != null) {
    const s = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: auth.user.id, journalId: journal.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: MAX_HISTORY_MESSAGES,
          select: { role: true, content: true },
        },
      },
    });
    session = s;
  }
  if (!session) {
    const newSession = await prisma.chatSession.create({
      data: { userId: auth.user.id, journalId: journal.id },
    });
    session = { id: newSession.id, messages: [] };
    sessionId = newSession.id;
  }
  const contextEntries = journal.entries
    .map((e) => {
      const parts = [
        `[${e.createdAt.toISOString()}]`,
        e.content,
        e.summary?.text ? `Summary: ${e.summary.text}` : "",
        e.mood?.label ? `Mood: ${e.mood.label}` : "",
        e.tags.length ? `Tags: ${e.tags.map((t) => t.tag).join(", ")}` : "",
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n---\n\n");
  const systemContent = `${CHAT_SYSTEM_PREFIX}\n\nJournal: "${journal.title}"\n\nRecent entries (for context only):\n\n${contextEntries || "(No entries yet)"}`;
  const openRouterMessages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[] = [
    { role: "system", content: systemContent },
    ...session.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
    { role: "user", content: message },
  ];
  try {
    const { content: reply } = await chatCompletion(openRouterMessages, {
      maxTokens: 1024,
      temperature: 0.7,
    });
    await prisma.$transaction([
      prisma.chatMessage.create({
        data: { sessionId: session.id, role: "user", content: message },
      }),
      prisma.chatMessage.create({
        data: { sessionId: session.id, role: "assistant", content: reply },
      }),
    ]);
    const res = NextResponse.json({
      data: { reply, sessionId: session.id },
    });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: err.message ?? "Chat request failed" },
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
