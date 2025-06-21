import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  searchSchema,
  updateSettingsSchema,
  createSubscriptionSchema,
  chatSchema,
  signedUrlSchema,
  exportSchema,
} from "../../utils/validation";

describe("Validation Schemas", () => {
  describe("createJournalEntrySchema", () => {
    it("should validate valid journal entry data", () => {
      const validData = {
        content: "This is a test journal entry",
        voiceUrl: "https://example.com/audio.mp3",
      };

      const result = createJournalEntrySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require content field", () => {
      const invalidData = {
        voiceUrl: "https://example.com/audio.mp3",
      };

      const result = createJournalEntrySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["content"]);
      }
    });

    it("should allow optional voiceUrl", () => {
      const validData = {
        content: "This is a test journal entry",
      };

      const result = createJournalEntrySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("updateJournalEntrySchema", () => {
    it("should validate valid update data", () => {
      const validData = {
        content: "Updated journal entry",
        voiceUrl: "https://example.com/new-audio.mp3",
      };

      const result = updateJournalEntrySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should allow partial updates", () => {
      const validData = {
        content: "Only updating content",
      };

      const result = updateJournalEntrySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("searchSchema", () => {
    it("should validate valid search parameters", () => {
      const validData = {
        query: "test search",
        filters: {
          mood: "happy",
          tags: ["work", "personal"],
          dateFrom: "2024-01-01",
          dateTo: "2024-12-31",
        },
        page: 1,
        limit: 10,
      };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require query field", () => {
      const invalidData = {
        filters: { mood: "happy" },
        page: 1,
      };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["query"]);
      }
    });

    it("should validate page and limit ranges", () => {
      const invalidData = {
        query: "test",
        page: 0, // should be >= 1
        limit: 0, // should be >= 1
      };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateSettingsSchema", () => {
    it("should validate valid settings data", () => {
      const validData = {
        aiMemoryEnabled: true,
        moodAnalysisEnabled: false,
        summaryGenerationEnabled: true,
      };

      const result = updateSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should allow partial updates", () => {
      const validData = {
        aiMemoryEnabled: false,
      };

      const result = updateSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate boolean values", () => {
      const invalidData = {
        aiMemoryEnabled: "not a boolean",
      };

      const result = updateSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("createSubscriptionSchema", () => {
    it("should validate valid subscription data", () => {
      const validData = {
        plan: "pro",
        stripeCustomerId: "cus_123456789",
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate plan enum values", () => {
      const invalidData = {
        plan: "invalid_plan",
        stripeCustomerId: "cus_123456789",
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should require plan field", () => {
      const invalidData = {
        stripeCustomerId: "cus_123456789",
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("chatSchema", () => {
    it("should validate valid chat data", () => {
      const validData = {
        message: "Hello, how are you?",
        context: "previous conversation context",
      };

      const result = chatSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require message field", () => {
      const invalidData = {
        context: "some context",
      };

      const result = chatSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate message length", () => {
      const invalidData = {
        message: "a".repeat(10001), // too long
      };

      const result = chatSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("signedUrlSchema", () => {
    it("should validate valid signed URL data", () => {
      const validData = {
        fileName: "test.mp3",
        contentType: "audio/mp3",
      };

      const result = signedUrlSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require fileName field", () => {
      const invalidData = {
        contentType: "audio/mp3",
      };

      const result = signedUrlSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate contentType format", () => {
      const invalidData = {
        fileName: "test.mp3",
        contentType: "invalid-type",
      };

      const result = signedUrlSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("exportSchema", () => {
    it("should validate valid export data", () => {
      const validData = {
        format: "json",
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
        includeVoice: true,
      };

      const result = exportSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate format enum values", () => {
      const invalidData = {
        format: "invalid_format",
        dateFrom: "2024-01-01",
      };

      const result = exportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should require format field", () => {
      const invalidData = {
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      };

      const result = exportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
