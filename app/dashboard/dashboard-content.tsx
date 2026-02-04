"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import {
  GitHubCalendar,
  type ContributionDay,
} from "@/components/ui/git-hub-calendar";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDashboardData } from "@/lib/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContent() {
  const {
    tableRows,
    contributionData,
    stats,
    journals,
    entries,
  } = useDashboardData();

  const isLoading = journals.isLoading || entries.isLoading;
  const isError = journals.isError || entries.isError;

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <p className="text-destructive">
            {journals.error?.message ?? entries.error?.message ?? "Failed to load dashboard."}
          </p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <SectionCards stats={stats} />
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
                <ChartAreaInteractive />
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
              ) : (
                <DataTable data={tableRows} />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
