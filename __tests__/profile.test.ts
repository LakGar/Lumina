import { NextRequest } from "next/server";
import { GET, PUT } from "@/app/api/profile/route";

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
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Profile API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/profile", () => {
    it("should return profile when authenticated", async () => {
      const mockProfile = {
        id: "profile1",
        userId: "user1",
        fullName: "Test User",
        email: "test@example.com",
        membershipTier: "free",
        settings: { id: "settings1", aiMemoryEnabled: true },
        subscription: null,
      };

      const { requireAuthWithProfile } = require("@/utils/auth");
      requireAuthWithProfile.mockResolvedValue({
        user: { id: "user1" },
        profile: mockProfile,
      });

      const request = new NextRequest("http://localhost:3000/api/profile");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProfile);
    });

    it("should return 401 when not authenticated", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      requireAuthWithProfile.mockResolvedValue(
        new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          {
            status: 401,
          }
        )
      );

      const request = new NextRequest("http://localhost:3000/api/profile");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("PUT /api/profile", () => {
    it("should update profile successfully", async () => {
      const mockProfile = {
        id: "profile1",
        userId: "user1",
        fullName: "Updated Name",
        email: "test@example.com",
        membershipTier: "free",
        settings: { id: "settings1", aiMemoryEnabled: true },
        subscription: null,
      };

      const { requireAuthWithProfile } = require("@/utils/auth");
      const { validateRequest } = require("@/utils/validation");
      const { prisma } = require("@/lib/prisma");

      requireAuthWithProfile.mockResolvedValue({
        user: { id: "user1" },
        profile: mockProfile,
      });
      validateRequest.mockResolvedValue({
        fullName: "Updated Name",
        avatarUrl: "https://example.com/avatar.jpg",
      });
      prisma.profile.update.mockResolvedValue(mockProfile);

      const request = new NextRequest("http://localhost:3000/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: "Updated Name",
          avatarUrl: "https://example.com/avatar.jpg",
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProfile);
      expect(data.message).toBe("Profile updated successfully");
    });

    it("should return 400 for invalid data", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { validateRequest } = require("@/utils/validation");

      requireAuthWithProfile.mockResolvedValue({
        user: { id: "user1" },
        profile: { id: "profile1" },
      });
      validateRequest.mockRejectedValue(
        new Error("Validation error: Invalid avatar URL")
      );

      const request = new NextRequest("http://localhost:3000/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          avatarUrl: "invalid-url",
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Validation error");
    });
  });
});
