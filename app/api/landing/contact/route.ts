import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";

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
    const message = typeof body?.message === "string" ? body.message.trim() : null;

    await prisma.landingContact.create({
      data: { email, name, message },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 },
    );
  }
}
