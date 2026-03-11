import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const OWNER_EMAIL = "lakgarg2002@gmail.com";
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

    const existing = await prisma.waitlistEntry.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { ok: true, alreadyOnList: true },
        { status: 200 },
      );
    }

    await prisma.waitlistEntry.create({
      data: { email, name, source },
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

      // Nice confirmation email to the person who signed up (Theempowerweb powering Lumina)
      const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [email],
        subject: "You're on the list — Lumina by Theempowerweb",
        html: getWaitlistConfirmationHtml(greeting),
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

function getWaitlistConfirmationHtml(greeting: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0; color: #1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f0;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #FDFCF9; border-radius: 16px; border: 1px solid #e5ddd4; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding: 40px 36px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B6B6B; letter-spacing: 0.02em; text-transform: uppercase;">Theempowerweb</p>
              <h1 style="margin: 0 0 28px 0; font-size: 24px; font-weight: 600; color: #1E1E1E; letter-spacing: -0.02em;">Lumina</h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1E1E1E;">${greeting}</p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1E1E1E;">Thank you for joining the Lumina waitlist. We're building a place for reflection and growth, and we're glad you want to be part of it.</p>
              <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #1E1E1E;">We're preparing for TestFlight and will email you as soon as Lumina is ready to try. You're on the list — we won't forget you.</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #6B6B6B;">Lumina is powered by <strong style="color: #1E1E1E;">Theempowerweb</strong>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
