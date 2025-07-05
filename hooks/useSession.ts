"use client";

import { useState, useEffect } from "react";

export interface UserSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  profile: {
    id: string;
    userId: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    membershipTier: string;
    createdAt: string;
    updatedAt: string;
  };
  settings?: {
    id: string;
    userId: string;
    aiMemoryEnabled: boolean;
    moodAnalysisEnabled: boolean;
    summaryGenerationEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  };
  subscription?: {
    id: string;
    userId: string;
    plan: string;
    status: string;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (data.success) {
        setSession(data.data);
      } else {
        setError(data.error || "Failed to load session");
      }
    } catch (err) {
      setError("Failed to load session");
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return {
    session,
    loading,
    error,
    refetch: fetchSession,
  };
}
