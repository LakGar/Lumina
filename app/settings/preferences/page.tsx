"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const THEMES = ["SYSTEM", "LIGHT", "DARK"] as const;

export default function PreferencesPage() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<string>("SYSTEM");
  const [goal, setGoal] = useState("");
  const [topics, setTopics] = useState("");
  const [reason, setReason] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => apiClient.me.preferences.get(),
  });

  const prefs = data?.data as { theme?: string; goal?: string | null; topics?: string | null; reason?: string | null } | undefined;
  useEffect(() => {
    if (prefs) {
      setTheme(prefs.theme ?? "SYSTEM");
      setGoal(prefs.goal ?? "");
      setTopics(prefs.topics ?? "");
      setReason(prefs.reason ?? "");
    }
  }, [prefs]);

  const updateMutation = useMutation({
    mutationFn: (updates: { theme?: string; goal?: string | null; topics?: string | null; reason?: string | null }) =>
      apiClient.me.preferences.update(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      toast.success("Preferences saved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });

  const handleSave = () => {
    updateMutation.mutate({
      theme: THEMES.includes(theme as (typeof THEMES)[number]) ? theme : undefined,
      goal: goal.trim() || null,
      topics: topics.trim() || null,
      reason: reason.trim() || null,
    });
  };

  if (isError) {
    return <p className="text-destructive">{error?.message ?? "Failed to load preferences."}</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Preferences</h1>
        <p className="text-muted-foreground text-sm">Theme, goals, and topics.</p>
      </div>
        {isLoading ? (
          <Skeleton className="h-64 w-full max-w-md" />
        ) : (
          <div className="grid gap-6 max-w-md">
            <div className="grid gap-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal">Goal</Label>
              <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. reflect daily" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topics">Topics</Label>
              <Input id="topics" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="e.g. work, health" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why you journal" />
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        )}
    </div>
  );
}
