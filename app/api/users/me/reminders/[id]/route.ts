import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";

const prisma = new PrismaClient();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const REPEAT_VALUES = ["none", "daily", "weekdays", "weekly"] as const;

export async function OPTIONS() {
  return corsPreflight();
}

async function getReminderAndCheckOwnership(
  reminderId: string,
  userId: number,
) {
  const id = parseInt(reminderId, 10);
  if (Number.isNaN(id)) return { reminder: null, error: "Invalid id" as const };
  const reminder = await prisma.reminder.findFirst({
    where: { id, authorId: userId },
  });
  return { reminder, error: reminder ? null : ("not_found" as const) };
}

/**
 * PATCH /api/users/me/reminders/[id]
 * Update a reminder. Body: dateISO?, time?, repeat?, title?, journalId?
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
  const { id } = await params;
  const { reminder, error } = await getReminderAndCheckOwnership(
    id,
    auth.user.id,
  );
  if (error === "Invalid id") {
    const res = NextResponse.json({ error: "Invalid id" }, { status: 400 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 400,
    });
  }
  if (error === "not_found" || !reminder) {
    const res = NextResponse.json(
      { error: "Reminder not found" },
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
    const body = await req.json().catch(() => ({}));
    const updates: {
      dateISO?: string;
      time?: string;
      repeat?: string;
      title?: string;
      journalId?: number | null;
    } = {};
    if (
      typeof body?.dateISO === "string" &&
      DATE_RE.test(body.dateISO.trim())
    ) {
      updates.dateISO = body.dateISO.trim();
    }
    if (typeof body?.time === "string" && TIME_RE.test(body.time.trim())) {
      updates.time = body.time.trim();
    }
    if (REPEAT_VALUES.includes(body?.repeat)) {
      updates.repeat = body.repeat;
    }
    if (typeof body?.title === "string") {
      updates.title = body.title.trim();
    }
    if (body?.journalId !== undefined) {
      const j = body.journalId;
      updates.journalId =
        j === null || j === ""
          ? null
          : typeof j === "number"
            ? j
            : parseInt(String(j), 10);
      if (updates.journalId != null && !Number.isNaN(updates.journalId)) {
        const journal = await prisma.journal.findFirst({
          where: { id: updates.journalId, authorId: auth.user.id },
        });
        if (!journal) {
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
      }
    }

    const updated = await prisma.reminder.update({
      where: { id: reminder.id },
      data: updates,
    });
    const data = {
      id: updated.id,
      dateISO: updated.dateISO,
      time: updated.time,
      repeat: updated.repeat,
      title: updated.title,
      journalId: updated.journalId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
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
      { error: "Failed to update reminder" },
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
 * DELETE /api/users/me/reminders/[id]
 */
export async function DELETE(
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
  const { reminder, error } = await getReminderAndCheckOwnership(
    id,
    auth.user.id,
  );
  if (error === "Invalid id") {
    const res = NextResponse.json({ error: "Invalid id" }, { status: 400 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 400,
    });
  }
  if (error === "not_found" || !reminder) {
    const res = NextResponse.json(
      { error: "Reminder not found" },
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
    await prisma.reminder.delete({ where: { id: reminder.id } });
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
      { error: "Failed to delete reminder" },
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
