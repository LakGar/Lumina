"use client";

import { useState, useEffect } from "react";
import ProtectedLayout from "@/components/layout/protected-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Lightbulb,
  Calendar,
} from "lucide-react";

interface InsightsData {
  moodTrends: Array<{
    mood: string;
    count: number;
    date: string;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  entryFrequency: Array<{
    date: string;
    count: number;
  }>;
  totalEntries: number;
  averageMood: string | null;
  mostActiveDay: string | null;
  writingStreak: number;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/insights", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch insights");
      }

      const data = await response.json();
      if (data.success) {
        setInsights(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch insights");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const colors: { [key: string]: string } = {
      happy: "bg-green-100 text-green-800",
      sad: "bg-blue-100 text-blue-800",
      excited: "bg-yellow-100 text-yellow-800",
      anxious: "bg-orange-100 text-orange-800",
      calm: "bg-purple-100 text-purple-800",
      frustrated: "bg-red-100 text-red-800",
      grateful: "bg-emerald-100 text-emerald-800",
      angry: "bg-red-100 text-red-800",
      hopeful: "bg-cyan-100 text-cyan-800",
      neutral: "bg-gray-100 text-gray-800",
    };
    return colors[mood.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground">
              AI-powered analysis of your journal entries and patterns
            </p>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground">
              AI-powered analysis of your journal entries and patterns
            </p>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchInsights} className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground">
              AI-powered analysis of your journal entries and patterns
            </p>
          </div>
          <Button onClick={fetchInsights} variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Entries
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights?.totalEntries || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Journal entries created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Writing Streak
              </CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights?.writingStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Mood
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights?.averageMood ? (
                  <span
                    className={`px-2 py-1 rounded text-sm ${getMoodColor(
                      insights.averageMood
                    )}`}
                  >
                    {insights.averageMood}
                  </span>
                ) : (
                  "--"
                )}
              </div>
              <p className="text-xs text-muted-foreground">Most common mood</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Most Active Day
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {insights?.mostActiveDay || "--"}
              </div>
              <p className="text-xs text-muted-foreground">Day of the week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Tags</CardTitle>
              <CardDescription>
                Most frequently used tags in your entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights?.topTags && insights.topTags.length > 0 ? (
                <div className="space-y-3">
                  {insights.topTags.slice(0, 8).map((tag, index) => (
                    <div
                      key={tag.tag}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{tag.tag}</span>
                        <span className="text-xs text-muted-foreground">
                          ({tag.count} times)
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {tag.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">No tags yet</p>
                  <p className="text-xs">
                    Start journaling to see tag insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>
                Breakdown of your emotional patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights?.moodTrends && insights.moodTrends.length > 0 ? (
                <div className="space-y-3">
                  {insights.moodTrends
                    .reduce((acc, trend) => {
                      const existing = acc.find(
                        (item) => item.mood === trend.mood
                      );
                      if (existing) {
                        existing.count += trend.count;
                      } else {
                        acc.push({ ...trend });
                      }
                      return acc;
                    }, [] as typeof insights.moodTrends)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 6)
                    .map((trend) => (
                      <div
                        key={trend.mood}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${getMoodColor(
                              trend.mood
                            )}`}
                          >
                            {trend.mood}
                          </span>
                        </div>
                        <div className="text-sm font-medium">{trend.count}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">No mood data yet</p>
                  <p className="text-xs">
                    Write more entries to see mood insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your journaling activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insights?.entryFrequency && insights.entryFrequency.length > 0 ? (
              <div className="space-y-2">
                {insights.entryFrequency.slice(-7).map((entry) => (
                  <div
                    key={entry.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">
                      {entry.count} {entry.count === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">
                  Start journaling to see your activity patterns
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
