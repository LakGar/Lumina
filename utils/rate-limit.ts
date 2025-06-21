import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

// Rate limit by IP and endpoint
const ENDPOINT_LIMITS: Record<string, number> = {
  "/api/chat": 20, // 20 chat requests per minute
  "/api/search": 50, // 50 search requests per minute
  "/api/insights": 30, // 30 insights requests per minute
  "/api/export": 10, // 10 export requests per minute
  "/api/journal": 60, // 60 journal requests per minute
  "/api/voice/upload-url": 30, // 30 upload URL requests per minute
  default: RATE_LIMIT_MAX_REQUESTS,
};

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request);
  const pathname = request.nextUrl.pathname;
  const now = Date.now();

  // Get rate limit for this endpoint
  const limit = ENDPOINT_LIMITS[pathname] || ENDPOINT_LIMITS.default;
  const key = `${ip}:${pathname}`;

  // Get current rate limit data
  const rateLimitData = rateLimitStore.get(key);

  if (!rateLimitData || now > rateLimitData.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return null;
  }

  if (rateLimitData.count >= limit) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);

    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimitData.resetTime).toISOString(),
        },
      }
    );
  }

  // Increment count
  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);

  // Add rate limit headers
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    (limit - rateLimitData.count).toString()
  );
  response.headers.set(
    "X-RateLimit-Reset",
    new Date(rateLimitData.resetTime).toISOString()
  );

  return null;
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  // Check for forwarded headers (when behind proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Check for real IP header
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address
  return request.ip || "unknown";
}

// Clean up expired rate limit entries (run periodically)
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, data] of Array.from(rateLimitStore.entries())) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

// Export rate limit store for testing
export { rateLimitStore };
