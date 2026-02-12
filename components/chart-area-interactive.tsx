"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartConfig = {
  entries: {
    label: "Entries",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function buildChartDataFromEntries(
  entries: Array<{ createdAt: string }>,
): Array<{ date: string; entries: number }> {
  const byDate = new Map<string, number>();
  for (const e of entries) {
    const d = format(new Date(e.createdAt), "yyyy-MM-dd");
    byDate.set(d, (byDate.get(d) ?? 0) + 1);
  }
  const today = format(new Date(), "yyyy-MM-dd");
  const out: Array<{ date: string; entries: number }> = [];
  for (let i = 89; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    out.push({ date, entries: byDate.get(date) ?? 0 });
  }
  return out;
}

export function ChartAreaInteractive({
  entries = [],
}: {
  entries?: Array<{ createdAt: string }>;
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const chartData = React.useMemo(
    () => buildChartDataFromEntries(entries),
    [entries],
  );

  const daysToSubtract = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const filteredData = chartData.slice(-daysToSubtract);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Entries over time</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Journal entries for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-entries)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-entries)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="entries"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-entries)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
