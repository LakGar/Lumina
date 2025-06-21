import { NextRequest } from "next/server";
import { getCurrentUser, requireAuth, validateMembership } from "@/utils/auth";

// Mock NextAuth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    profile: {
      findUnique: jest.fn(),
    },
  },
}));

describe("Auth Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return user when session exists", async () => {
      const mockUser = { id: "user1", email: "test@example.com" };
      const { getServerSession } = require("next-auth/next");
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it("should return null when no session", async () => {
      const { getServerSession } = require("next-auth/next");
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe("requireAuth", () => {
    it("should return user when authenticated", async () => {
      const mockUser = { id: "user1", email: "test@example.com" };
      const { getServerSession } = require("next-auth/next");
      (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await requireAuth(request);
      expect(result).toEqual(mockUser);
    });

    it("should return error response when not authenticated", async () => {
      const { getServerSession } = require("next-auth/next");
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await requireAuth(request);

      expect(result).toBeInstanceOf(Response);
      const data = await result.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("validateMembership", () => {
    it("should allow access for same tier", () => {
      expect(validateMembership("pro", "pro")).toBe(true);
      expect(validateMembership("premium", "premium")).toBe(true);
      expect(validateMembership("free", "free")).toBe(true);
    });

    it("should allow access for higher tier", () => {
      expect(validateMembership("premium", "pro")).toBe(true);
      expect(validateMembership("premium", "free")).toBe(true);
      expect(validateMembership("pro", "free")).toBe(true);
    });

    it("should deny access for lower tier", () => {
      expect(validateMembership("free", "pro")).toBe(false);
      expect(validateMembership("free", "premium")).toBe(false);
      expect(validateMembership("pro", "premium")).toBe(false);
    });
  });
});
