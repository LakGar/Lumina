"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Sparkles, TrendingUp } from "lucide-react";

interface NotificationSettings {
  dailyReminders: boolean;
  weeklyInsights: boolean;
  moodTrends: boolean;
  newFeatures: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminders: true,
    weeklyInsights: true,
    moodTrends: false,
    newFeatures: true,
    emailNotifications: true,
    pushNotifications: false,
  });
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (key: keyof NotificationSettings) => {
    setUpdating(key);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    } catch (error) {
      console.error("Notification setting update error:", error);
    } finally {
      setUpdating(null);
    }
  };

  const notificationTypes = [
    {
      key: "dailyReminders" as const,
      title: "Daily Reminders",
      description: "Get reminded to write in your journal each day",
      icon: Clock,
      badge: "Recommended",
      badgeVariant: "default" as const,
    },
    {
      key: "weeklyInsights" as const,
      title: "Weekly Insights",
      description: "Receive weekly summaries of your journal patterns",
      icon: Sparkles,
      badge: "Pro Feature",
      badgeVariant: "secondary" as const,
    },
    {
      key: "moodTrends" as const,
      title: "Mood Trends",
      description: "Get notified about significant mood pattern changes",
      icon: TrendingUp,
      badge: "Pro Feature",
      badgeVariant: "secondary" as const,
    },
    {
      key: "newFeatures" as const,
      title: "New Features",
      description: "Stay updated with new Lumina features and improvements",
      icon: Bell,
      badge: "Optional",
      badgeVariant: "outline" as const,
    },
  ];

  const deliveryMethods = [
    {
      key: "emailNotifications" as const,
      title: "Email Notifications",
      description: "Receive notifications via email",
      icon: Bell,
    },
    {
      key: "pushNotifications" as const,
      title: "Push Notifications",
      description: "Receive notifications in your browser",
      icon: Bell,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Manage your notification preferences and delivery methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Notification Types</h3>
          {notificationTypes.map((notification) => {
            const Icon = notification.icon;
            const isEnabled = settings[notification.key];

            return (
              <div
                key={notification.key}
                className="flex items-start justify-between space-x-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{notification.title}</h4>
                    <Badge
                      variant={notification.badgeVariant}
                      className="text-xs"
                    >
                      {notification.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(notification.key)}
                  disabled={updating === notification.key}
                  className="mt-1"
                />
              </div>
            );
          })}
        </div>

        {/* Delivery Methods */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm">Delivery Methods</h3>
          {deliveryMethods.map((method) => {
            const Icon = method.icon;
            const isEnabled = settings[method.key];

            return (
              <div
                key={method.key}
                className="flex items-start justify-between space-x-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{method.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(method.key)}
                  disabled={updating === method.key}
                  className="mt-1"
                />
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            You can change these settings at any time. Some notifications may
            require Pro membership.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
