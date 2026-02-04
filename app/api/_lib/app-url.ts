import { NextRequest } from "next/server";

/**
 * Base URL for Stripe redirects (checkout success/cancel, portal return).
 * - Development: use request origin so redirects go to localhost or ngrok.
 * - Production: use APP_URL (single URL; if comma-separated, first one is used).
 */
export function getAppBaseUrl(req: NextRequest): string {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    return req.nextUrl.origin;
  }
  const appUrl = process.env.APP_URL?.trim();
  if (!appUrl) return req.nextUrl.origin;
  const first = appUrl.split(",")[0]?.trim();
  return first || req.nextUrl.origin;
}
