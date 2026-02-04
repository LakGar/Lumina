/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST as POST_CHECKOUT } from "@/app/api/billing/checkout/route";
import { POST as POST_PORTAL } from "@/app/api/billing/portal/route";

const mockRequireAuth = jest.fn();
const mockFinishRequest = jest.fn((_req: unknown, res: unknown) => res);
const mockGetRequestId = jest.fn(() => "test-request-id");
const mockGetOrCreateStripeCustomerId = jest.fn();
const mockStripeCheckoutSessionsCreate = jest.fn();
const mockStripeBillingPortalSessionsCreate = jest.fn();

jest.mock("@/app/api/_lib/auth", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));
jest.mock("@/app/api/_lib/logger", () => ({
  getRequestId: (...args: unknown[]) => mockGetRequestId(...args),
  finishRequest: (...args: unknown[]) => mockFinishRequest(...args),
}));

jest.mock("@/app/api/_lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: (...args: unknown[]) =>
          mockStripeCheckoutSessionsCreate(...args),
      },
    },
    billingPortal: {
      sessions: {
        create: (...args: unknown[]) =>
          mockStripeBillingPortalSessionsCreate(...args),
      },
    },
  }),
  getOrCreateStripeCustomerId: (...args: unknown[]) =>
    mockGetOrCreateStripeCustomerId(...args),
}));

const mockUserFindUnique = jest.fn();

jest.mock("@/app/generated/prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
  })),
}));

const authUser = {
  ok: true as const,
  userId: "clerk-1",
  user: { id: 1, clerkId: "clerk-1", email: "u@test.com", name: "User" },
};

function createRequest(url: string, method: string): NextRequest {
  return new NextRequest(url, { method }) as NextRequest;
}

describe("POST /api/billing/checkout", () => {
  const origEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
    mockUserFindUnique.mockResolvedValue({ email: "u@test.com" });
    mockGetOrCreateStripeCustomerId.mockResolvedValue("cus_xxx");
    mockStripeCheckoutSessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/xxx",
      id: "cs_xxx",
    });
    process.env = { ...origEnv, STRIPE_PRICE_ID_PRO: "price_xxx" };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it("returns 401 when unauthenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = createRequest("http://localhost/api/billing/checkout", "POST");
    await POST_CHECKOUT(req);
    expect(mockStripeCheckoutSessionsCreate).not.toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(401);
  });

  it("returns 503 when STRIPE_PRICE_ID_PRO not set", async () => {
    delete process.env.STRIPE_PRICE_ID_PRO;
    const req = createRequest("http://localhost/api/billing/checkout", "POST");
    await POST_CHECKOUT(req);
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(503);
  });

  it("uses APP_URL for success_url when set", async () => {
    process.env.APP_URL = "https://app.lumina.com";
    const req = createRequest("http://localhost/api/billing/checkout", "POST");
    await POST_CHECKOUT(req);
    expect(mockStripeCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://app.lumina.com/dashboard?checkout=success",
        cancel_url: "https://app.lumina.com/dashboard?checkout=cancel",
      }),
    );
  });
});

describe("POST /api/billing/portal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(authUser);
    mockUserFindUnique.mockResolvedValue({ email: "u@test.com" });
    mockGetOrCreateStripeCustomerId.mockResolvedValue("cus_xxx");
    mockStripeBillingPortalSessionsCreate.mockResolvedValue({
      url: "https://billing.stripe.com/xxx",
    });
  });

  it("returns 200 and creates portal session", async () => {
    const req = createRequest("http://localhost/api/billing/portal", "POST");
    await POST_PORTAL(req);
    expect(mockStripeBillingPortalSessionsCreate).toHaveBeenCalled();
    const [, response] = mockFinishRequest.mock.calls[0];
    expect((response as NextResponse).status).toBe(200);
  });
});
