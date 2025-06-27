"use client";

import { useState, useEffect, useCallback } from "react";
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, [filters, status]);

  const createEntry = useCallback(
    async (data: CreateJournalEntry) => {
      if (status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        await journalAPI.createEntry(data);
        await fetchEntries(); // Refresh the list
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
        await journalAPI.updateEntry(id, data);
        await fetchEntries(); // Refresh the list
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
  };
}
