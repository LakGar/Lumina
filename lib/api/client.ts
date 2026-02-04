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
    const err = new Error((json as { error?: string }).error ?? res.statusText) as Error & {
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
      api<{ data: Array<{ id: number; title: string; public: boolean; createdAt: string; updatedAt: string; _count?: { entries: number } }> }>(
        "/api/journals",
        { schema: z.object({ data: z.array(z.object({ id: z.number(), title: z.string(), public: z.boolean(), createdAt: z.string(), updatedAt: z.string(), _count: z.object({ entries: z.number() }).optional() })) }) },
      ),
    create: (title: string) =>
      api<{ data: { id: number; title: string } }>("/api/journals", {
        method: "POST",
        body: { title },
        schema: z.object({ data: z.object({ id: z.number(), title: z.string() }) }),
      }),
    get: (id: number) =>
      api<{ data: { id: number; title: string; public: boolean } }>(`/api/journals/${id}`, {
        schema: z.object({ data: z.object({ id: z.number(), title: z.string(), public: z.boolean() }) }),
      }),
    update: (id: number, body: { title?: string; public?: boolean }) =>
      api<{ data: unknown }>(`/api/journals/${id}`, { method: "PATCH", body }),
    delete: (id: number) => api(`/api/journals/${id}`, { method: "DELETE" }),
  },
  entries: {
    listByJournal: (journalId: number) =>
      api<{ data: Array<{ id: number; journalId: number; content: string; source: string; createdAt: string; updatedAt: string; summary: { id: number; text: string } | null; mood: { id: number; label: string } | null; tags: Array<{ tag: string; source: string }> }> }>(
        `/api/journals/${journalId}/entries`,
        { schema: z.object({ data: z.array(z.any()) }) },
      ),
    create: (journalId: number, content: string, source: "TEXT" | "VOICE" = "TEXT") =>
      api<{ data: unknown }>(`/api/journals/${journalId}/entries`, {
        method: "POST",
        body: { content, source },
      }),
    get: (id: number) =>
      api<{ data: unknown }>(`/api/entries/${id}`, { schema: z.object({ data: z.any() }) }),
    update: (id: number, body: { content?: string }) =>
      api<{ data: unknown }>(`/api/entries/${id}`, { method: "PATCH", body }),
    delete: (id: number) => api(`/api/entries/${id}`, { method: "DELETE" }),
  },
  me: {
    entries: (limit = 50) =>
      api<{ data: Array<{ id: number; journalId: number; content: string; createdAt: string; summary: { text: string } | null; mood: { label: string } | null; tags: Array<{ tag: string }>; journal: { id: number; title: string } }> }>(
        `/api/users/me/entries?limit=${limit}`,
        { schema: z.object({ data: z.array(z.any()) }) },
      ),
    preferences: {
      get: () =>
        api<{ data: unknown }>("/api/users/me/preferences", { schema: z.object({ data: z.any() }) }),
      update: (body: { theme?: string; goal?: string | null; topics?: string | null }) =>
        api<{ data: unknown }>("/api/users/me/preferences", { method: "PATCH", body }),
    },
    notification: {
      get: () =>
        api<{ data: unknown }>("/api/users/me/notification", { schema: z.object({ data: z.any() }) }),
      update: (body: { dailyReminderEnabled?: boolean; dailyReminderTime?: string | null; timezone?: string | null; frequency?: string | null }) =>
        api<{ data: unknown }>("/api/users/me/notification", { method: "PATCH", body }),
    },
  },
  billing: {
    checkout: () =>
      api<{ data: { url: string; sessionId: string } }>("/api/billing/checkout", {
        method: "POST",
        schema: z.object({ data: z.object({ url: z.string(), sessionId: z.string() }) }),
      }),
    portal: () =>
      api<{ data: { url: string } }>("/api/billing/portal", {
        method: "POST",
        schema: z.object({ data: z.object({ url: z.string() }) }),
      }),
  },
  moods: {
    list: () => api<{ data: unknown[] }>("/api/moods", { schema: z.object({ data: z.array(z.any()) }) }),
  },
};
