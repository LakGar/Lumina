import Stripe from "stripe";
import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function getOrCreateStripeCustomerId(
  userId: number,
  email: string,
): Promise<string> {
  const billing = await prisma.billing.findUnique({
    where: { userId },
  });
  if (billing?.stripeCustomerId) return billing.stripeCustomerId;
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { luminaUserId: String(userId) },
  });
  await prisma.billing.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customer.id,
    },
    update: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
