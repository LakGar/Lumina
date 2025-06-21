import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/journal/route";
import { GET as GETById, PUT, DELETE } from "@/app/api/journal/[id]/route";
import { GET as GETUploadUrl } from "@/app/api/voice/upload-url/route";

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
    journalEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock queue
jest.mock("@/lib/queue", () => ({
  etlQueue: {
    add: jest.fn(),
  },
}));

// Mock S3
jest.mock("@/lib/s3", () => ({
  generateSignedUploadUrl: jest.fn(),
}));

describe("Journal API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = { id: "user1", email: "test@example.com" };
  const mockProfile = {
    id: "profile1",
    userId: "user1",
    membershipTier: "free",
  };

  describe("GET /api/journal", () => {
    it("should return paginated journal entries when authenticated", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { prisma } = require("@/lib/prisma");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      prisma.journalEntry.count.mockResolvedValue(50);
      prisma.journalEntry.findMany.mockResolvedValue([
        {
          id: "entry1",
          content: "Test entry",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/journal?page=1&limit=20"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.entries).toHaveLength(1);
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.total).toBe(50);
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

      const request = new NextRequest("http://localhost:3000/api/journal");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe("POST /api/journal", () => {
    it("should create journal entry and enqueue ETL job", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { validateRequest } = require("@/utils/validation");
      const { prisma } = require("@/lib/prisma");
      const { etlQueue } = require("@/lib/queue");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      validateRequest.mockResolvedValue({
        content: "Test journal entry",
        voiceUrl: "https://example.com/audio.mp3",
        tags: ["test", "journal"],
      });

      prisma.journalEntry.create.mockResolvedValue({
        id: "entry1",
        content: "Test journal entry",
        voiceUrl: "https://example.com/audio.mp3",
        tags: ["test", "journal"],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      etlQueue.add.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify({
          content: "Test journal entry",
          voiceUrl: "https://example.com/audio.mp3",
          tags: ["test", "journal"],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.content).toBe("Test journal entry");
      expect(etlQueue.add).toHaveBeenCalledWith("journal-etl", {
        entryId: "entry1",
        userId: "user1",
        content: "Test journal entry",
        voiceUrl: "https://example.com/audio.mp3",
      });
    });

    it("should return 400 for invalid data", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { validateRequest } = require("@/utils/validation");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      validateRequest.mockRejectedValue(
        new Error("Validation error: Content is required")
      );

      const request = new NextRequest("http://localhost:3000/api/journal", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Validation error");
    });
  });

  describe("GET /api/journal/[id]", () => {
    it("should return journal entry when authenticated and entry exists", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { prisma } = require("@/lib/prisma");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      prisma.journalEntry.findFirst.mockResolvedValue({
        id: "entry1",
        content: "Test entry",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/journal/entry1"
      );
      const response = await GETById(request, { params: { id: "entry1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("entry1");
    });

    it("should return 404 when entry not found", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { prisma } = require("@/lib/prisma");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      prisma.journalEntry.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/journal/nonexistent"
      );
      const response = await GETById(request, {
        params: { id: "nonexistent" },
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Journal entry not found");
    });
  });

  describe("PUT /api/journal/[id]", () => {
    it("should update journal entry successfully", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { validateRequest } = require("@/utils/validation");
      const { prisma } = require("@/lib/prisma");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      prisma.journalEntry.findFirst.mockResolvedValue({
        id: "entry1",
        content: "Original content",
        userId: "user1",
      });

      validateRequest.mockResolvedValue({
        content: "Updated content",
        tags: ["updated", "tags"],
      });

      prisma.journalEntry.update.mockResolvedValue({
        id: "entry1",
        content: "Updated content",
        tags: ["updated", "tags"],
        updatedAt: new Date(),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/journal/entry1",
        {
          method: "PUT",
          body: JSON.stringify({
            content: "Updated content",
            tags: ["updated", "tags"],
          }),
        }
      );

      const response = await PUT(request, { params: { id: "entry1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.content).toBe("Updated content");
    });
  });

  describe("DELETE /api/journal/[id]", () => {
    it("should delete journal entry successfully", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { prisma } = require("@/lib/prisma");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      prisma.journalEntry.findFirst.mockResolvedValue({
        id: "entry1",
        content: "Test entry",
        userId: "user1",
      });

      prisma.journalEntry.delete.mockResolvedValue({
        id: "entry1",
      });

      const request = new NextRequest(
        "http://localhost:3000/api/journal/entry1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request, { params: { id: "entry1" } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Journal entry deleted successfully");
    });
  });
});

describe("Voice Upload API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/voice/upload-url", () => {
    it("should return signed upload URL for valid request", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { validateRequest } = require("@/utils/validation");
      const { generateSignedUploadUrl } = require("@/lib/s3");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      validateRequest.mockResolvedValue({
        fileName: "test.mp3",
        contentType: "audio/mp3",
      });

      generateSignedUploadUrl.mockResolvedValue(
        "https://s3.amazonaws.com/signed-url"
      );

      const request = new NextRequest(
        "http://localhost:3000/api/voice/upload-url?fileName=test.mp3&contentType=audio/mp3"
      );
      const response = await GETUploadUrl(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.uploadUrl).toBe("https://s3.amazonaws.com/signed-url");
      expect(data.data.contentType).toBe("audio/mp3");
    });

    it("should return 400 for invalid file type", async () => {
      const { requireAuthWithProfile } = require("@/utils/auth");
      const { validateRequest } = require("@/utils/validation");

      requireAuthWithProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      validateRequest.mockRejectedValue(
        new Error("Validation error: Only MP3 files are allowed")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/voice/upload-url?fileName=test.wav&contentType=audio/wav"
      );
      const response = await GETUploadUrl(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Only MP3 files are allowed");
    });
  });
});
