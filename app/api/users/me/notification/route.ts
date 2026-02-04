import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { NotificationFrequency } from "@/app/generated/prisma/enums";

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
    let notif = await prisma.notification.findUnique({
      where: { authorId: auth.user.id },
    });
    if (!notif) {
      notif = await prisma.notification.create({
        data: { authorId: auth.user.id },
      });
    }
    const res = NextResponse.json({ data: notif });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to get notification settings" },
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
      dailyReminderEnabled?: boolean;
      dailyReminderTime?: string | null;
      timezone?: string | null;
      frequency?: NotificationFrequency | null;
    } = {};
    if (typeof body?.dailyReminderEnabled === "boolean")
      updates.dailyReminderEnabled = body.dailyReminderEnabled;
    if (body?.dailyReminderTime !== undefined)
      updates.dailyReminderTime =
        typeof body.dailyReminderTime === "string"
          ? body.dailyReminderTime
          : null;
    if (body?.timezone !== undefined)
      updates.timezone =
        typeof body.timezone === "string" ? body.timezone : null;
    if (body?.frequency !== undefined) {
      updates.frequency =
        body.frequency &&
        Object.values(NotificationFrequency).includes(body.frequency)
          ? body.frequency
          : null;
    }
    const notif = await prisma.notification.upsert({
      where: { authorId: auth.user.id },
      create: {
        authorId: auth.user.id,
        ...updates,
      },
      update: updates,
    });
    const res = NextResponse.json({ data: notif });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to update notification settings" },
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
