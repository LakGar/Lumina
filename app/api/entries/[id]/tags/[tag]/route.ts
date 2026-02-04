import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tag: string }> },
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
  const { id, tag: tagParam } = await params;
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
  const tag = decodeURIComponent(tagParam);
  try {
    await prisma.entryTag.deleteMany({
      where: {
        entryId: entry.id,
        tag,
        source: "USER",
      },
    });
    const res = NextResponse.json({ success: true });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to remove tag" },
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
