import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { finishRequest, getRequestId } from "@/app/api/_lib/logger";
import { corsPreflight } from "@/app/api/_lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * DELETE /api/users/me/ai-data
 * Delete stored AI-related data for the current user.
 * Used by Privacy settings → Delete AI data.
 * No-op when no AI storage exists (return 204 so app does not get 404).
 */
export async function DELETE(req: NextRequest) {
  const requestId = getRequestId(req);
  const start = Date.now();
  const auth = await requireAuth();
  if (!auth.ok) {
    return finishRequest(req, auth.response, {
      requestId,
      start,
      statusCode: auth.response.status,
    });
  }
  // No dedicated AI/personalization storage yet; no-op.
  const res = new NextResponse(null, { status: 204 });
  return finishRequest(req, res, {
    requestId,
    userId: auth.userId,
    start,
    statusCode: 204,
  });
}
