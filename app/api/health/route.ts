import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Simple liveness check. No auth. Use for Vercel, load balancers, or Expo to verify the API is up.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, status: "healthy", timestamp: new Date().toISOString() },
    { status: 200 },
  );
}
