"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { LuminaLevelCard } from "@/components/lumina-level-card";
import { WeeklyTipCard } from "@/components/weekly-tip-card";
import { AddMoodModal } from "@/components/add-mood-modal";
import { SiteHeader } from "@/components/site-header";
import {
  GitHubCalendar,
  type ContributionDay,
} from "@/components/ui/git-hub-calendar";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDashboardData } from "@/lib/hooks/use-dashboard";
import { useUIStore } from "@/lib/store/ui";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function DashboardContent() {
  const queryClient = useQueryClient();
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const { tableRows, contributionData, stats, journals, entries } =
    useDashboardData();
  const { data: backendStats, isLoading: statsLoading } = useQuery({
    queryKey: ["me", "stats"],
    queryFn: () => apiClient.me.stats(),
  });

  const moodMutation = useMutation({
    mutationFn: ({ title, note }: { title: string; note: string }) =>
      apiClient.moods.create(title, note || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moods"] });
      toast.success("Mood logged");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to log mood"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.entries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Entry deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete"),
  });

  const isLoading = journals.isLoading || entries.isLoading;
  const isError = journals.isError || entries.isError;

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <p className="text-destructive">
            {journals.error?.message ??
              entries.error?.message ??
              "Failed to load dashboard."}
          </p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <AddMoodModal
        open={moodModalOpen}
        onOpenChange={setMoodModalOpen}
        onSubmit={(title, note) => moodMutation.mutate({ title, note })}
        isPending={moodMutation.isPending}
      />
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
              <LuminaLevelCard
                stats={backendStats?.data}
                isLoading={statsLoading}
              />
              <WeeklyTipCard />
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <SectionCards
                stats={stats}
                onAddMood={() => setMoodModalOpen(true)}
              />
            )}
            <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6 min-h-0">
              <div className="flex flex-1 flex-col min-h-[280px] min-w-0">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Activity
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Journal entries over the last year
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 min-h-0 w-full justify-center">
                  {isLoading ? (
                    <Skeleton className="h-full min-h-[220px] w-full max-w-[920px]" />
                  ) : (
                    <GitHubCalendar
                      data={contributionData as ContributionDay[]}
                      useTheme
                      className="h-full min-h-[220px] w-full max-w-[920px]"
                    />
                  )}
                </div>
              </div>
              <div>
                <ChartAreaInteractive entries={entries.data?.data ?? []} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground px-4 lg:px-6">
                Recent entries
              </h2>
              {isLoading ? (
                <div className="px-4 lg:px-6">
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
              ) : tableRows.length === 0 ? (
                <div className="px-4 lg:px-6">
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                    <p className="text-muted-foreground text-sm">
                      No entries yet.
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Create a journal and add your first entry.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() =>
                        useUIStore.getState().setNewEntryOpen(true)
                      }
                    >
                      New entry
                    </Button>
                  </div>
                </div>
              ) : (
                <DataTable
                  data={tableRows}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onNewEntryClick={() =>
                    useUIStore.getState().setNewEntryOpen(true)
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
