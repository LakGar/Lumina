import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }
    const name = typeof body?.name === "string" ? body.name.trim() : null;
    const source = typeof body?.source === "string" ? body.source : null;

    await prisma.waitlistEntry.upsert({
      where: { email },
      create: { email, name, source },
      update: { name: name ?? undefined, source: source ?? undefined },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 },
    );
  }
}
