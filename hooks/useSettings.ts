"use client";

import { useState, useEffect } from "react";

export interface UserSettings {
  id: string;
  userId: string;
  aiMemoryEnabled: boolean;
  moodAnalysisEnabled: boolean;
  summaryGenerationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  aiMemoryEnabled?: boolean;
  moodAnalysisEnabled?: boolean;
  summaryGenerationEnabled?: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.error || "Failed to load settings");
      }
    } catch (err) {
      setError("Failed to load settings");
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (updates: UpdateSettingsRequest) => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        return { success: true, message: data.message };
      } else {
        setError(data.error || "Failed to update settings");
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMessage = "Failed to update settings";
      setError(errorMessage);
      console.error("Error updating settings:", err);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  // Toggle a specific setting
  const toggleSetting = async (setting: keyof UpdateSettingsRequest) => {
    if (!settings) return { success: false, error: "No settings loaded" };

    const newValue = !settings[setting as keyof UserSettings];
    return await updateSettings({ [setting]: newValue });
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updating,
    fetchSettings,
    updateSettings,
    toggleSetting,
  };
}
