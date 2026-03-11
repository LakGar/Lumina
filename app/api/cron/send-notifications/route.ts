import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/app/api/_lib/email";
import { sendExpoPush } from "@/app/api/_lib/push";

const prisma = new PrismaClient();

const DAILY_REMINDER_TITLE = "Time for your daily journal";
const DAILY_REMINDER_BODY = "A few minutes of reflection can make a big difference.";

function getLocalTimeInTimezone(timezone: string | null): { hour: number; minute: number; dateISO: string } {
  const tz = timezone && timezone.trim() ? timezone.trim() : "UTC";
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const dateParts = dateFormatter.formatToParts(now);
  const y = dateParts.find((p) => p.type === "year")?.value ?? "";
  const m = dateParts.find((p) => p.type === "month")?.value?.padStart(2, "0") ?? "";
  const d = dateParts.find((p) => p.type === "day")?.value?.padStart(2, "0") ?? "";
  const dateISO = `${y}-${m}-${d}`;
  return { hour, minute, dateISO };
}

/** Parse "HH:mm" to minutes since midnight. */
function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const h = parseInt(match[1]!, 10);
  const m = parseInt(match[2]!, 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Current 15-minute bucket start (e.g. 9:00, 9:15, 9:30, 9:45). */
function currentBucketMinutes(hour: number, minute: number): number {
  const total = hour * 60 + minute;
  return Math.floor(total / 15) * 15;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cronSecret = req.headers.get("x-vercel-cron-secret");
  const valid = secret && (bearer === secret || cronSecret === secret);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let dailyCount = 0;
    let calendarCount = 0;

    // —— Daily reminders ——
    const notifications = await prisma.notification.findMany({
      where: {
        dailyReminderEnabled: true,
        dailyReminderTime: { not: null },
      },
      include: {
        author: { select: { id: true, email: true } },
      },
    });

    for (const notif of notifications) {
      const time = notif.dailyReminderTime!;
      const reminderMinutes = parseTimeToMinutes(time);
      if (reminderMinutes === null) continue;

      const { hour, minute } = getLocalTimeInTimezone(notif.timezone);
      const bucket = currentBucketMinutes(hour, minute);
      if (bucket !== reminderMinutes) continue;

      const userId = notif.authorId;
      const userEmail = notif.author.email;
      let sent = false;

      const tokens = await prisma.pushToken.findMany({
        where: { userId },
        select: { expoPushToken: true },
      });
      const expoTokens = tokens.map((t) => t.expoPushToken);
      if (expoTokens.length > 0) {
        try {
          const { invalidTokens } = await sendExpoPush({
            to: expoTokens,
            title: DAILY_REMINDER_TITLE,
            body: DAILY_REMINDER_BODY,
            data: { type: "daily_reminder" },
          });
          if (invalidTokens?.length) {
            await prisma.pushToken.deleteMany({
              where: { expoPushToken: { in: invalidTokens } },
            });
          }
          sent = true;
        } catch (_) {
          // log and continue
        }
      }

      if (notif.emailRemindersEnabled && userEmail) {
        const result = await sendEmail(
          userEmail,
          DAILY_REMINDER_TITLE,
          `<p>${DAILY_REMINDER_BODY}</p><p>— Lumina</p>`,
        );
        if (result.ok) sent = true;
      }
      if (sent) dailyCount += 1;
    }

    // —— Calendar reminders (due in current 15-min window in user TZ) ——
    const reminders = await prisma.reminder.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            notification: { select: { timezone: true, emailRemindersEnabled: true } },
          },
        },
      },
    });

    for (const rem of reminders) {
      const tz = rem.author.notification?.timezone ?? null;
      const { hour, minute, dateISO } = getLocalTimeInTimezone(tz);
      const bucket = currentBucketMinutes(hour, minute);
      const remMinutes = parseTimeToMinutes(rem.time);
      if (remMinutes === null) continue;
      if (rem.dateISO !== dateISO) continue;
      if (bucket !== remMinutes) continue;

      const userId = rem.authorId;
      const userEmail = rem.author.email;

      const tokens = await prisma.pushToken.findMany({
        where: { userId },
        select: { expoPushToken: true },
      });
      const expoTokens = tokens.map((t) => t.expoPushToken);
      if (expoTokens.length > 0) {
        try {
          const { invalidTokens } = await sendExpoPush({
            to: expoTokens,
            title: rem.title,
            body: `Reminder at ${rem.time}`,
            data: { type: "reminder", reminderId: rem.id },
          });
          if (invalidTokens?.length) {
            await prisma.pushToken.deleteMany({
              where: { expoPushToken: { in: invalidTokens } },
            });
          }
        } catch (_) {}
        calendarCount += 1;
      }

      const emailEnabled = rem.author.notification?.emailRemindersEnabled !== false;
      if (emailEnabled && userEmail) {
        await sendEmail(
          userEmail,
          `Reminder: ${rem.title}`,
          `<p>${rem.title}</p><p>Time: ${rem.time}</p><p>— Lumina</p>`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      dailyReminders: dailyCount,
      calendarReminders: calendarCount,
    });
  } catch (e) {
    console.error("Cron send-notifications error:", e);
    return NextResponse.json(
      { error: "Cron processing failed" },
      { status: 500 },
    );
  }
}
