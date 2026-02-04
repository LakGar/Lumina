import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";
import { getStripe, getOrCreateStripeCustomerId } from "@/app/api/_lib/stripe";

const prisma = new PrismaClient();

export async function OPTIONS() {
  return corsPreflight();
}

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
  const priceId = process.env.STRIPE_PRICE_ID_PRO;
  if (!priceId) {
    const res = NextResponse.json(
      { error: "Billing not configured" },
      { status: 503 },
    );
    return finishRequest(req, res, {
      requestId,
      userId: auth.userId,
      start,
      statusCode: 503,
    });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { email: true },
    });
    const email = user?.email ?? "";
    const customerId = await getOrCreateStripeCustomerId(auth.user.id, email);
    const baseUrl = process.env.APP_URL ?? req.nextUrl.origin;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/dashboard?checkout=cancel`,
      metadata: { luminaUserId: String(auth.user.id) },
    });
    const res = NextResponse.json({
      data: { url: session.url, sessionId: session.id },
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
      { error: "Failed to create checkout session" },
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
