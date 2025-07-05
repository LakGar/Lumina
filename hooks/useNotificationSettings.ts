"use client";

import { useState, useEffect } from "react";

export interface NotificationSettings {
  id: string;
  userId: string;
  dailyReminders: boolean;
  weeklyInsights: boolean;
  moodTrends: boolean;
  newFeatures: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminderTime: string;
  weeklyInsightDay: string;
  weeklyInsightTime: string;
  moodTrendFrequency: string;
  moodTrendDay: string | null;
  moodTrendTime: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsRequest {
  // Basic notification toggles
  dailyReminders?: boolean;
  weeklyInsights?: boolean;
  moodTrends?: boolean;
  newFeatures?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;

  // Custom frequency settings
  dailyReminderTime?: string; // HH:MM format
  weeklyInsightDay?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  weeklyInsightTime?: string; // HH:MM format
  moodTrendFrequency?: "daily" | "weekly" | "monthly";
  moodTrendDay?: string; // day of week for weekly, day of month for monthly
  moodTrendTime?: string; // HH:MM format

  // Advanced settings
  quietHoursEnabled?: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  timezone?: string;
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch notification settings from API
  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.error || "Failed to load notification settings");
      }
    } catch (err) {
      setError("Failed to load notification settings");
      console.error("Error fetching notification settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (
    updates: UpdateNotificationSettingsRequest
  ) => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch("/api/notifications", {
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
        setError(data.error || "Failed to update notification settings");
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMessage = "Failed to update notification settings";
      setError(errorMessage);
      console.error("Error updating notification settings:", err);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  // Toggle a specific notification setting
  const toggleNotification = async (
    setting: keyof Pick<
      NotificationSettings,
      | "dailyReminders"
      | "weeklyInsights"
      | "moodTrends"
      | "newFeatures"
      | "emailNotifications"
      | "pushNotifications"
      | "quietHoursEnabled"
    >
  ) => {
    if (!settings) return { success: false, error: "No settings loaded" };

    const newValue = !settings[setting];
    return await updateNotificationSettings({ [setting]: newValue });
  };

  // Update frequency settings
  const updateFrequency = async (type: string, value: string) => {
    const updates: UpdateNotificationSettingsRequest = {};

    switch (type) {
      case "dailyReminderTime":
        updates.dailyReminderTime = value;
        break;
      case "weeklyInsightDay":
        updates.weeklyInsightDay = value as any;
        break;
      case "weeklyInsightTime":
        updates.weeklyInsightTime = value;
        break;
      case "moodTrendFrequency":
        updates.moodTrendFrequency = value as any;
        break;
      case "moodTrendDay":
        updates.moodTrendDay = value;
        break;
      case "moodTrendTime":
        updates.moodTrendTime = value;
        break;
      case "quietHoursStart":
        updates.quietHoursStart = value;
        break;
      case "quietHoursEnd":
        updates.quietHoursEnd = value;
        break;
      case "timezone":
        updates.timezone = value;
        break;
    }

    return await updateNotificationSettings(updates);
  };

  // Load settings on mount
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updating,
    fetchNotificationSettings,
    updateNotificationSettings,
    toggleNotification,
    updateFrequency,
  };
}
