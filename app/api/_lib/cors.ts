import { NextResponse } from "next/server";

const DEV_ALLOW_ANY = process.env.NODE_ENV !== "production";
const ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) ?? [];

export function getAllowedOrigin(requestOrigin: string | null): string | null {
  if (DEV_ALLOW_ANY && !ALLOWED_ORIGINS.length) return requestOrigin ?? "*";
  if (!requestOrigin) return null;
  if (ALLOWED_ORIGINS.includes(requestOrigin) || ALLOWED_ORIGINS.includes("*"))
    return requestOrigin;
  return null;
}

export function withCorsHeaders(
  response: NextResponse,
  req: { headers?: Headers },
): NextResponse {
  const origin = req.headers?.get?.("origin") ?? null;
  const allow = getAllowedOrigin(origin);
  if (allow) {
    response.headers.set("Access-Control-Allow-Origin", allow);
  }
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-request-id, x-client-platform, x-client-version",
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export function corsPreflight(): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-request-id, x-client-platform, x-client-version",
  );
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}
