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

export type Journal = z.infer<typeof journalSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type EntryWithJournal = z.infer<typeof entryWithJournalSchema>;
export type Mood = z.infer<typeof moodSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Notification = z.infer<typeof notificationSchema>;
