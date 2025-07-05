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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Clock,
  Sparkles,
  TrendingUp,
  Settings,
  Moon,
  Globe,
} from "lucide-react";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

export function EnhancedNotificationSettings() {
  const {
    settings,
    loading,
    error,
    updating,
    toggleNotification,
    updateFrequency,
  } = useNotificationSettings();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleToggle = async (setting: keyof typeof settings) => {
    if (!settings) return;

    const result = await toggleNotification(setting);
    if (result.success) {
      // Show success feedback
      console.log("Setting updated successfully");
    }
  };

  const handleFrequencyChange = async (type: string, value: string) => {
    const result = await updateFrequency(type, value);
    if (result.success) {
      console.log("Frequency updated successfully");
    }
  };

  if (loading) {
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
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const notificationTypes = [
    {
      key: "dailyReminders" as const,
      title: "Daily Reminders",
      description: "Get reminded to write in your journal each day",
      icon: Clock,
      badge: "Recommended",
      badgeVariant: "default" as const,
      hasFrequency: true,
      frequencyType: "time",
      frequencyLabel: "Reminder Time",
      frequencyValue: settings?.dailyReminderTime || "09:00",
    },
    {
      key: "weeklyInsights" as const,
      title: "Weekly Insights",
      description: "Receive weekly summaries of your journal patterns",
      icon: Sparkles,
      badge: "Pro Feature",
      badgeVariant: "secondary" as const,
      hasFrequency: true,
      frequencyType: "day-time",
      frequencyLabel: "Insight Day & Time",
      frequencyValue: `${settings?.weeklyInsightDay || "monday"} at ${
        settings?.weeklyInsightTime || "10:00"
      }`,
    },
    {
      key: "moodTrends" as const,
      title: "Mood Trends",
      description: "Get notified about significant mood pattern changes",
      icon: TrendingUp,
      badge: "Pro Feature",
      badgeVariant: "secondary" as const,
      hasFrequency: true,
      frequencyType: "frequency-day-time",
      frequencyLabel: "Trend Frequency",
      frequencyValue: `${settings?.moodTrendFrequency || "weekly"}${
        settings?.moodTrendDay ? ` on ${settings.moodTrendDay}` : ""
      } at ${settings?.moodTrendTime || "14:00"}`,
    },
    {
      key: "newFeatures" as const,
      title: "New Features",
      description: "Stay updated with new Lumina features and improvements",
      icon: Bell,
      badge: "Optional",
      badgeVariant: "outline" as const,
      hasFrequency: false,
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

  const advancedSettings = [
    {
      key: "quietHoursEnabled" as const,
      title: "Quiet Hours",
      description: "Pause notifications during specific hours",
      icon: Moon,
      hasFrequency: true,
      frequencyType: "time-range",
      frequencyLabel: "Quiet Hours",
      frequencyValue: `${settings?.quietHoursStart || "22:00"} - ${
        settings?.quietHoursEnd || "08:00"
      }`,
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
          Manage your notification preferences and delivery methods with custom
          frequencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Notification Types</h3>
          {notificationTypes.map((notification) => {
            const Icon = notification.icon;
            const isEnabled = settings?.[notification.key] ?? false;
            const isExpanded = expandedSections.has(notification.key);

            return (
              <div key={notification.key} className="border rounded-lg p-4">
                <div className="flex items-start justify-between space-x-4">
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
                    {notification.hasFrequency && (
                      <p className="text-xs text-muted-foreground">
                        {notification.frequencyLabel}:{" "}
                        {notification.frequencyValue}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(notification.key)}
                      disabled={updating}
                      className="mt-1"
                    />
                    {notification.hasFrequency && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(notification.key)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Frequency Settings */}
                {notification.hasFrequency && isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {notification.frequencyType === "time" && (
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium">Time:</label>
                        <Input
                          type="time"
                          value={settings?.dailyReminderTime || "09:00"}
                          onChange={(e) =>
                            handleFrequencyChange(
                              "dailyReminderTime",
                              e.target.value
                            )
                          }
                          className="w-32"
                        />
                      </div>
                    )}

                    {notification.frequencyType === "day-time" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Day:</label>
                          <select
                            value={settings?.weeklyInsightDay || "monday"}
                            onChange={(e) =>
                              handleFrequencyChange(
                                "weeklyInsightDay",
                                e.target.value
                              )
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                            <option value="sunday">Sunday</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Time:</label>
                          <Input
                            type="time"
                            value={settings?.weeklyInsightTime || "10:00"}
                            onChange={(e) =>
                              handleFrequencyChange(
                                "weeklyInsightTime",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                      </div>
                    )}

                    {notification.frequencyType === "frequency-day-time" && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">
                            Frequency:
                          </label>
                          <select
                            value={settings?.moodTrendFrequency || "weekly"}
                            onChange={(e) =>
                              handleFrequencyChange(
                                "moodTrendFrequency",
                                e.target.value
                              )
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Day:</label>
                          <Input
                            type="text"
                            placeholder="Day"
                            value={settings?.moodTrendDay || ""}
                            onChange={(e) =>
                              handleFrequencyChange(
                                "moodTrendDay",
                                e.target.value
                              )
                            }
                            className="w-24"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Time:</label>
                          <Input
                            type="time"
                            value={settings?.moodTrendTime || "14:00"}
                            onChange={(e) =>
                              handleFrequencyChange(
                                "moodTrendTime",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Delivery Methods */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm">Delivery Methods</h3>
          {deliveryMethods.map((method) => {
            const Icon = method.icon;
            const isEnabled = settings?.[method.key] ?? false;

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
                  disabled={updating}
                  className="mt-1"
                />
              </div>
            );
          })}
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm">Advanced Settings</h3>
          {advancedSettings.map((setting) => {
            const Icon = setting.icon;
            const isEnabled = settings?.[setting.key] ?? false;
            const isExpanded = expandedSections.has(setting.key);

            return (
              <div key={setting.key} className="border rounded-lg p-4">
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{setting.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                    {setting.hasFrequency && (
                      <p className="text-xs text-muted-foreground">
                        {setting.frequencyLabel}: {setting.frequencyValue}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(setting.key)}
                      disabled={updating}
                      className="mt-1"
                    />
                    {setting.hasFrequency && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(setting.key)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Advanced Settings Controls */}
                {setting.hasFrequency && isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {setting.frequencyType === "time-range" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Start:</label>
                          <Input
                            type="time"
                            value={settings?.quietHoursStart || "22:00"}
                            onChange={(e) =>
                              handleFrequencyChange(
                                "quietHoursStart",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">End:</label>
                          <Input
                            type="time"
                            value={settings?.quietHoursEnd || "08:00"}
                            onChange={(e) =>
                              handleFrequencyChange(
                                "quietHoursEnd",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timezone Setting */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Timezone</h3>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Your timezone:</label>
            <select
              value={settings?.timezone || "UTC"}
              onChange={(e) =>
                handleFrequencyChange("timezone", e.target.value)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>

        {/* Info Section */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Your notification preferences are saved automatically. Some
            notifications may require Pro membership.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
