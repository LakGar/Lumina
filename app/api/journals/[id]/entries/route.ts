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
    const entries = await prisma.journalEntry.findMany({
      where: { journalId: journal.id },
      orderBy: { createdAt: "desc" },
      include: {
        summary: true,
        mood: true,
        tags: true,
      },
    });
    const res = NextResponse.json({ data: entries });
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
    const res = NextResponse.json({ data: entry }, { status: 201 });
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
