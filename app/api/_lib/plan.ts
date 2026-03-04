import { NextResponse } from "next/server";
import type { PrismaClient } from "@prisma/client";

/** Free plan: max journals a user can create. */
export const FREE_JOURNAL_LIMIT = 3;

/** Plan identifier for paid subscription (Stripe). */
export const PLAN_PRO = "pro";

/** Error code returned when a feature is gated by plan (frontend can show upgrade CTA). */
export const PLAN_LIMIT_CODE = "PLAN_LIMIT";

/**
 * Returns true if the user has an active Pro (Lumina) subscription.
 * Uses billing.plan === "pro" and status active/trialing.
 */
export async function getIsPro(
  prisma: PrismaClient,
  userId: number,
): Promise<boolean> {
  const billing = await prisma.billing.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (!billing || billing.plan !== PLAN_PRO) return false;
  return (
    billing.status === "active" ||
    billing.status === "trialing" ||
    billing.status === "past_due"
  );
}

/** 403 response for "this feature requires Lumina" (frontend can show upgrade). */
export function planLimitResponse(message: string): NextResponse {
  return NextResponse.json(
    { error: message, code: PLAN_LIMIT_CODE },
    { status: 403 },
  );
}
