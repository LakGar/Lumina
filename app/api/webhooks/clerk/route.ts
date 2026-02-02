import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { PrismaClient } from "@/app/generated/prisma"; // or @prisma/client / @/lib/db

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const clerkId = data.id;
    const primaryEmail = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id,
    )?.email_address;
    if (!primaryEmail) {
      return NextResponse.json({ error: "No primary email" }, { status: 400 });
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
  } else if (type === "user.deleted") {
    if (data.id) {
      await prisma.user.deleteMany({ where: { clerkId: data.id } });
    }
  }

  return NextResponse.json({ received: true });
}
