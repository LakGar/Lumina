// Use any types for Prisma models since they're not being exported correctly
type User = any;
type Profile = any;
type JournalEntry = any;
type Settings = any;
type Subscription = any;

// Extended types with relations
export type UserWithProfile = User & {
  profile: Profile | null;
  settings: Settings | null;
  subscription: Subscription | null;
};

export type JournalEntryWithUser = JournalEntry & {
  user: User;
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

// Journal Entry types
export interface CreateJournalEntryRequest {
  content: string;
  voiceUrl?: string;
}

export interface UpdateJournalEntryRequest {
  content?: string;
  voiceUrl?: string;
}

// Search types
export interface SearchRequest {
  query: string;
  filters?: {
    mood?: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
  };
  page?: number;
  limit?: number;
}

export interface SearchResult {
  entries: JournalEntry[];
  total: number;
  page: number;
  totalPages: number;
}

// Settings types
export interface UpdateSettingsRequest {
  aiMemoryEnabled?: boolean;
  moodAnalysisEnabled?: boolean;
  summaryGenerationEnabled?: boolean;
}

// Subscription types
export interface CreateSubscriptionRequest {
  plan: "pro" | "premium";
  stripeToken?: string;
}

// AI Chat types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  relevantEntries?: JournalEntry[];
}

// Voice Upload types
export interface SignedUrlRequest {
  fileName: string;
  contentType: string;
}

export interface SignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresAt: Date;
}

// Export types
export interface ExportRequest {
  format: "json" | "pdf" | "markdown";
  dateRange?: {
    start: string;
    end: string;
  };
}

// Membership tiers
export type MembershipTier = "free" | "pro" | "premium";

// Feature limits
export interface FeatureLimits {
  voiceEntriesPerMonth: number;
  aiChatMessagesPerDay: number;
  exportFormats: string[];
  searchType: "text" | "semantic";
}

export const FEATURE_LIMITS: Record<MembershipTier, FeatureLimits> = {
  free: {
    voiceEntriesPerMonth: 5,
    aiChatMessagesPerDay: 10,
    exportFormats: [],
    searchType: "text",
  },
  pro: {
    voiceEntriesPerMonth: -1, // unlimited
    aiChatMessagesPerDay: 100,
    exportFormats: ["json", "pdf", "markdown"],
    searchType: "semantic",
  },
  premium: {
    voiceEntriesPerMonth: -1, // unlimited
    aiChatMessagesPerDay: -1, // unlimited
    exportFormats: ["json", "pdf", "markdown"],
    searchType: "semantic",
  },
};
