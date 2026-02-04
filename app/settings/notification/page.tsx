"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function NotificationPage() {
  const queryClient = useQueryClient();
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState("");
  const [timezone, setTimezone] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notification"],
    queryFn: () => apiClient.me.notification.get(),
  });

  const notif = data?.data as { dailyReminderEnabled?: boolean; dailyReminderTime?: string | null; timezone?: string | null } | undefined;
  useEffect(() => {
    if (notif) {
      setDailyReminderEnabled(notif.dailyReminderEnabled ?? false);
      setDailyReminderTime(notif.dailyReminderTime ?? "");
      setTimezone(notif.timezone ?? "");
    }
  }, [notif]);

  const updateMutation = useMutation({
    mutationFn: (updates: { dailyReminderEnabled?: boolean; dailyReminderTime?: string | null; timezone?: string | null }) =>
      apiClient.me.notification.update(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
      toast.success("Notification settings saved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });

  const handleSave = () => {
    updateMutation.mutate({
      dailyReminderEnabled,
      dailyReminderTime: dailyReminderTime.trim() || null,
      timezone: timezone.trim() || null,
    });
  };

  if (isError) {
    return <p className="text-destructive">{error?.message ?? "Failed to load notification settings."}</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Notification</h1>
        <p className="text-muted-foreground text-sm">Daily reminder and timezone.</p>
      </div>
        {isLoading ? (
          <Skeleton className="h-48 w-full max-w-md" />
        ) : (
          <div className="grid gap-6 max-w-md">
            <div className="flex items-center gap-2">
              <Checkbox
                id="daily-reminder"
                checked={dailyReminderEnabled}
                onCheckedChange={(v) => setDailyReminderEnabled(!!v)}
              />
              <Label htmlFor="daily-reminder">Daily reminder</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reminder-time">Reminder time (HH:mm)</Label>
              <Input
                id="reminder-time"
                value={dailyReminderTime}
                onChange={(e) => setDailyReminderTime(e.target.value)}
                placeholder="20:30 (HH:mm)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/Los_Angeles"
              />
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        )}
    </div>
  );
}
