import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { Theme } from "@/app/generated/prisma/enums";

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
  try {
    let prefs = await prisma.userPrefferences.findUnique({
      where: { authorId: auth.user.id },
    });
    if (!prefs) {
      prefs = await prisma.userPrefferences.create({
        data: { authorId: auth.user.id },
      });
    }
    const res = NextResponse.json({ data: prefs });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to get preferences" },
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

export async function PATCH(req: NextRequest) {
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
    const updates: {
      theme?: Theme;
      goal?: string | null;
      topics?: string | null;
      reason?: string | null;
    } = {};
    if (body?.theme && Object.values(Theme).includes(body.theme)) {
      updates.theme = body.theme;
    }
    if (body?.goal !== undefined)
      updates.goal = typeof body.goal === "string" ? body.goal : null;
    if (body?.topics !== undefined)
      updates.topics = typeof body.topics === "string" ? body.topics : null;
    if (body?.reason !== undefined)
      updates.reason = typeof body.reason === "string" ? body.reason : null;
    const prefs = await prisma.userPrefferences.upsert({
      where: { authorId: auth.user.id },
      create: {
        authorId: auth.user.id,
        ...updates,
      },
      update: updates,
    });
    const res = NextResponse.json({ data: prefs });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to update preferences" },
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
