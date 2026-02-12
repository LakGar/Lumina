import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * GET /api/users/me/weekly-tips
 * List recent weekly tips for the current user (newest first).
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
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit")) || 10,
    50,
  );
  try {
    const tips = await prisma.weeklyTip.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const data = tips.map((t) => ({
      id: t.id,
      title: t.title,
      shortDescription: t.shortDescription,
      detailedText: t.detailedText,
      tipType: t.tipType,
      readAt: t.readAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    }));
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
      { error: "Failed to list weekly tips" },
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
