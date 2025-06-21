import { z } from "zod";

// Journal Entry validation schemas
export const createJournalEntrySchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content too long"),
  voiceUrl: z.string().url().optional(),
});

export const updateJournalEntrySchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content too long")
    .optional(),
  voiceUrl: z.string().url().optional(),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  filters: z
    .object({
      mood: z.string().optional(),
      tags: z.array(z.string()).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Settings validation schema
export const updateSettingsSchema = z.object({
  aiMemoryEnabled: z.boolean().optional(),
  moodAnalysisEnabled: z.boolean().optional(),
  summaryGenerationEnabled: z.boolean().optional(),
});

// Subscription validation schema
export const createSubscriptionSchema = z.object({
  plan: z.enum(["pro", "premium"]),
  stripeToken: z.string().optional(),
});

// Chat validation schema
export const chatSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long"),
  sessionId: z.string().optional(),
});

// Voice upload validation schema
export const signedUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().regex(/^audio\/mp3$/, "Only MP3 files are allowed"),
});

// Export validation schema
export const exportSchema = z.object({
  format: z.enum(["json", "pdf", "markdown"]),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
});

// Generic validation function
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
}
