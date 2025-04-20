import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactEmailTemplate = (name: string, email: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 2px; border-radius: 16px;">
      <div style="background: white; border-radius: 14px; padding: 30px;">
        <h1 style="color: #1F2937; margin-bottom: 20px; font-size: 24px;">New Message from ${name}</h1>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
        </div>

        <div style="background: #F8FAFC; padding: 20px; border-radius: 12px;">
          <h2 style="color: #1F2937; font-size: 18px; margin-bottom: 12px;">Message:</h2>
          <p style="color: #4B5563; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #9CA3AF; font-size: 12px;">
        This message was sent from the Lumina contact form.
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "lakgarg2002@gmail.com",
      subject: `New Contact Form Message from ${name}`,
      html: contactEmailTemplate(name, email, message),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
