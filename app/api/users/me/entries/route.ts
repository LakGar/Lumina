import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { checkRateLimit } from "@/app/api/_lib/rate-limit";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

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
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 50, 100);
  const rate = checkRateLimit(String(auth.user.id));
  if (!rate.ok) {
    const res = NextResponse.json(
      { error: "Too many requests", retryAfter: rate.retryAfter },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 429,
    });
  }
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { journal: { authorId: auth.user.id } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        journal: { select: { id: true, title: true } },
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
