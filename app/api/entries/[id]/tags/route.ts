import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { TagSource } from "@/app/generated/prisma/enums";

const prisma = new PrismaClient();

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
    const body = await req.json();
    const tag = typeof body?.tag === "string" ? body.tag.trim() : "";
    if (!tag) {
      const res = NextResponse.json(
        { error: "tag is required" },
        { status: 400 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 400,
      });
    }
    const created = await prisma.entryTag.upsert({
      where: {
        entryId_tag: { entryId: entry.id, tag },
      },
      create: {
        entryId: entry.id,
        tag,
        source: TagSource.USER,
      },
      update: {},
    });
    const res = NextResponse.json({ data: created }, { status: 201 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 201,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to add tag" },
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
