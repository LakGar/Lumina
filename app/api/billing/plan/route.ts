import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { MembershipTier } from "@/types";

// Interface for subscription plan response
interface SubscriptionPlan {
  plan: MembershipTier;
  status: "active" | "canceled" | "past_due" | "unpaid";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get or create subscription
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "free",
          status: "active",
        },
      });
    }

    // If user has Stripe customer ID, sync with Stripe
    if (subscription.stripeCustomerId) {
      try {
        const stripeCustomer = await stripe.customers.retrieve(
          subscription.stripeCustomerId
        );

        if (
          stripeCustomer &&
          !stripeCustomer.deleted &&
          "subscriptions" in stripeCustomer &&
          stripeCustomer.subscriptions &&
          stripeCustomer.subscriptions.data.length > 0
        ) {
          const stripeSubscription = stripeCustomer.subscriptions.data[0];

          // Update subscription with Stripe data
          subscription = await prisma.subscription.update({
            where: { userId: user.id },
            data: {
              plan:
                (stripeSubscription.items.data[0]?.price
                  .lookup_key as MembershipTier) || "free",
              status: stripeSubscription.status as
                | "active"
                | "canceled"
                | "past_due"
                | "unpaid",
              stripeSubscriptionId: stripeSubscription.id,
              currentPeriodStart: new Date(
                stripeSubscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                stripeSubscription.current_period_end * 1000
              ),
            },
          });
        }
      } catch (error) {
        console.error("Error syncing with Stripe:", error);
        // Continue with local subscription data
      }
    }

    const subscriptionPlan: SubscriptionPlan = {
      plan: subscription.plan as MembershipTier,
      status: subscription.status as
        | "active"
        | "canceled"
        | "past_due"
        | "unpaid",
      stripeCustomerId: subscription.stripeCustomerId || undefined,
      stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
      currentPeriodStart: subscription.currentPeriodStart?.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: subscriptionPlan,
    });
  } catch (error) {
    console.error("GET /api/billing/plan error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
