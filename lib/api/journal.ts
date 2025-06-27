import { getSession } from "next-auth/react";

export interface JournalEntry {
  id: string;
  content: string;
  voiceUrl?: string;
  mood?: string;
  tags: string[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntry {
  content: string;
  voiceUrl?: string;
}

export interface UpdateJournalEntry {
  content?: string;
  voiceUrl?: string;
}

export interface JournalFilters {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "mood";
  sortOrder?: "asc" | "desc";
  mood?: string;
  tags?: string[];
  search?: string;
}

class JournalAPI {
  private async getAuthHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  async getEntries(filters: JournalFilters = {}): Promise<{
    entries: JournalEntry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.mood) params.append("mood", filters.mood);
    if (filters.tags) filters.tags.forEach((tag) => params.append("tags", tag));
    if (filters.search) params.append("search", filters.search);

    const response = await fetch(`/api/journal?${params.toString()}`, {
      headers: await this.getAuthHeaders(),
      credentials: "include", // This ensures cookies are sent
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch journal entries: ${response.statusText}`
      );
    }

    return response.json();
  }

  async getEntry(id: string): Promise<JournalEntry> {
    const response = await fetch(`/api/journal/${id}`, {
      headers: await this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch journal entry: ${response.statusText}`);
    }

    return response.json();
  }

  async createEntry(data: CreateJournalEntry): Promise<JournalEntry> {
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: await this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create journal entry: ${response.statusText}`);
    }

    return response.json();
  }

  async updateEntry(
    id: string,
    data: UpdateJournalEntry
  ): Promise<JournalEntry> {
    const response = await fetch(`/api/journal/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update journal entry: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteEntry(id: string): Promise<void> {
    const response = await fetch(`/api/journal/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete journal entry: ${response.statusText}`);
    }
  }

  async getVoiceUploadUrl(): Promise<{ uploadUrl: string; fileKey: string }> {
    const response = await fetch("/api/voice/upload-url", {
      headers: await this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }

    return response.json();
  }
}

export const journalAPI = new JournalAPI();
