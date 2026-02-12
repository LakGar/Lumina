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

/**
 * GET /api/users/me/reminders
 * List reminders. Optional query: from, to (YYYY-MM-DD) to filter by date.
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
    const fromParam = req.nextUrl.searchParams.get("from");
    const toParam = req.nextUrl.searchParams.get("to");
    const where: {
      authorId: number;
      dateISO?: { gte?: string; lte?: string };
    } = {
      authorId: auth.user.id,
    };
    if (fromParam && DATE_RE.test(fromParam)) {
      where.dateISO = { ...where.dateISO, gte: fromParam };
    }
    if (toParam && DATE_RE.test(toParam)) {
      where.dateISO = { ...where.dateISO, lte: toParam };
    }
    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: [{ dateISO: "asc" }, { time: "asc" }],
    });
    const data = reminders.map((r) => ({
      id: r.id,
      dateISO: r.dateISO,
      time: r.time,
      repeat: r.repeat,
      title: r.title,
      journalId: r.journalId,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
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
      { error: "Failed to list reminders" },
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
 * POST /api/users/me/reminders
 * Create a reminder.
 * Body: { dateISO, time, repeat?, title, journalId? }
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
    const dateISO =
      typeof body?.dateISO === "string" ? body.dateISO.trim() : "";
    const time = typeof body?.time === "string" ? body.time.trim() : "";
    const repeat = REPEAT_VALUES.includes(body?.repeat) ? body.repeat : "none";
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const journalId =
      body?.journalId != null
        ? typeof body.journalId === "number"
          ? body.journalId
          : parseInt(String(body.journalId), 10)
        : null;

    if (!dateISO || !DATE_RE.test(dateISO)) {
      const res = NextResponse.json(
        { error: "dateISO required (YYYY-MM-DD)" },
        { status: 400 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 400,
      });
    }
    if (!time || !TIME_RE.test(time)) {
      const res = NextResponse.json(
        { error: "time required (HH:mm)" },
        { status: 400 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 400,
      });
    }
    if (!title) {
      const res = NextResponse.json(
        { error: "title required" },
        { status: 400 },
      );
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 400,
      });
    }

    if (journalId != null && !Number.isNaN(journalId)) {
      const journal = await prisma.journal.findFirst({
        where: { id: journalId, authorId: auth.user.id },
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

    const reminder = await prisma.reminder.create({
      data: {
        authorId: auth.user.id,
        dateISO,
        time,
        repeat,
        title,
        journalId:
          journalId != null && !Number.isNaN(journalId) ? journalId : null,
      },
    });
    const data = {
      id: reminder.id,
      dateISO: reminder.dateISO,
      time: reminder.time,
      repeat: reminder.repeat,
      title: reminder.title,
      journalId: reminder.journalId,
      createdAt: reminder.createdAt.toISOString(),
      updatedAt: reminder.updatedAt.toISOString(),
    };
    const res = NextResponse.json({ data }, { status: 201 });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 201,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to create reminder" },
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
