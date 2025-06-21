import { NextRequest, NextResponse } from "next/server";
import { rateLimit, cleanupRateLimitStore } from "../../utils/rate-limit";

// Mock NextRequest
const createMockRequest = (ip: string = "127.0.0.1"): NextRequest => {
  return {
    ip,
    headers: new Map(),
  } as unknown as NextRequest;
};

describe("rateLimit", () => {
  beforeEach(() => {
    // Clean up before each test
    cleanupRateLimitStore();
  });

  afterEach(() => {
    // Clean up after each test
    cleanupRateLimitStore();
  });

  it("should allow requests within rate limit", () => {
    const request = createMockRequest("192.168.1.1");

    // First 10 requests should be allowed
    for (let i = 0; i < 10; i++) {
      const result = rateLimit(request);
      expect(result).toBeNull();
    }
  });

  it("should block requests exceeding rate limit", () => {
    const request = createMockRequest("192.168.1.2");

    // Make 10 requests (within limit)
    for (let i = 0; i < 10; i++) {
      const result = rateLimit(request);
      expect(result).toBeNull();
    }

    // 11th request should be blocked
    const result = rateLimit(request);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(429);
  });

  it("should track different IPs separately", () => {
    const request1 = createMockRequest("192.168.1.10");
    const request2 = createMockRequest("192.168.1.11");

    // IP 1: 10 requests (within limit)
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(request1)).toBeNull();
    }

    // IP 2: 10 requests (within limit)
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(request2)).toBeNull();
    }

    // IP 1: 11th request should be blocked
    const result1 = rateLimit(request1);
    expect(result1).toBeInstanceOf(NextResponse);
    expect(result1?.status).toBe(429);

    // IP 2: 11th request should be blocked
    const result2 = rateLimit(request2);
    expect(result2).toBeInstanceOf(NextResponse);
    expect(result2?.status).toBe(429);
  });

  it("should handle requests without IP", () => {
    const request = createMockRequest();
    request.ip = undefined;

    // Should still work (uses default IP)
    const result = rateLimit(request);
    expect(result).toBeNull();
  });
});

describe("cleanupRateLimitStore", () => {
  it("should clear the rate limit store", () => {
    const request = createMockRequest("192.168.1.100");

    // Make some requests
    for (let i = 0; i < 5; i++) {
      rateLimit(request);
    }

    // Clean up
    cleanupRateLimitStore();

    // Should be able to make 10 more requests after cleanup
    for (let i = 0; i < 10; i++) {
      const result = rateLimit(request);
      expect(result).toBeNull();
    }
  });
});
