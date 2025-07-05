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
import { Settings, Brain, Heart, FileText } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";

export function AIFeaturesSettings() {
  const { settings, loading, error, updating, toggleSetting } = useSettings();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleToggle = async (
    setting:
      | "aiMemoryEnabled"
      | "moodAnalysisEnabled"
      | "summaryGenerationEnabled"
  ) => {
    if (!settings) return;

    const result = await toggleSetting(setting);
    if (result.success) {
      setLastUpdated(`${setting} updated successfully`);
      setTimeout(() => setLastUpdated(null), 3000);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Features
          </CardTitle>
          <CardDescription>
            Configure AI-powered features and preferences
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
            <Settings className="h-5 w-5" />
            AI Features
          </CardTitle>
          <CardDescription>
            Configure AI-powered features and preferences
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

  const features = [
    {
      key: "aiMemoryEnabled" as const,
      title: "AI Memory",
      description:
        "Enable AI to remember and learn from your journal entries for better context in chat and search",
      icon: Brain,
      badge: "Core Feature",
      badgeVariant: "default" as const,
    },
    {
      key: "moodAnalysisEnabled" as const,
      title: "Mood Analysis",
      description:
        "Automatically analyze the emotional tone of your entries and track mood patterns over time",
      icon: Heart,
      badge: "Pro Feature",
      badgeVariant: "secondary" as const,
    },
    {
      key: "summaryGenerationEnabled" as const,
      title: "Auto Summaries",
      description:
        "Generate concise summaries of your journal entries to help you reflect on key themes",
      icon: FileText,
      badge: "Pro Feature",
      badgeVariant: "secondary" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Features
        </CardTitle>
        <CardDescription>
          Configure AI-powered features and preferences. These settings control
          how AI processes your journal entries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isEnabled = settings?.[feature.key] ?? false;

          return (
            <div
              key={feature.key}
              className="flex items-start justify-between space-x-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{feature.title}</h3>
                  <Badge variant={feature.badgeVariant} className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
                {updating && lastUpdated?.includes(feature.key) && (
                  <p className="text-xs text-green-600">Updated successfully</p>
                )}
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={() => handleToggle(feature.key)}
                disabled={updating}
                className="mt-1"
              />
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Changes to these settings will apply to new journal entries.
            Existing entries will retain their current processing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
