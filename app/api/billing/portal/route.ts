import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithProfile } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthWithProfile(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user, profile } = authResult;

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // Get or create Stripe customer
    let stripeCustomerId = subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: profile.fullName,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update subscription with Stripe customer ID
      if (subscription) {
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { stripeCustomerId },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: "free",
            status: "active",
            stripeCustomerId,
          },
        });
      }
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    console.error("GET /api/billing/portal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
