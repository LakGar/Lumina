"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  format,
  parseISO,
  differenceInCalendarDays,
} from "date-fns";

export function useJournals() {
  return useQuery({
    queryKey: ["journals"],
    queryFn: () => apiClient.journals.list(),
  });
}

export function useRecentEntries(limit = 50) {
  return useQuery({
    queryKey: ["me", "entries", limit],
    queryFn: () => apiClient.me.entries(limit),
  });
}

export type TableRow = {
  id: number;
  title: string;
  journal: string;
  date: string;
  mood: string;
  wordCount: number;
  entry?: unknown;
};

export function useDashboardData() {
  const journals = useJournals();
  const entries = useRecentEntries(50);

  const tableRows: TableRow[] = useMemo(() => {
    const list = entries.data?.data ?? [];
    return list.map((e) => ({
      id: e.id,
      title:
        (e.summary?.text?.slice(0, 60) ?? e.content.slice(0, 60).replace(/\n/g, " ")) ||
        "Untitled",
      journal: e.journal?.title ?? "—",
      date: e.createdAt,
      mood: e.mood?.label ?? "—",
      wordCount: e.content.trim() ? e.content.trim().split(/\s+/).length : 0,
      entry: e,
    }));
  }, [entries.data]);

  const contributionData = useMemo(() => {
    const list = entries.data?.data ?? [];
    const byDate = new Map<string, number>();
    for (const e of list) {
      const d = format(parseISO(e.createdAt), "yyyy-MM-dd");
      byDate.set(d, (byDate.get(d) ?? 0) + 1);
    }
    return Array.from(byDate.entries()).map(([date, count]) => ({ date, count }));
  }, [entries.data]);

  const stats = useMemo(() => {
    const list = entries.data?.data ?? [];
    const journalList = journals.data?.data ?? [];
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    let thisWeek = 0;
    let lastWeekCount = 0;
    const daysWithEntries = new Set<string>();
    const moodCounts = new Map<string, number>();
    for (const e of list) {
      const d = parseISO(e.createdAt);
      const dateStr = format(d, "yyyy-MM-dd");
      daysWithEntries.add(dateStr);
      if (d >= weekStart && d <= weekEnd) thisWeek++;
      if (d >= lastWeekStart && d <= lastWeekEnd) lastWeekCount++;
      const mood = e.mood?.label ?? "—";
      moodCounts.set(mood, (moodCounts.get(mood) ?? 0) + 1);
    }
    const sortedDays = Array.from(daysWithEntries).sort();
    let streak = 0;
    if (sortedDays.length > 0) {
      const today = format(now, "yyyy-MM-dd");
      let check = today;
      while (sortedDays.includes(check)) {
        streak++;
        const next = new Date(check);
        next.setDate(next.getDate() - 1);
        check = format(next, "yyyy-MM-dd");
      }
    }
    const topMood =
      Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const journalTitles = journalList
      .map((j: { title?: string }) => j.title)
      .filter(Boolean)
      .slice(0, 4)
      .join(", ");
    return {
      entriesThisWeek: thisWeek,
      lastWeekCount,
      streak,
      journalCount: journalList.length,
      journalTitles: journalTitles || undefined,
      topMood,
    };
  }, [entries.data, journals.data]);

  return {
    journals,
    entries,
    tableRows,
    contributionData,
    stats,
  };
}
