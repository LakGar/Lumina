#!/usr/bin/env node
/**
 * Test env variables and run a Stripe subscription demo.
 * Usage: node scripts/test-env.js
 * (Loads .env from project root automatically.)
 */
require("./load-dotenv.js");

const required = {
  DATABASE_URL: "PostgreSQL connection (Prisma)",
  CLERK_SECRET_KEY: "Clerk server auth",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "Clerk frontend",
  STRIPE_SECRET_KEY: "Stripe API",
  STRIPE_WEBHOOK_SECRET: "Stripe webhook signing",
  STRIPE_PRICE_ID_PRO: "Stripe Pro price ID",
};

const optional = {
  APP_URL: "Stripe redirect base (fallback: localhost)",
  ALLOWED_ORIGINS: "CORS origins",
  LOG_LEVEL: "Log level",
  LOG_FORMAT: "Log format",
  STRIPE_PUBLISHABLE_KEY: "Stripe frontend",
  CLERK_WEBHOOK_SECRET: "Clerk webhooks",
};

function redact(s) {
  if (!s || typeof s !== "string") return "(missing)";
  if (s.length <= 8) return "***";
  return s.slice(0, 4) + "…" + s.slice(-4);
}

function main() {
  console.log("Lumina – env check & Stripe subscription demo\n");

  let failed = false;
  for (const [key, desc] of Object.entries(required)) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      console.log("  ❌", key, "–", desc, "(required, missing)");
      failed = true;
    } else {
      console.log("  ✅", key, "–", redact(value));
    }
  }
  for (const [key, desc] of Object.entries(optional)) {
    const value = process.env[key];
    if (value && value.trim() !== "") {
      console.log("  ✅", key, "–", redact(value));
    } else {
      console.log("  ⏭️", key, "–", desc, "(optional, unset)");
    }
  }

  const appUrlRaw = process.env.APP_URL || "";
  const baseUrl = appUrlRaw.split(",")[0]?.trim() || "http://localhost:3000";
  console.log("\n  Using base URL for Stripe redirects:", baseUrl);

  if (failed) {
    console.log("\n❌ Fix missing required vars and re-run.");
    process.exit(1);
  }

  console.log("\n--- Stripe subscription demo ---\n");

  const Stripe = require("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const priceId = process.env.STRIPE_PRICE_ID_PRO;

  (async () => {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url: `${baseUrl}/dashboard?checkout=cancel`,
        customer_email: "demo@example.com",
        metadata: { luminaDemo: "test-env-script" },
      });
      console.log("  ✅ Checkout session created (test mode)");
      console.log("  Session ID:", session.id);
      if (session.url) {
        console.log("  Checkout URL:", session.url);
        console.log(
          "\n  Open the URL above to complete a test subscription (use card 4242 4242 4242 4242).",
        );
      }
      console.log("\n✅ Env check and Stripe demo passed.");
    } catch (err) {
      console.error("  ❌ Stripe error:", err.message);
      if (err.type) console.error("  Type:", err.type);
      process.exit(1);
    }
  })();
}

main();
