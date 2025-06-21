import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle webhook events
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: any) {
  try {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
    });

    if (!user) {
      console.error("User not found for customer ID:", customerId);
      return;
    }

    // Determine plan from price ID
    const plan = getPlanFromPriceId(priceId);

    // Update subscription
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: plan,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      create: {
        userId: user.id,
        plan: plan,
        status: subscription.status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription created for user ${user.id}: ${plan}`);
  } catch (error) {
    console.error("Error handling subscription created:", error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
    });

    if (!user) {
      console.error("User not found for customer ID:", customerId);
      return;
    }

    // Determine plan from price ID
    const plan = getPlanFromPriceId(priceId);

    // Update subscription
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan: plan,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription updated for user ${user.id}: ${plan}`);
  } catch (error) {
    console.error("Error handling subscription updated:", error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer as string;

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
    });

    if (!user) {
      console.error("User not found for customer ID:", customerId);
      return;
    }

    // Update subscription
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: "canceled",
      },
    });

    console.log(`Subscription canceled for user ${user.id}`);
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}

// Handle payment succeeded
async function handlePaymentSucceeded(invoice: any) {
  try {
    const customerId = invoice.customer as string;

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
    });

    if (!user) {
      console.error("User not found for customer ID:", customerId);
      return;
    }

    // Update subscription status to active
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { status: "active" },
    });

    console.log(`Payment succeeded for user ${user.id}`);
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
  }
}

// Handle payment failed
async function handlePaymentFailed(invoice: any) {
  try {
    const customerId = invoice.customer as string;

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
    });

    if (!user) {
      console.error("User not found for customer ID:", customerId);
      return;
    }

    // Update subscription status to past_due
    await prisma.subscription.update({
      where: { userId: user.id },
      data: { status: "past_due" },
    });

    console.log(`Payment failed for user ${user.id}`);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

// Helper function to determine plan from Stripe price ID
function getPlanFromPriceId(priceId: string): "free" | "pro" | "premium" {
  // In production, you would map these to your actual Stripe price IDs
  const priceMap: Record<string, "pro" | "premium"> = {
    price_pro_monthly: "pro",
    price_pro_yearly: "pro",
    price_premium_monthly: "premium",
    price_premium_yearly: "premium",
  };

  return priceMap[priceId] || "free";
}
