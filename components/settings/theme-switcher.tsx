"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = async (newTheme: Theme) => {
    setIsUpdating(true);

    try {
      // Update localStorage
      localStorage.setItem("theme", newTheme);
      setTheme(newTheme);

      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove("light", "dark");

      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(newTheme);
      }

      // Simulate API call to save preference
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Theme update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const themes = [
    {
      value: "light" as const,
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
      badge: "Default",
    },
    {
      value: "dark" as const,
      label: "Dark",
      description: "Easy on the eyes in low light",
      icon: Moon,
      badge: "Popular",
    },
    {
      value: "system" as const,
      label: "System",
      description: "Follows your device settings",
      icon: Monitor,
      badge: "Auto",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme
        </CardTitle>
        <CardDescription>
          Choose your preferred theme for Lumina
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;

            return (
              <div
                key={themeOption.value}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleThemeChange(themeOption.value)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-md ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{themeOption.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {themeOption.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {themeOption.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                  {isUpdating && theme === themeOption.value && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Your theme preference is saved locally and will persist across
            sessions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
