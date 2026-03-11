import { Resend } from "resend";

const FROM_EMAIL = "lakshay@theempowerweb.com";
const FROM_NAME = "Lumina powered by Theempowerweb";

/**
 * Send a transactional email via Resend. No-op if RESEND_API_KEY is not set.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: new Error("RESEND_API_KEY not set") };
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    });
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}
