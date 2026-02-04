/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/webhooks/stripe/route";

const mockFinishRequest = jest.fn((_req: unknown, res: unknown) => res);
const mockGetRequestId = jest.fn(() => "test-request-id");
const mockConstructEvent = jest.fn();

jest.mock("@/app/api/_lib/logger", () => ({
  getRequestId: (...args: unknown[]) => mockGetRequestId(...args),
  finishRequest: (...args: unknown[]) => mockFinishRequest(...args),
}));

jest.mock("@/app/api/_lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  }),
}));

const origEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...origEnv, STRIPE_WEBHOOK_SECRET: "whsec_xxx" };
});

afterEach(() => {
  process.env = origEnv;
});

function createRequest(body: string, signature: string | null): NextRequest {
  const req = new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: new Headers(signature ? { "stripe-signature": signature } : {}),
  }) as NextRequest;
  return req;
}

describe("POST /api/webhooks/stripe", () => {
  it("returns 400 when stripe-signature is missing", async () => {
    const req = createRequest("{}", null);
    await POST(req);
    expect(mockConstructEvent).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(400);
  });

  it("returns 400 when webhook verification fails (bad signature)", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const req = createRequest("{}", "v1,badsig");
    await POST(req);
    expect(mockConstructEvent).toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(400);
  });
});
