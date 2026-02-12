import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { getStripe } from "@/app/api/_lib/stripe";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * POST /api/billing/sync
 * Refresh subscription status from Stripe. Use when the user has paid but our
 * DB wasn't updated (e.g. webhook missed). Requires an existing Stripe customer
 * (created when they started checkout or opened the portal).
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
    const billing = await prisma.billing.findUnique({
      where: { userId: auth.user.id },
      select: { stripeCustomerId: true, status: true, plan: true },
    });
    if (!billing?.stripeCustomerId) {
      const data = {
        status: null as "active" | "canceled" | "past_due" | "trialing" | null,
        planId: undefined as string | undefined,
      };
      const res = NextResponse.json({ data });
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 200,
      });
    }
    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({
      customer: billing.stripeCustomerId,
      status: "all",
      limit: 1,
    });
    const sub = subs.data[0];
    if (!sub) {
      await prisma.billing.updateMany({
        where: { userId: auth.user.id },
        data: {
          stripeSubscriptionId: null,
          plan: null,
          status: "canceled",
          currentPeriodEnd: null,
        },
      });
      const res = NextResponse.json({
        data: {
          status: "canceled" as const,
          planId: undefined,
        },
      });
      return finishRequest(req, res, {
        requestId,
        userId: auth.userId,
        start,
        statusCode: 200,
      });
    }
    const periodEnd =
      sub.current_period_end != null
        ? new Date(sub.current_period_end * 1000)
        : null;
    await prisma.billing.updateMany({
      where: { userId: auth.user.id },
      data: {
        stripeSubscriptionId: sub.id,
        plan:
          sub.status === "active" || sub.status === "trialing" ? "pro" : null,
        status: sub.status,
        currentPeriodEnd: periodEnd,
      },
    });
    const status =
      sub.status === "active" ||
      sub.status === "trialing" ||
      sub.status === "past_due" ||
      sub.status === "canceled"
        ? sub.status
        : null;
    const res = NextResponse.json({
      data: {
        status: status as
          | "active"
          | "canceled"
          | "past_due"
          | "trialing"
          | null,
        planId:
          sub.status === "active" || sub.status === "trialing"
            ? "pro"
            : undefined,
      },
    });
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Failed to sync subscription" },
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
