import { NextRequest } from "next/server";
import {
  GET as GETSettings,
  PUT as PUTSettings,
} from "@/app/api/settings/route";
import { GET as GETBillingPlan } from "@/app/api/billing/plan/route";
import { GET as GETBillingPortal } from "@/app/api/billing/portal/route";
import { POST as POSTStripeWebhook } from "@/app/api/webhooks/stripe/route";
import { GET as GETVersion } from "@/app/api/version/route";

// Mock auth utilities
jest.mock("@/utils/auth", () => ({
  requireAuthWithProfile: jest.fn(),
}));

// Mock validation utilities
jest.mock("@/utils/validation", () => ({
  validateRequest: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    settings: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    profile: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock Stripe
jest.mock("@/lib/stripe", () => ({
  stripe: {
    customers: {
      retrieve: jest.fn(),
      create: jest.fn(),
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

describe("Phase 5 API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = { id: "user1", email: "test@example.com" };
  const mockProfile = {
    id: "profile1",
    userId: "user1",
    membershipTier: "free",
  };

  describe("Settings API", () => {
    describe("GET /api/settings", () => {
      it("should return existing user settings", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        const mockSettings = {
          id: "settings1",
          userId: "user1",
          aiMemoryEnabled: true,
          moodAnalysisEnabled: false,
          summaryGenerationEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        prisma.settings.findUnique.mockResolvedValue(mockSettings);

        const request = new NextRequest("http://localhost:3000/api/settings");
        const response = await GETSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.aiMemoryEnabled).toBe(true);
        expect(data.data.moodAnalysisEnabled).toBe(false);
      });

      it("should create default settings if none exist", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        prisma.settings.findUnique.mockResolvedValue(null);

        const mockCreatedSettings = {
          id: "settings1",
          userId: "user1",
          aiMemoryEnabled: true,
          moodAnalysisEnabled: true,
          summaryGenerationEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        prisma.settings.create.mockResolvedValue(mockCreatedSettings);

        const request = new NextRequest("http://localhost:3000/api/settings");
        const response = await GETSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(prisma.settings.create).toHaveBeenCalledWith({
          data: {
            userId: "user1",
            aiMemoryEnabled: true,
            moodAnalysisEnabled: true,
            summaryGenerationEnabled: true,
          },
        });
      });
    });

    describe("PUT /api/settings", () => {
      it("should update existing settings", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        validateRequest.mockResolvedValue({
          aiMemoryEnabled: false,
          moodAnalysisEnabled: true,
        });

        const mockUpdatedSettings = {
          id: "settings1",
          userId: "user1",
          aiMemoryEnabled: false,
          moodAnalysisEnabled: true,
          summaryGenerationEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        prisma.settings.findUnique.mockResolvedValue(mockUpdatedSettings);
        prisma.settings.update.mockResolvedValue(mockUpdatedSettings);

        const request = new NextRequest("http://localhost:3000/api/settings", {
          method: "PUT",
          body: JSON.stringify({
            aiMemoryEnabled: false,
            moodAnalysisEnabled: true,
          }),
        });

        const response = await PUTSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.aiMemoryEnabled).toBe(false);
        expect(data.data.moodAnalysisEnabled).toBe(true);
      });

      it("should create settings if none exist", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        validateRequest.mockResolvedValue({
          aiMemoryEnabled: false,
        });

        const mockCreatedSettings = {
          id: "settings1",
          userId: "user1",
          aiMemoryEnabled: false,
          moodAnalysisEnabled: true,
          summaryGenerationEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        prisma.settings.findUnique.mockResolvedValue(null);
        prisma.settings.create.mockResolvedValue(mockCreatedSettings);

        const request = new NextRequest("http://localhost:3000/api/settings", {
          method: "PUT",
          body: JSON.stringify({
            aiMemoryEnabled: false,
          }),
        });

        const response = await PUTSettings(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(prisma.settings.create).toHaveBeenCalledWith({
          data: {
            userId: "user1",
            aiMemoryEnabled: false,
            moodAnalysisEnabled: true,
            summaryGenerationEnabled: true,
          },
        });
      });
    });
  });

  describe("Billing API", () => {
    describe("GET /api/billing/plan", () => {
      it("should return subscription plan information", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        const mockSubscription = {
          id: "sub1",
          userId: "user1",
          plan: "pro",
          status: "active",
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        prisma.subscription.findUnique.mockResolvedValue(mockSubscription);

        const request = new NextRequest(
          "http://localhost:3000/api/billing/plan"
        );
        const response = await GETBillingPlan(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.plan).toBe("pro");
        expect(data.data.status).toBe("active");
      });

      it("should create free subscription if none exists", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        prisma.subscription.findUnique.mockResolvedValue(null);

        const mockCreatedSubscription = {
          id: "sub1",
          userId: "user1",
          plan: "free",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        prisma.subscription.create.mockResolvedValue(mockCreatedSubscription);

        const request = new NextRequest(
          "http://localhost:3000/api/billing/plan"
        );
        const response = await GETBillingPlan(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(prisma.subscription.create).toHaveBeenCalledWith({
          data: {
            userId: "user1",
            plan: "free",
            status: "active",
          },
        });
      });
    });

    describe("GET /api/billing/portal", () => {
      it("should create billing portal session", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { prisma } = require("@/lib/prisma");
        const { stripe } = require("@/lib/stripe");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        const mockSubscription = {
          stripeCustomerId: "cus_123",
        };

        prisma.subscription.findUnique.mockResolvedValue(mockSubscription);

        stripe.billingPortal.sessions.create.mockResolvedValue({
          url: "https://billing.stripe.com/session/123",
        });

        const request = new NextRequest(
          "http://localhost:3000/api/billing/portal"
        );
        const response = await GETBillingPortal(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.url).toBe("https://billing.stripe.com/session/123");
      });

      it("should create Stripe customer if none exists", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { prisma } = require("@/lib/prisma");
        const { stripe } = require("@/lib/stripe");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        prisma.subscription.findUnique.mockResolvedValue(null);

        stripe.customers.create.mockResolvedValue({
          id: "cus_123",
        });

        stripe.billingPortal.sessions.create.mockResolvedValue({
          url: "https://billing.stripe.com/session/123",
        });

        const request = new NextRequest(
          "http://localhost:3000/api/billing/portal"
        );
        const response = await GETBillingPortal(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(stripe.customers.create).toHaveBeenCalledWith({
          email: "test@example.com",
          name: undefined,
          metadata: {
            userId: "user1",
          },
        });
      });
    });
  });

  describe("Stripe Webhook", () => {
    describe("POST /api/webhooks/stripe", () => {
      it("should handle subscription created event", async () => {
        const { stripe } = require("@/lib/stripe");
        const { prisma } = require("@/lib/prisma");

        const mockEvent = {
          type: "customer.subscription.created",
          data: {
            object: {
              id: "sub_123",
              customer: "cus_123",
              status: "active",
              items: {
                data: [
                  {
                    price: {
                      id: "price_pro_monthly",
                    },
                  },
                ],
              },
              current_period_start: Math.floor(Date.now() / 1000),
              current_period_end:
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
              cancel_at_period_end: false,
            },
          },
        };

        stripe.webhooks.constructEvent.mockReturnValue(mockEvent);

        const mockProfile = {
          userId: "user1",
        };

        prisma.profile.findFirst.mockResolvedValue(mockProfile);
        prisma.subscription.upsert.mockResolvedValue({});
        prisma.profile.update.mockResolvedValue({});

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify(mockEvent),
          }
        );

        const response = await POSTStripeWebhook(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
      });

      it("should handle subscription deleted event", async () => {
        const { stripe } = require("@/lib/stripe");
        const { prisma } = require("@/lib/prisma");

        const mockEvent = {
          type: "customer.subscription.deleted",
          data: {
            object: {
              id: "sub_123",
              customer: "cus_123",
              status: "canceled",
            },
          },
        };

        stripe.webhooks.constructEvent.mockReturnValue(mockEvent);

        const mockProfile = {
          userId: "user1",
        };

        prisma.profile.findFirst.mockResolvedValue(mockProfile);
        prisma.subscription.update.mockResolvedValue({});
        prisma.profile.update.mockResolvedValue({});

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify(mockEvent),
          }
        );

        const response = await POSTStripeWebhook(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
      });

      it("should reject invalid webhook signature", async () => {
        const { stripe } = require("@/lib/stripe");

        stripe.webhooks.constructEvent.mockImplementation(() => {
          throw new Error("Invalid signature");
        });

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: "invalid body",
          }
        );

        const response = await POSTStripeWebhook(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid signature");
      });
    });
  });

  describe("Version API", () => {
    describe("GET /api/version", () => {
      it("should return version information", async () => {
        const request = new NextRequest("http://localhost:3000/api/version");
        const response = await GETVersion(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty("version");
        expect(data.data).toHaveProperty("buildId");
        expect(data.data).toHaveProperty("deployedAt");
        expect(data.data).toHaveProperty("environment");
      });
    });
  });
});
