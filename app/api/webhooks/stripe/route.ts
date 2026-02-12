import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getStripe } from "@/app/api/_lib/stripe";
import { getRequestId, finishRequest } from "@/app/api/_lib/logger";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  const start = Date.now();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    const res = NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
    return finishRequest(req, res, {
      requestId,
      start,
      statusCode: 500,
    });
  }
  let event: Stripe.Event;
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      const res = NextResponse.json(
        { error: "Missing stripe-signature" },
        { status: 400 },
      );
      return finishRequest(req, res, {
        requestId,
        start,
        statusCode: 400,
      });
    }
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 },
    );
    return finishRequest(req, res, {
      requestId,
      start,
      statusCode: 400,
      errorName: err.name,
      errorMessage: err.message,
    });
  }
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const rawUserId = session.metadata?.luminaUserId;
      let userId: number | null =
        typeof rawUserId === "string"
          ? parseInt(rawUserId, 10)
          : typeof rawUserId === "number"
            ? rawUserId
            : null;
      if (userId !== null && Number.isNaN(userId)) userId = null;

      // Fallback: look up user by Stripe customer email so webhook works even if metadata was lost
      if (!userId && session.customer) {
        const stripe = getStripe();
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          const email =
            typeof customer !== "deleted" && customer.email
              ? customer.email
              : null;
          if (email) {
            const user = await prisma.user.findUnique({
              where: { email },
              select: { id: true },
            });
            if (user) userId = user.id;
          }
        }
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!subscriptionId) {
        const res = NextResponse.json(
          { error: "Missing subscription on session" },
          { status: 400 },
        );
        return finishRequest(req, res, {
          requestId,
          start,
          statusCode: 400,
        });
      }
      if (!userId) {
        const res = NextResponse.json(
          {
            error:
              "Could not resolve user (missing metadata and customer email)",
          },
          { status: 400 },
        );
        return finishRequest(req, res, {
          requestId,
          start,
          statusCode: 400,
        });
      }

      const stripe = getStripe();
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd =
        "current_period_end" in sub
          ? Number(sub.current_period_end) * 1000
          : null;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : (session.customer?.id ?? null);

      await prisma.billing.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          plan: "pro",
          status: sub.status,
          currentPeriodEnd: periodEnd ? new Date(periodEnd) : null,
        },
        update: {
          stripeCustomerId: customerId ?? undefined,
          stripeSubscriptionId: subscriptionId,
          plan: "pro",
          status: sub.status,
          currentPeriodEnd: periodEnd ? new Date(periodEnd) : null,
        },
      });
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
      if (customerId) {
        const periodEnd =
          "current_period_end" in sub
            ? Number(sub.current_period_end) * 1000
            : null;
        await prisma.billing.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            plan:
              sub.status === "active" || sub.status === "trialing"
                ? "pro"
                : null,
            status: sub.status,
            currentPeriodEnd: periodEnd ? new Date(periodEnd) : null,
          },
        });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
      if (customerId) {
        await prisma.billing.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: null,
            plan: null,
            status: "canceled",
            currentPeriodEnd: null,
          },
        });
      }
    }
    // Optional later: invoice.payment_failed, invoice.paid — to keep status/plan reliable (dunning, renewals)
    const res = NextResponse.json({ received: true });
    return finishRequest(req, res, {
      requestId,
      start,
      statusCode: 200,
    });
  } catch (e) {
    const err = e as Error;
    const res = NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
    return finishRequest(req, res, {
      requestId,
      start,
      statusCode: 500,
      errorName: err.name,
      errorMessage: err.message,
    });
  }
}
