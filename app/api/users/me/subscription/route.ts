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
 * GET /api/users/me/subscription
 * Return subscription status so the app can show "Manage subscription" vs "Upgrade".
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
  try {
    const billing = await prisma.billing.findUnique({
      where: { userId: auth.user.id },
      select: { status: true, plan: true },
    });
    const status =
      billing?.status === "active" ||
      billing?.status === "trialing" ||
      billing?.status === "past_due" ||
      billing?.status === "canceled"
        ? billing.status
        : null;
    const data = {
      status: status as "active" | "canceled" | "past_due" | "trialing" | null,
      planId: billing?.plan ?? undefined,
    };
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
      { error: "Failed to get subscription" },
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
