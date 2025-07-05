"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  journalAPI,
  JournalEntry,
  CreateJournalEntry,
  UpdateJournalEntry,
  JournalFilters,
} from "@/lib/api/journal";

interface UseJournalReturn {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  createEntry: (data: CreateJournalEntry) => Promise<void>;
  updateEntry: (id: string, data: UpdateJournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
  setFilters: (filters: JournalFilters) => void;
  processingEntries: Set<string>; // Track entries being processed
  completedEntries: Set<string>; // Track entries that just completed processing
}

export function useJournal(
  initialFilters: JournalFilters = {}
): UseJournalReturn {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JournalFilters>(initialFilters);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [processingEntries, setProcessingEntries] = useState<Set<string>>(
    new Set()
  );
  const [completedEntries, setCompletedEntries] = useState<Set<string>>(
    new Set()
  );
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEntries = useCallback(async () => {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);

    try {
      const result = await journalAPI.getEntries({
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10,
      });

      setEntries(result.entries);
      setTotal(result.total);
      setPage(result.page);
      setTotalPages(result.totalPages);

      // Update processing entries based on entries without tags/summary
      const processing = new Set<string>();
      result.entries.forEach((entry) => {
        if (
          (!entry.tags || !entry.tags.length) &&
          !entry.summary &&
          entry.content
        ) {
          processing.add(entry.id);
        }
      });
      setProcessingEntries(processing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, [filters, status]);

  // Poll for updates on processing entries
  const pollForUpdates = useCallback(async () => {
    if (processingEntries.size === 0) return;

    try {
      const result = await journalAPI.getEntries({
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10,
      });

      // Check if any processing entries have been updated
      let hasUpdates = false;
      const updatedProcessing = new Set<string>();
      const newlyCompleted = new Set<string>();

      result.entries.forEach((entry) => {
        if (processingEntries.has(entry.id)) {
          // If entry now has tags or summary, it's no longer processing
          if ((entry.tags && entry.tags.length > 0) || entry.summary) {
            hasUpdates = true;
            newlyCompleted.add(entry.id);
          } else {
            updatedProcessing.add(entry.id);
          }
        }
      });

      if (hasUpdates) {
        // Update the entries list with new data
        setEntries(result.entries);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);

        // Track newly completed entries for animations
        setCompletedEntries(newlyCompleted);

        // Show notification for completed processing
        const completedEntries = result.entries.filter(
          (entry) =>
            processingEntries.has(entry.id) &&
            ((entry.tags && entry.tags.length > 0) || entry.summary)
        );

        if (completedEntries.length > 0) {
          console.log(
            `AI processing completed for ${completedEntries.length} entries`
          );
          // You could add a toast notification here if you have a notification system
        }
      }

      setProcessingEntries(updatedProcessing);
    } catch (err) {
      console.error("Failed to poll for updates:", err);
    }
  }, [processingEntries, filters]);

  // Start/stop polling based on processing entries
  useEffect(() => {
    if (processingEntries.size > 0) {
      // Start polling every 3 seconds for processing entries
      pollingIntervalRef.current = setInterval(pollForUpdates, 3000);
    } else {
      // Stop polling if no entries are processing
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [processingEntries, pollForUpdates]);

  // Clear completed entries after animation delay
  useEffect(() => {
    if (completedEntries.size > 0) {
      const timer = setTimeout(() => {
        setCompletedEntries(new Set());
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [completedEntries]);

  const createEntry = useCallback(
    async (data: CreateJournalEntry) => {
      if (status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        const newEntry = await journalAPI.createEntry(data);
        await fetchEntries(); // Refresh the list

        // Add the new entry to processing if it doesn't have tags/summary
        if ((!newEntry.tags || !newEntry.tags.length) && !newEntry.summary) {
          setProcessingEntries(
            (prev) => new Set([...Array.from(prev), newEntry.id])
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEntries, status]
  );

  const updateEntry = useCallback(
    async (id: string, data: UpdateJournalEntry) => {
      if (status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        const updatedEntry = await journalAPI.updateEntry(id, data);
        await fetchEntries(); // Refresh the list

        // Update processing status
        if (
          (!updatedEntry.tags || !updatedEntry.tags.length) &&
          !updatedEntry.summary
        ) {
          setProcessingEntries(
            (prev) => new Set([...Array.from(prev), updatedEntry.id])
          );
        } else {
          setProcessingEntries((prev) => {
            const newSet = new Set(prev);
            newSet.delete(updatedEntry.id);
            return newSet;
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEntries, status]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        await journalAPI.deleteEntry(id);
        await fetchEntries(); // Refresh the list

        // Remove from processing entries
        setProcessingEntries((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEntries, status]
  );

  const refreshEntries = useCallback(() => {
    return fetchEntries();
  }, [fetchEntries]);

  const updateFilters = useCallback((newFilters: JournalFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchEntries();
    }
  }, [fetchEntries, status]);

  return {
    entries,
    loading,
    error,
    total,
    page,
    totalPages,
    createEntry,
    updateEntry,
    deleteEntry,
    refreshEntries,
    setFilters: updateFilters,
    processingEntries,
    completedEntries,
  };
}
