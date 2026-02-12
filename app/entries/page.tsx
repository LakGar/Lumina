"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecentEntries, useJournals } from "@/lib/hooks/use-dashboard";
import { useUIStore } from "@/lib/store/ui";
import { IconBook2, IconPlus, IconFileText } from "@tabler/icons-react";

export default function EntriesPage() {
  const { data: journalsData } = useJournals();
  const {
    data: entriesData,
    isLoading,
    isError,
    error,
  } = useRecentEntries(200);
  const [journalFilter, setJournalFilter] = useState<string>("all");

  const journals = journalsData?.data ?? [];
  const entries = entriesData?.data ?? [];

  const filteredEntries = useMemo(() => {
    if (journalFilter === "all") return entries;
    const jId = Number(journalFilter);
    if (Number.isNaN(jId)) return entries;
    return entries.filter((e: { journalId: number }) => e.journalId === jId);
  }, [entries, journalFilter]);

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">
            {error?.message ?? "Failed to load entries."}
          </p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Entries</h1>
          <p className="text-muted-foreground text-sm">
            All your journal entries. Filter by journal or open to edit.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Journal
            </span>
            <Select value={journalFilter} onValueChange={setJournalFilter}>
              <SelectTrigger className="w-[200px] rounded-lg">
                <SelectValue placeholder="All journals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All journals</SelectItem>
                {journals.map((j: { id: number; title: string }) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="rounded-lg"
            onClick={() => useUIStore.getState().setNewEntryOpen(true)}
          >
            <IconPlus className="size-4" />
            New entry
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <IconFileText className="size-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No entries yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {journalFilter === "all"
                ? "Create a journal and add your first entry."
                : "No entries in this journal."}
            </p>
            <Button
              className="mt-6 rounded-lg"
              onClick={() => useUIStore.getState().setNewEntryOpen(true)}
            >
              <IconPlus className="size-4" />
              New entry
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredEntries.map(
              (e: {
                id: number;
                journalId: number;
                content: string;
                createdAt: string;
                journal?: { title: string };
                mood?: { label: string };
                tags?: Array<{ tag: string }>;
              }) => (
                <li key={e.id}>
                  <Link
                    href={`/entries/${e.id}`}
                    className="flex flex-col gap-1 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 flex-1 text-sm text-foreground">
                        {e.content.trim().slice(0, 120).replace(/\n/g, " ")}
                        {e.content.length > 120 ? "…" : ""}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        <IconBook2 className="size-3" />
                        {e.journal?.title ?? "Journal"}
                      </span>
                      {e.mood?.label && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                          {e.mood.label}
                        </span>
                      )}
                      {e.tags?.length ? (
                        <span className="flex flex-wrap gap-1">
                          {e.tags.slice(0, 3).map((t) => (
                            <span
                              key={t.tag}
                              className="rounded border border-border px-1.5 py-0.5 text-xs"
                            >
                              {t.tag}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </SidebarInset>
  );
}
