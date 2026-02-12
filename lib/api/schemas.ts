import { z } from "zod";

export const journalSchema = z.object({
  id: z.number(),
  title: z.string(),
  public: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({ entries: z.number() }).optional(),
});

export const entryTagSchema = z.object({
  id: z.number().optional(),
  tag: z.string(),
  source: z.enum(["AI", "USER"]),
});

export const entrySummarySchema = z
  .object({
    id: z.number(),
    text: z.string(),
    model: z.string().nullable(),
    qualityScore: z.number().nullable().optional(),
    createdAt: z.string(),
  })
  .nullable();

export const entryMoodSchema = z
  .object({
    id: z.number(),
    label: z.string(),
    score: z.number().nullable(),
    createdAt: z.string(),
  })
  .nullable();

export const entrySchema = z.object({
  id: z.number(),
  journalId: z.number(),
  content: z.string(),
  source: z.enum(["TEXT", "VOICE", "MIXED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  summary: entrySummarySchema,
  mood: entryMoodSchema,
  tags: z.array(entryTagSchema),
});

export const entryWithJournalSchema = entrySchema.extend({
  journal: z.object({ id: z.number(), title: z.string() }),
});

export const moodSchema = z.object({
  id: z.number(),
  title: z.string(),
  note: z.string().nullable(),
  authorId: z.number(),
});

export const preferencesSchema = z.object({
  id: z.number(),
  theme: z.enum(["DARK", "LIGHT", "SYSTEM"]),
  goal: z.string().nullable(),
  topics: z.string().nullable(),
  reason: z.string().nullable(),
  aiSummariesEnabled: z.boolean().optional(),
  autoTaggingEnabled: z.boolean().optional(),
  moodDetectionEnabled: z.boolean().optional(),
  aiTone: z.string().nullable().optional(),
});

export const notificationSchema = z.object({
  id: z.number(),
  dailyReminderEnabled: z.boolean(),
  dailyReminderTime: z.string().nullable(),
  timezone: z.string().nullable(),
  frequency: z.enum(["DAILY", "WEEKLY", "ALTERNATE"]).nullable(),
});

export const billingCheckoutSchema = z.object({
  data: z.object({ url: z.string(), sessionId: z.string() }),
});

export const billingPortalSchema = z.object({
  data: z.object({ url: z.string() }),
});

// ——— Entry AI (summary, mood, tags, quality score) ———
export const entryAiResponseSchema = z.object({
  summary: z.string(),
  mood: z.string(),
  tags: z.array(z.string()),
  qualityScore: z.number().min(0).max(100).optional(),
});

// ——— Go deeper: insightful questions to improve the entry ———
export const goDeeperResponseSchema = z.object({
  questions: z.array(z.string()),
});

// ——— Chat (journal-context) ———
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});
export const chatSendRequestSchema = z.object({
  message: z.string(),
  sessionId: z.number().optional(),
});
export const chatSendResponseSchema = z.object({
  data: z.object({
    reply: z.string(),
    sessionId: z.number(),
    messageId: z.number().optional(),
  }),
});

// ——— Weekly tip (title, short description, detailed text) ———
export const weeklyTipSchema = z.object({
  id: z.number(),
  title: z.string(),
  shortDescription: z.string(),
  detailedText: z.string(),
  tipType: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});
export const weeklyTipListSchema = z.object({ data: z.array(weeklyTipSchema) });
export const weeklyTipDetailSchema = z.object({ data: weeklyTipSchema });

export type Journal = z.infer<typeof journalSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type EntryWithJournal = z.infer<typeof entryWithJournalSchema>;
export type Mood = z.infer<typeof moodSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type EntryAiResponse = z.infer<typeof entryAiResponseSchema>;
export type GoDeeperResponse = z.infer<typeof goDeeperResponseSchema>;
export type WeeklyTip = z.infer<typeof weeklyTipSchema>;
