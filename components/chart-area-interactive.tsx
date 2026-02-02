"use client";

import * as React from "react";
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

const chartData = [
  { date: "2024-04-01", entries: 2 },
  { date: "2024-04-02", entries: 1 },
  { date: "2024-04-03", entries: 3 },
  { date: "2024-04-04", entries: 2 },
  { date: "2024-04-05", entries: 1 },
  { date: "2024-04-06", entries: 4 },
  { date: "2024-04-07", entries: 2 },
  { date: "2024-04-08", entries: 3 },
  { date: "2024-04-09", entries: 1 },
  { date: "2024-04-10", entries: 2 },
  { date: "2024-04-11", entries: 3 },
  { date: "2024-04-12", entries: 2 },
  { date: "2024-04-13", entries: 1 },
  { date: "2024-04-14", entries: 2 },
  { date: "2024-04-15", entries: 4 },
  { date: "2024-04-16", entries: 1 },
  { date: "2024-04-17", entries: 3 },
  { date: "2024-04-18", entries: 2 },
  { date: "2024-04-19", entries: 1 },
  { date: "2024-04-20", entries: 2 },
  { date: "2024-04-21", entries: 3 },
  { date: "2024-04-22", entries: 2 },
  { date: "2024-04-23", entries: 1 },
  { date: "2024-04-24", entries: 2 },
  { date: "2024-04-25", entries: 4 },
  { date: "2024-04-26", entries: 1 },
  { date: "2024-04-27", entries: 2 },
  { date: "2024-04-28", entries: 3 },
  { date: "2024-04-29", entries: 1 },
  { date: "2024-04-30", entries: 2 },
  { date: "2024-05-01", entries: 3 },
  { date: "2024-05-02", entries: 2 },
  { date: "2024-05-03", entries: 1 },
  { date: "2024-05-04", entries: 2 },
  { date: "2024-05-05", entries: 3 },
  { date: "2024-05-06", entries: 2 },
  { date: "2024-05-07", entries: 1 },
  { date: "2024-05-08", entries: 4 },
  { date: "2024-05-09", entries: 2 },
  { date: "2024-05-10", entries: 1 },
  { date: "2024-05-11", entries: 3 },
  { date: "2024-05-12", entries: 2 },
  { date: "2024-05-13", entries: 1 },
  { date: "2024-05-14", entries: 2 },
  { date: "2024-05-15", entries: 3 },
  { date: "2024-05-16", entries: 2 },
  { date: "2024-05-17", entries: 1 },
  { date: "2024-05-18", entries: 2 },
  { date: "2024-05-19", entries: 4 },
  { date: "2024-05-20", entries: 1 },
  { date: "2024-05-21", entries: 2 },
  { date: "2024-05-22", entries: 3 },
  { date: "2024-05-23", entries: 2 },
  { date: "2024-05-24", entries: 1 },
  { date: "2024-05-25", entries: 2 },
  { date: "2024-05-26", entries: 3 },
  { date: "2024-05-27", entries: 2 },
  { date: "2024-05-28", entries: 1 },
  { date: "2024-05-29", entries: 2 },
  { date: "2024-05-30", entries: 4 },
  { date: "2024-05-31", entries: 1 },
  { date: "2024-06-01", entries: 2 },
  { date: "2024-06-02", entries: 3 },
  { date: "2024-06-03", entries: 2 },
  { date: "2024-06-04", entries: 1 },
  { date: "2024-06-05", entries: 2 },
  { date: "2024-06-06", entries: 3 },
  { date: "2024-06-07", entries: 2 },
  { date: "2024-06-08", entries: 1 },
  { date: "2024-06-09", entries: 2 },
  { date: "2024-06-10", entries: 4 },
  { date: "2024-06-11", entries: 1 },
  { date: "2024-06-12", entries: 2 },
  { date: "2024-06-13", entries: 3 },
  { date: "2024-06-14", entries: 2 },
  { date: "2024-06-15", entries: 1 },
  { date: "2024-06-16", entries: 2 },
  { date: "2024-06-17", entries: 3 },
  { date: "2024-06-18", entries: 2 },
  { date: "2024-06-19", entries: 1 },
  { date: "2024-06-20", entries: 2 },
  { date: "2024-06-21", entries: 4 },
  { date: "2024-06-22", entries: 1 },
  { date: "2024-06-23", entries: 2 },
  { date: "2024-06-24", entries: 3 },
  { date: "2024-06-25", entries: 2 },
  { date: "2024-06-26", entries: 1 },
  { date: "2024-06-27", entries: 2 },
  { date: "2024-06-28", entries: 3 },
  { date: "2024-06-29", entries: 2 },
  { date: "2024-06-30", entries: 1 },
];

const chartConfig = {
  entries: {
    label: "Entries",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

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
