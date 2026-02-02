import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import {
  GitHubCalendar,
  type ContributionDay,
} from "@/components/ui/git-hub-calendar";
import { SidebarInset } from "@/components/ui/sidebar";

import data from "./data.json";

const contributionData: ContributionDay[] = [];

export default function Page() {
  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
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
                  <GitHubCalendar
                    data={contributionData}
                    useTheme
                    className="h-full min-h-[220px] w-full max-w-[920px]"
                  />
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
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
