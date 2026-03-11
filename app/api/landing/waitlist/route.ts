import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const OWNER_EMAIL = "lakgarg200@gmail.com";
const FROM_EMAIL = "lakshay@theempowerweb.com";
const FROM_NAME = "Lumina powered by Theempowerweb";

export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();
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

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);

      // Notify you when someone signs up
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [OWNER_EMAIL],
        subject: "Lumina waitlist: new signup",
        html: [
          "<p>Someone joined the Lumina waitlist.</p>",
          "<ul>",
          `<li><strong>Email:</strong> ${escapeHtml(email)}</li>`,
          name ? `<li><strong>Name:</strong> ${escapeHtml(name)}</li>` : "",
          source ? `<li><strong>Source:</strong> ${escapeHtml(source)}</li>` : "",
          "</ul>",
        ].join(""),
      });

      // Confirmation to the person who signed up (from lakshay@theempowerweb.com, title: Lumina powered by Theempowerweb)
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [email],
        subject: "Lumina powered by Theempowerweb",
        html: [
          "<p>Thanks for joining the Lumina waitlist.</p>",
          "<p>We're preparing for TestFlight and will notify you when Lumina is ready to try.</p>",
          "<p>— The Lumina team</p>",
        ].join(""),
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Waitlist signup error:", err);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
