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
      const userId = session.metadata?.luminaUserId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!userId || !subscriptionId) {
        const res = NextResponse.json(
          { error: "Missing metadata or subscription" },
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
      await prisma.billing.updateMany({
        where: { userId: parseInt(userId, 10) },
        data: {
          stripeSubscriptionId: subscriptionId,
          plan: "pro",
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.billing.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          stripeSubscriptionId: sub.id,
          plan: sub.status === "active" ? "pro" : null,
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.billing.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          stripeSubscriptionId: null,
          plan: null,
          status: "canceled",
          currentPeriodEnd: null,
        },
      });
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
