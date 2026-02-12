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
 * PATCH /api/users/me/weekly-tips/[id]/read
 * Mark a weekly tip as read.
 */
export async function PATCH(
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
  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    const res = NextResponse.json({ error: "Invalid tip id" }, { status: 400 });
    return finishRequest(req, res, { requestId, start, statusCode: 400 });
  }
  try {
    const tip = await prisma.weeklyTip.findFirst({
      where: { id, userId: auth.user.id },
    });
    if (!tip) {
      const res = NextResponse.json(
        { error: "Tip not found" },
        { status: 404 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 404,
      });
    }
    await prisma.weeklyTip.update({
      where: { id },
      data: { readAt: new Date() },
    });
    const res = new NextResponse(null, { status: 204 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 204,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to mark tip as read" },
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
