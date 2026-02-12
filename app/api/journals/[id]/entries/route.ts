import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { EntrySource } from "@/app/generated/prisma/enums";
import { TagSource } from "@/app/generated/prisma/enums";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

async function getJournalAndCheckOwnership(journalId: string, userId: number) {
  const id = parseInt(journalId, 10);
  if (Number.isNaN(id)) return { journal: null, error: "Invalid id" as const };
  const journal = await prisma.journal.findFirst({
    where: { id, authorId: userId },
  });
  return { journal, error: journal ? null : ("not_found" as const) };
}

export async function GET(
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
  const { id: journalId } = await params;
  const { journal, error } = await getJournalAndCheckOwnership(
    journalId,
    auth.user.id,
  );
  if (error === "Invalid id") {
    const res = NextResponse.json(
      { error: "Invalid journal id" },
      { status: 400 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 400,
    });
  }
  if (error === "not_found" || !journal) {
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
  try {
    const url = req.nextUrl;
    const sort = url.searchParams.get("sort") ?? "newest";
    const limit = Math.min(
      Math.max(1, Number(url.searchParams.get("limit")) || 50),
      100,
    );
    const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
    const orderBy =
      sort === "oldest"
        ? { createdAt: "asc" as const }
        : sort === "lastEdited"
          ? { updatedAt: "desc" as const }
          : { createdAt: "desc" as const };

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { journalId: journal.id },
        orderBy,
        take: limit,
        skip: offset,
        include: {
          summary: true,
          mood: true,
          tags: true,
        },
      }),
      prisma.journalEntry.count({ where: { journalId: journal.id } }),
    ]);
    const res = NextResponse.json({ data: entries, total });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to list entries" },
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
  const { id: journalId } = await params;
  const { journal, error } = await getJournalAndCheckOwnership(
    journalId,
    auth.user.id,
  );
  if (error === "Invalid id") {
    const res = NextResponse.json(
      { error: "Invalid journal id" },
      { status: 400 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 400,
    });
  }
  if (error === "not_found" || !journal) {
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
  try {
    const body = await req.json();
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) {
      const res = NextResponse.json(
        { error: "content is required" },
        { status: 400 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 400,
      });
    }
    const source =
      body?.source && Object.values(EntrySource).includes(body.source)
        ? body.source
        : EntrySource.TEXT;
    const moodLabel = typeof body?.mood === "string" ? body.mood.trim() : null;
    const tagsRaw = Array.isArray(body?.tags)
      ? body.tags
          .filter((t: unknown) => typeof t === "string")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : ([] as string[]);

    const entry = await prisma.journalEntry.create({
      data: {
        journalId: journal.id,
        content,
        source,
      },
      include: {
        summary: true,
        mood: true,
        tags: true,
      },
    });

    if (moodLabel) {
      await prisma.entryMood.upsert({
        where: { entryId: entry.id },
        create: { entryId: entry.id, label: moodLabel },
        update: { label: moodLabel },
      });
    }
    for (const tag of tagsRaw) {
      await prisma.entryTag.upsert({
        where: { entryId_tag: { entryId: entry.id, tag } },
        create: { entryId: entry.id, tag, source: TagSource.USER },
        update: {},
      });
    }

    const refreshed = await prisma.journalEntry.findUnique({
      where: { id: entry.id },
      include: { summary: true, mood: true, tags: true },
    });
    const res = NextResponse.json(
      { data: refreshed ?? entry },
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
      { error: "Failed to create entry" },
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
