import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { isValidExpoPushToken } from "@/app/api/_lib/push";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * POST /api/users/me/push-tokens
 * Register or update an Expo push token for the current user (upsert by token).
 */
export async function POST(req: NextRequest) {
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
    const body = await req.json();
    const expoPushToken =
      typeof body?.expoPushToken === "string" ? body.expoPushToken.trim() : "";
    if (!expoPushToken || !isValidExpoPushToken(expoPushToken)) {
      return finishRequest(
        req,
        NextResponse.json(
          { error: "Valid expoPushToken (ExponentPushToken[...]) is required" },
          { status: 400 },
        ),
        { requestId, start, statusCode: 400 },
      );
    }
    const deviceId =
      typeof body?.deviceId === "string" ? body.deviceId.trim() || null : null;
    const platform =
      body?.platform === "ios" || body?.platform === "android"
        ? body.platform
        : null;

    await prisma.pushToken.upsert({
      where: { expoPushToken },
      create: {
        expoPushToken,
        deviceId,
        platform,
        userId: auth.user.id,
      },
      update: {
        userId: auth.user.id,
        deviceId: deviceId ?? undefined,
        platform: platform ?? undefined,
      },
    });

    const res = NextResponse.json({ data: { registered: true } }, { status: 201 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 201,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to register push token" },
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

/**
 * DELETE /api/users/me/push-tokens
 * Remove an Expo push token (e.g. on logout or when user disables notifications).
 * Body: { expoPushToken: string } or query: ?expoPushToken=...
 */
export async function DELETE(req: NextRequest) {
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
    let expoPushToken: string | null = null;
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      expoPushToken =
        typeof body?.expoPushToken === "string" ? body.expoPushToken.trim() : null;
    }
    if (!expoPushToken) {
      expoPushToken = req.nextUrl.searchParams.get("expoPushToken");
    }
    if (!expoPushToken) {
      return finishRequest(
        req,
        NextResponse.json(
          { error: "expoPushToken required (body or query)" },
          { status: 400 },
        ),
        { requestId, start, statusCode: 400 },
      );
    }

    await prisma.pushToken.deleteMany({
      where: {
        expoPushToken,
        userId: auth.user.id,
      },
    });

    const res = NextResponse.json({ data: { removed: true } });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to remove push token" },
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
