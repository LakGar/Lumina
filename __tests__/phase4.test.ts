import { NextRequest } from "next/server";
import { GET as GETSearch } from "@/app/api/search/route";
import { POST as POSTChat } from "@/app/api/chat/route";
import { GET as GETInsights } from "@/app/api/insights/route";
import { GET as GETExport } from "@/app/api/export/route";

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
      findMany: jest.fn(),
      count: jest.fn(),
    },
    settings: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock OpenAI
jest.mock("@/lib/openai", () => ({
  openai: {
    embeddings: {
      create: jest.fn(),
    },
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

// Mock Pinecone
jest.mock("@/lib/pinecone", () => ({
  getPineconeIndex: jest.fn(() => ({
    query: jest.fn(),
  })),
}));

// Mock S3
jest.mock("@/lib/s3", () => ({
  generateSignedDownloadUrl: jest.fn(),
}));

describe("Phase 4 API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = { id: "user1", email: "test@example.com" };
  const mockProfile = {
    id: "profile1",
    userId: "user1",
    membershipTier: "pro",
  };

  describe("Search API", () => {
    describe("GET /api/search", () => {
      it("should perform keyword search for free users", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: { ...mockProfile, membershipTier: "free" },
        });

        validateRequest.mockResolvedValue({
          q: "test query",
          page: 1,
          limit: 10,
        });

        prisma.journalEntry.count.mockResolvedValue(5);
        prisma.journalEntry.findMany.mockResolvedValue([
          {
            id: "entry1",
            content: "Test content",
            summary: "Test summary",
            tags: ["test"],
            mood: "happy",
            createdAt: new Date(),
          },
        ]);

        const request = new NextRequest(
          "http://localhost:3000/api/search?q=test"
        );
        const response = await GETSearch(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.searchMethod).toBe("keyword");
        expect(data.data.results).toHaveLength(1);
      });

      it("should perform semantic search for pro users", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { openai } = require("@/lib/openai");
        const { getPineconeIndex } = require("@/lib/pinecone");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: { ...mockProfile, membershipTier: "pro" },
        });

        validateRequest.mockResolvedValue({
          q: "test query",
          page: 1,
          limit: 10,
        });

        openai.embeddings.create.mockResolvedValue({
          data: [{ embedding: [0.1, 0.2, 0.3] }],
        });

        getPineconeIndex().query.mockResolvedValue({
          matches: [
            {
              metadata: { entryId: "entry1" },
              score: 0.9,
            },
          ],
        });

        prisma.journalEntry.findMany.mockResolvedValue([
          {
            id: "entry1",
            content: "Test content",
            summary: "Test summary",
            tags: ["test"],
            mood: "happy",
            createdAt: new Date(),
          },
        ]);

        const request = new NextRequest(
          "http://localhost:3000/api/search?q=test"
        );
        const response = await GETSearch(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.searchMethod).toBe("semantic");
        expect(data.data.results).toHaveLength(1);
      });

      it("should handle search filters correctly", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: { ...mockProfile, membershipTier: "free" },
        });

        validateRequest.mockResolvedValue({
          q: "test query",
          tags: ["work", "personal"],
          mood: "happy",
          startDate: "2024-01-01T00:00:00.000Z",
          endDate: "2024-12-31T23:59:59.999Z",
          page: 1,
          limit: 10,
        });

        prisma.journalEntry.count.mockResolvedValue(2);
        prisma.journalEntry.findMany.mockResolvedValue([]);

        const request = new NextRequest(
          "http://localhost:3000/api/search?q=test&tags[]=work&tags[]=personal&mood=happy&startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z"
        );
        const response = await GETSearch(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });
  });

  describe("Chat API", () => {
    describe("POST /api/chat", () => {
      it("should return streaming response for valid chat request", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");
        const { openai } = require("@/lib/openai");
        const { getPineconeIndex } = require("@/lib/pinecone");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        prisma.settings.findUnique.mockResolvedValue({
          aiMemoryEnabled: true,
        });

        validateRequest.mockResolvedValue({
          prompt: "What have I been feeling about work lately?",
          sessionId: "session1",
        });

        openai.embeddings.create.mockResolvedValue({
          data: [{ embedding: [0.1, 0.2, 0.3] }],
        });

        getPineconeIndex().query.mockResolvedValue({
          matches: [
            {
              metadata: { entryId: "entry1" },
              score: 0.9,
            },
          ],
        });

        prisma.journalEntry.findMany.mockResolvedValue([
          {
            id: "entry1",
            content: "I had a great day at work today.",
            summary: "Positive work experience",
            tags: ["work", "positive"],
            mood: "happy",
            createdAt: new Date(),
          },
        ]);

        // Mock streaming response
        const mockStream = {
          [Symbol.asyncIterator]: async function* () {
            yield {
              choices: [
                { delta: { content: "Based on your journal entries" } },
              ],
            };
            yield {
              choices: [
                {
                  delta: {
                    content: ", you seem to be feeling positive about work.",
                  },
                },
              ],
            };
          },
        };

        openai.chat.completions.create.mockResolvedValue(mockStream);

        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          body: JSON.stringify({
            prompt: "What have I been feeling about work lately?",
            sessionId: "session1",
          }),
        });

        const response = await POSTChat(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
      });

      it("should return 403 when AI memory is disabled", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        prisma.settings.findUnique.mockResolvedValue({
          aiMemoryEnabled: false,
        });

        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          body: JSON.stringify({
            prompt: "What have I been feeling about work lately?",
          }),
        });

        const response = await POSTChat(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error).toBe("AI memory is disabled in your settings");
      });

      it("should handle chat with no context gracefully", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");
        const { openai } = require("@/lib/openai");
        const { getPineconeIndex } = require("@/lib/pinecone");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        prisma.settings.findUnique.mockResolvedValue({
          aiMemoryEnabled: true,
        });

        validateRequest.mockResolvedValue({
          prompt: "What have I been feeling about work lately?",
        });

        openai.embeddings.create.mockResolvedValue({
          data: [{ embedding: [0.1, 0.2, 0.3] }],
        });

        getPineconeIndex().query.mockResolvedValue({
          matches: [],
        });

        const mockStream = {
          [Symbol.asyncIterator]: async function* () {
            yield {
              choices: [{ delta: { content: "I don't have enough context" } }],
            };
          },
        };

        openai.chat.completions.create.mockResolvedValue(mockStream);

        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          body: JSON.stringify({
            prompt: "What have I been feeling about work lately?",
          }),
        });

        const response = await POSTChat(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
      });
    });
  });

  describe("Insights API", () => {
    describe("GET /api/insights", () => {
      it("should return mood trends and analytics", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        validateRequest.mockResolvedValue({
          groupBy: "day",
        });

        prisma.journalEntry.findMany.mockResolvedValue([
          {
            mood: "happy",
            createdAt: new Date("2024-01-01"),
            tags: ["work", "personal"],
          },
          {
            mood: "sad",
            createdAt: new Date("2024-01-02"),
            tags: ["personal"],
          },
        ]);

        const request = new NextRequest("http://localhost:3000/api/insights");
        const response = await GETInsights(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty("moodTrends");
        expect(data.data).toHaveProperty("topTags");
        expect(data.data).toHaveProperty("entryFrequency");
        expect(data.data).toHaveProperty("totalEntries");
      });

      it("should handle date range filters", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        validateRequest.mockResolvedValue({
          startDate: "2024-01-01T00:00:00.000Z",
          endDate: "2024-12-31T23:59:59.999Z",
          groupBy: "week",
        });

        prisma.journalEntry.findMany.mockResolvedValue([]);

        const request = new NextRequest(
          "http://localhost:3000/api/insights?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z&groupBy=week"
        );
        const response = await GETInsights(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });
  });

  describe("Export API", () => {
    describe("GET /api/export", () => {
      it("should generate JSON export for free users", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: { ...mockProfile, membershipTier: "free" },
        });

        validateRequest.mockResolvedValue({
          format: "json",
          includeSummaries: true,
          includeTags: true,
          includeMood: true,
        });

        prisma.journalEntry.findMany.mockResolvedValue([
          {
            id: "entry1",
            content: "Test content",
            summary: "Test summary",
            tags: ["test"],
            mood: "happy",
            voiceUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        const request = new NextRequest(
          "http://localhost:3000/api/export?format=json"
        );
        const response = await GETExport(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.format).toBe("json");
        expect(data.data.totalEntries).toBe(1);
        expect(data.data.downloadUrl).toBeDefined();
      });

      it("should allow PDF export for pro users", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: { ...mockProfile, membershipTier: "pro" },
        });

        validateRequest.mockResolvedValue({
          format: "pdf",
          includeSummaries: true,
          includeTags: true,
          includeMood: true,
        });

        prisma.journalEntry.findMany.mockResolvedValue([
          {
            id: "entry1",
            content: "Test content",
            summary: "Test summary",
            tags: ["test"],
            mood: "happy",
            voiceUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        const request = new NextRequest(
          "http://localhost:3000/api/export?format=pdf"
        );
        const response = await GETExport(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.format).toBe("pdf");
      });

      it("should reject PDF export for free users", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: { ...mockProfile, membershipTier: "free" },
        });

        validateRequest.mockResolvedValue({
          format: "pdf",
        });

        const request = new NextRequest(
          "http://localhost:3000/api/export?format=pdf"
        );
        const response = await GETExport(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error).toBe(
          "PDF and Markdown exports require Pro or Premium membership"
        );
      });

      it("should handle date range filters in export", async () => {
        const { requireAuthWithProfile } = require("@/utils/auth");
        const { validateRequest } = require("@/utils/validation");
        const { prisma } = require("@/lib/prisma");

        requireAuthWithProfile.mockResolvedValue({
          user: mockUser,
          profile: mockProfile,
        });

        validateRequest.mockResolvedValue({
          format: "json",
          startDate: "2024-01-01T00:00:00.000Z",
          endDate: "2024-12-31T23:59:59.999Z",
          includeSummaries: true,
          includeTags: true,
          includeMood: true,
        });

        prisma.journalEntry.findMany.mockResolvedValue([]);

        const request = new NextRequest(
          "http://localhost:3000/api/export?format=json&startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z"
        );
        const response = await GETExport(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.totalEntries).toBe(0);
      });
    });
  });
});
