"use client";

import { z } from "zod";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

async function api<T>(
  path: string,
  options: { method?: Method; body?: unknown; schema?: z.ZodType<T> } = {},
): Promise<T> {
  const { method = "GET", body, schema } = options;
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(
      (json as { error?: string }).error ?? res.statusText,
    ) as Error & {
      status: number;
    };
    err.status = res.status;
    throw err;
  }
  if (schema) return schema.parse(json) as T;
  return json as T;
}

export const apiClient = {
  journals: {
    list: () =>
      api<{
        data: Array<{
          id: number;
          title: string;
          public: boolean;
          createdAt: string;
          updatedAt: string;
          _count?: { entries: number };
        }>;
      }>("/api/journals", {
        schema: z.object({
          data: z.array(
            z.object({
              id: z.number(),
              title: z.string(),
              public: z.boolean(),
              createdAt: z.string(),
              updatedAt: z.string(),
              _count: z.object({ entries: z.number() }).optional(),
            }),
          ),
        }),
      }),
    create: (title: string) =>
      api<{ data: { id: number; title: string } }>("/api/journals", {
        method: "POST",
        body: { title },
        schema: z.object({
          data: z.object({ id: z.number(), title: z.string() }),
        }),
      }),
    get: (id: number) =>
      api<{ data: { id: number; title: string; public: boolean } }>(
        `/api/journals/${id}`,
        {
          schema: z.object({
            data: z.object({
              id: z.number(),
              title: z.string(),
              public: z.boolean(),
            }),
          }),
        },
      ),
    update: (id: number, body: { title?: string; public?: boolean }) =>
      api<{ data: unknown }>(`/api/journals/${id}`, { method: "PATCH", body }),
    delete: (id: number) => api(`/api/journals/${id}`, { method: "DELETE" }),
  },
  entries: {
    listByJournal: (
      journalId: number,
      opts?: {
        sort?: "newest" | "oldest" | "lastEdited";
        limit?: number;
        offset?: number;
      },
    ) => {
      const params = new URLSearchParams();
      if (opts?.sort) params.set("sort", opts.sort);
      if (opts?.limit != null) params.set("limit", String(opts.limit));
      if (opts?.offset != null) params.set("offset", String(opts.offset));
      const q = params.toString();
      return api<{
        data: Array<{
          id: number;
          journalId: number;
          content: string;
          source: string;
          createdAt: string;
          updatedAt: string;
          summary: { id: number; text: string } | null;
          mood: { id: number; label: string } | null;
          tags: Array<{ tag: string; source: string }>;
        }>;
        total?: number;
      }>(`/api/journals/${journalId}/entries${q ? `?${q}` : ""}`, {
        schema: z.object({
          data: z.array(z.any()),
          total: z.number().optional(),
        }),
      });
    },
    create: (
      journalId: number,
      content: string,
      source: "TEXT" | "VOICE" = "TEXT",
      opts?: { mood?: string; tags?: string[] },
    ) =>
      api<{ data: unknown }>(`/api/journals/${journalId}/entries`, {
        method: "POST",
        body: { content, source, mood: opts?.mood, tags: opts?.tags },
      }),
    get: (id: number) =>
      api<{ data: unknown }>(`/api/entries/${id}`, {
        schema: z.object({ data: z.any() }),
      }),
    update: (
      id: number,
      body: { content?: string; mood?: string; tags?: string[] },
    ) =>
      api<{ data: unknown }>(`/api/entries/${id}`, { method: "PATCH", body }),
    delete: (id: number) => api(`/api/entries/${id}`, { method: "DELETE" }),
    setMood: (id: number, label: string) =>
      api<{ data: unknown }>(`/api/entries/${id}/mood`, {
        method: "PUT",
        body: { label },
      }),
    addTag: (id: number, tag: string) =>
      api<{ data: unknown }>(`/api/entries/${id}/tags`, {
        method: "POST",
        body: { tag },
      }),
    removeTag: (id: number, tag: string) =>
      api(`/api/entries/${id}/tags/${encodeURIComponent(tag)}`, {
        method: "DELETE",
      }),
    regenerateAi: (id: number) =>
      api<{ data: unknown }>(`/api/entries/${id}/regenerate-ai`, {
        method: "POST",
      }),
    goDeeper: (id: number, currentContent?: string) =>
      api<{ data: { questions: string[] } }>(`/api/entries/${id}/go-deeper`, {
        method: "POST",
        body: currentContent != null ? { currentContent } : {},
      }),
  },
  chat: {
    send: (journalId: number, message: string, sessionId?: number) =>
      api<{ data: { reply: string; sessionId: number } }>(
        `/api/journals/${journalId}/chat`,
        {
          method: "POST",
          body: sessionId != null ? { message, sessionId } : { message },
        },
      ),
  },
  me: {
    entries: (limit = 50, from?: string, to?: string) => {
      const params = new URLSearchParams({
        limit: String(Math.min(limit, 300)),
      });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      return api<{
        data: Array<{
          id: number;
          journalId: number;
          content: string;
          createdAt: string;
          summary: { text: string } | null;
          mood: { label: string } | null;
          tags: Array<{ tag: string }>;
          journal: { id: number; title: string };
        }>;
      }>(`/api/users/me/entries?${params}`, {
        schema: z.object({ data: z.array(z.any()) }),
      });
    },
    stats: () =>
      api<{
        data: {
          luminaScore: number;
          luminaLevel: number;
          lastJournal: {
            title: string;
            journalId: number;
            daysAgo: number;
          } | null;
          entriesThisWeek: number;
          moodScore: number | null;
          entryQualityScore: number | null;
          currentStreak: number;
          reflections: number;
          gratitudeEntries: number;
          wordsPerEntry: number | null;
          consistency: number;
          promptsCompleted: number;
        };
      }>("/api/users/me/stats", { schema: z.object({ data: z.any() }) }),
    reminders: {
      list: (from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        return api<{
          data: Array<{
            id: number;
            dateISO: string;
            time: string;
            repeat: string;
            title: string;
            journalId: number | null;
            createdAt: string;
            updatedAt: string;
          }>;
        }>(`/api/users/me/reminders${params.toString() ? `?${params}` : ""}`, {
          schema: z.object({ data: z.array(z.any()) }),
        });
      },
      create: (body: {
        dateISO: string;
        time: string;
        repeat?: string;
        title: string;
        journalId?: number | null;
      }) =>
        api<{ data: unknown }>("/api/users/me/reminders", {
          method: "POST",
          body,
        }),
      update: (
        id: number,
        body: {
          dateISO?: string;
          time?: string;
          repeat?: string;
          title?: string;
          journalId?: number | null;
        },
      ) =>
        api<{ data: unknown }>(`/api/users/me/reminders/${id}`, {
          method: "PATCH",
          body,
        }),
      delete: (id: number) =>
        api(`/api/users/me/reminders/${id}`, { method: "DELETE" }),
    },
    weeklyTips: {
      list: (limit = 10) =>
        api<{
          data: Array<{
            id: number;
            title: string;
            shortDescription: string;
            detailedText: string;
            tipType: string | null;
            readAt: string | null;
            createdAt: string;
          }>;
        }>(`/api/users/me/weekly-tips?limit=${limit}`, {
          schema: z.object({ data: z.array(z.any()) }),
        }),
      generate: () =>
        api<{
          data: {
            id: number;
            title: string;
            shortDescription: string;
            detailedText: string;
            tipType: string | null;
            readAt: string | null;
            createdAt: string;
          };
        }>("/api/users/me/weekly-tips/generate", {
          method: "POST",
          schema: z.object({ data: z.any() }),
        }),
      markRead: (id: number) =>
        api(`/api/users/me/weekly-tips/${id}/read`, { method: "PATCH" }),
    },
    deleteAllJournals: () =>
      api("/api/users/me/journals", { method: "DELETE" }),
    deleteAiData: () => api("/api/users/me/ai-data", { method: "DELETE" }),
    deleteAllData: () =>
      api("/api/users/me/delete-all-data", { method: "POST", body: {} }),
    preferences: {
      get: () =>
        api<{ data: unknown }>("/api/users/me/preferences", {
          schema: z.object({ data: z.any() }),
        }),
      update: (body: {
        theme?: string;
        goal?: string | null;
        topics?: string | null;
      }) =>
        api<{ data: unknown }>("/api/users/me/preferences", {
          method: "PATCH",
          body,
        }),
    },
    notification: {
      get: () =>
        api<{ data: unknown }>("/api/users/me/notification", {
          schema: z.object({ data: z.any() }),
        }),
      update: (body: {
        dailyReminderEnabled?: boolean;
        dailyReminderTime?: string | null;
        timezone?: string | null;
        frequency?: string | null;
      }) =>
        api<{ data: unknown }>("/api/users/me/notification", {
          method: "PATCH",
          body,
        }),
    },
  },
  billing: {
    checkout: () =>
      api<{ data: { url: string; sessionId: string } }>(
        "/api/billing/checkout",
        {
          method: "POST",
          schema: z.object({
            data: z.object({ url: z.string(), sessionId: z.string() }),
          }),
        },
      ),
    portal: () =>
      api<{ data: { url: string } }>("/api/billing/portal", {
        method: "POST",
        schema: z.object({ data: z.object({ url: z.string() }) }),
      }),
    subscription: () =>
      api<{
        data: {
          status: "active" | "canceled" | "past_due" | "trialing" | null;
          planId?: string;
        };
      }>("/api/users/me/subscription", {
        schema: z.object({
          data: z.object({
            status: z
              .enum(["active", "canceled", "past_due", "trialing"])
              .nullable(),
            planId: z.string().optional(),
          }),
        }),
      }),
    sync: () =>
      api<{
        data: {
          status: "active" | "canceled" | "past_due" | "trialing" | null;
          planId?: string;
        };
      }>("/api/billing/sync", {
        method: "POST",
        schema: z.object({
          data: z.object({
            status: z
              .enum(["active", "canceled", "past_due", "trialing"])
              .nullable(),
            planId: z.string().optional(),
          }),
        }),
      }),
  },
  moods: {
    list: () =>
      api<{ data: unknown[] }>("/api/moods", {
        schema: z.object({ data: z.array(z.any()) }),
      }),
    get: (id: number) =>
      api<{ data: { id: number; title: string; note: string | null } }>(
        `/api/moods/${id}`,
        {
          schema: z.object({
            data: z.object({
              id: z.number(),
              title: z.string(),
              note: z.string().nullable(),
            }),
          }),
        },
      ),
    create: (title: string, note?: string | null) =>
      api<{ data: { id: number; title: string; note: string | null } }>(
        "/api/moods",
        {
          method: "POST",
          body: { title, note: note ?? undefined },
          schema: z.object({
            data: z.object({
              id: z.number(),
              title: z.string(),
              note: z.string().nullable(),
            }),
          }),
        },
      ),
    update: (id: number, body: { title?: string; note?: string | null }) =>
      api<{ data: unknown }>(`/api/moods/${id}`, { method: "PATCH", body }),
    delete: (id: number) => api(`/api/moods/${id}`, { method: "DELETE" }),
  },
};
