import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const adminEmailTemplate = (name: string, email: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Early Access Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 2px; border-radius: 16px;">
      <div style="background: white; border-radius: 14px; padding: 30px;">
        <h1 style="color: #1F2937; margin-bottom: 20px; font-size: 24px;">New Early Access Request</h1>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
        </div>
        <p style="color: #6B7280; font-size: 14px;">A new user has requested early access to Lumina.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const userEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Lumina</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #F3F4F6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 2px; border-radius: 16px;">
      <div style="background: white; border-radius: 14px; padding: 40px;">
        <h1 style="color: #1F2937; margin-bottom: 20px; font-size: 28px; text-align: center;">Welcome to Lumina, ${name}! 🌟</h1>
        
        <p style="color: #4B5563; font-size: 16px; margin-bottom: 24px; text-align: center;">
          Thank you for joining our early access waitlist. You're now part of an exclusive group who will be first to experience Lumina's AI-powered journaling platform.
        </p>

        <div style="background: #F8FAFC; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #1F2937; font-size: 18px; margin-bottom: 16px;">What's Next?</h2>
          <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 12px;">We'll notify you as soon as early access is available</li>
            <li style="margin-bottom: 12px;">You'll be among the first to try our AI journaling features</li>
            <li style="margin-bottom: 12px;">You'll receive exclusive updates about our progress</li>
          </ul>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 32px;">
          Stay tuned for updates! We're excited to have you on this journey.
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #9CA3AF; font-size: 12px;">
        © 2024 Lumina. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    // Send notification email to admin
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "lakgarg2002@gmail.com",
      subject: `New Early Access Request from ${name}`,
      html: adminEmailTemplate(name, email),
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to Lumina's Early Access Waitlist! 🌟",
      html: userEmailTemplate(name),
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
