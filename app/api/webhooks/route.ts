import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const webhookSecret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET ??
    process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(
      "Missing CLERK_WEBHOOK_SIGNING_SECRET or CLERK_WEBHOOK_SECRET",
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  try {
    const evt = await verifyWebhook(req, { signingSecret: webhookSecret });
    const { type, data } = evt;

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id;
      const primaryEmail = data.email_addresses?.find(
        (e) => e.id === data.primary_email_address_id,
      )?.email_address;
      if (!primaryEmail) {
        console.error("Webhook: no primary email for user", clerkId);
        return NextResponse.json(
          { error: "No primary email" },
          { status: 400 },
        );
      }
      const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        data.username ||
        "User";
      const preferredName = data.first_name ?? data.username ?? null;

      await prisma.user.upsert({
        where: { clerkId },
        create: {
          clerkId,
          email: primaryEmail,
          name,
          prefferdName: preferredName,
          password: null,
          provider: "clerk",
        },
        update: {
          email: primaryEmail,
          name,
          prefferdName: preferredName,
        },
      });
      console.log("Webhook: synced user to Prisma", {
        clerkId,
        email: primaryEmail,
      });
    } else if (type === "user.deleted" && data.id) {
      await prisma.user.deleteMany({ where: { clerkId: data.id } });
      console.log("Webhook: deleted user from Prisma", data.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook verification or processing failed" },
      { status: 400 },
    );
  }
}
