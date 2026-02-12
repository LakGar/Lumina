"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfYear,
  endOfYear,
  isBefore,
  isAfter,
} from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ContributionDay {
  date: string; // ISO date string (e.g., "2025-09-13")
  count: number;
}

interface GitHubCalendarProps {
  data: ContributionDay[];
  useTheme?: boolean;
  colors?: string[];
  className?: string;
  yearOptions?: number[];
}

const THEME_LEVEL_CLASSES = [
  "bg-muted", // 0
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
] as const;

type ViewMode = "trailing" | number;

const GitHubCalendar = ({
  data,
  useTheme = true,
  colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  className,
  yearOptions: yearOptionsProp,
}: GitHubCalendarProps) => {
  const [contributions, setContributions] = useState<
    (Omit<ContributionDay, "date"> & { date: Date })[]
  >([]);
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();

  const yearOptions = useMemo(() => {
    if (yearOptionsProp?.length) return yearOptionsProp;
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);
    return years;
  }, [currentYear, yearOptionsProp]);

  const [viewValue, setViewValue] = useState<string>("trailing");
  const viewMode: ViewMode =
    viewValue === "trailing" ? "trailing" : parseInt(viewValue, 10);

  useEffect(() => {
    setTimeout(() => {
      setContributions(
        data.map((item) => ({ ...item, date: new Date(item.date) })),
      );
    }, 0);
  }, [data]);

  const WEEKS_IN_GRID = 53;

  const { weekStarts, monthLabelsForWeeks } = useMemo(() => {
    function labelForWeek(weekStart: Date): string {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const firstOfThisMonth = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        1,
      );
      if (
        !isBefore(firstOfThisMonth, weekStart) &&
        !isAfter(firstOfThisMonth, weekEnd)
      ) {
        return format(firstOfThisMonth, "MMM");
      }
      const firstOfNextMonth = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth() + 1,
        1,
      );
      if (
        !isBefore(firstOfNextMonth, weekStart) &&
        !isAfter(firstOfNextMonth, weekEnd)
      ) {
        return format(firstOfNextMonth, "MMM");
      }
      return "";
    }

    if (viewMode === "trailing") {
      // GitHub default: 53 weeks ending with the CURRENT week (today at the end)
      const lastWeekStart = startOfWeek(today, { weekStartsOn: 0 });
      const firstWeekStart = addDays(lastWeekStart, -(WEEKS_IN_GRID - 1) * 7);
      const weekStarts: Date[] = [];
      for (let i = 0; i < WEEKS_IN_GRID; i++) {
        weekStarts.push(addDays(firstWeekStart, i * 7));
      }
      const monthLabelsForWeeks = weekStarts.map((ws) => labelForWeek(ws));
      return { weekStarts, monthLabelsForWeeks };
    }

    const year = viewMode as number;
    const yearStart = startOfYear(new Date(year, 0, 1));
    // Full year in chronological order: 53 weeks starting from the week that contains Jan 1
    const firstWeekStart = startOfWeek(yearStart, { weekStartsOn: 0 });
    const weekStarts: Date[] = [];
    for (let i = 0; i < WEEKS_IN_GRID; i++) {
      weekStarts.push(addDays(firstWeekStart, i * 7));
    }
    const monthLabelsForWeeks = weekStarts.map((ws) => labelForWeek(ws));
    return { weekStarts, monthLabelsForWeeks };
  }, [viewMode, today, currentYear]);

  const displayContributions = useMemo(
    () => contributions.map((c) => ({ ...c, count: c.count })),
    [contributions],
  );

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  };

  const getColor = (count: number) => {
    if (count === 0) return colors[0];
    if (count === 1) return colors[1];
    if (count === 2) return colors[2];
    if (count === 3) return colors[3];
    return colors[4] ?? colors[colors.length - 1];
  };

  const renderWeeks = () => {
    return weekStarts.map((weekStart, i) => {
      const weekDays = eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 0 }),
      });

      return (
        <div
          key={i}
          className="flex flex-col gap-0.5 flex-1 min-w-[10px] shrink-0"
        >
          {weekDays.map((day, index) => {
            const contribution = displayContributions.find((c) =>
              isSameDay(c.date, day),
            );
            const count = contribution?.count ?? 0;
            const level = getLevel(count);

            return (
              <div
                key={index}
                className={cn(
                  "aspect-square w-full min-w-[8px] min-h-[8px] max-w-[16px] rounded-[2px] transition-all duration-150 hover:ring-2 hover:ring-primary/30 hover:ring-offset-0 hover:scale-105 shrink-0",
                  useTheme ? THEME_LEVEL_CLASSES[level] : "",
                )}
                style={
                  useTheme ? undefined : { backgroundColor: getColor(count) }
                }
                title={`${format(day, "PPP")}: ${count} ${count === 1 ? "entry" : "entries"}`}
              />
            );
          })}
        </div>
      );
    });
  };

  const renderMonthLabels = () => {
    return weekStarts.map((_, i) => {
      const label = monthLabelsForWeeks[i] ?? "";
      return (
        <div
          key={i}
          className="flex flex-1 min-w-[10px] shrink-0 items-center justify-start overflow-visible text-xs text-muted-foreground tabular-nums font-medium"
        >
          {label ? (
            <span className="whitespace-nowrap text-foreground/90 text-xs">
              {label}
            </span>
          ) : null}
        </div>
      );
    });
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const yearLabel =
    viewMode === "trailing" ? String(currentYear) : String(viewMode);

  return (
    <div
      className={cn(
        "flex h-full w-full min-h-0 flex-col rounded-lg p-4 shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="shrink-0 mb-2">
        <Select value={viewValue} onValueChange={setViewValue}>
          <SelectTrigger className="w-[160px] h-8 border-border bg-background/50 text-xs font-medium">
            <SelectValue placeholder="Last 52 weeks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trailing">Last 52 weeks</SelectItem>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year === currentYear ? `${year} (this year)` : String(year)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 min-h-0 min-w-0 gap-2">
        <div className="flex flex-1 min-w-0 overflow-auto justify-center">
          <div className="flex min-h-0 min-w-[560px] shrink-0">
            <div className="flex flex-col justify-between pt-5 pb-0.5 pr-1.5 shrink-0">
              {dayLabels.map((day, index) => (
                <span
                  key={index}
                  className="text-xs text-muted-foreground leading-none font-medium"
                >
                  {index % 2 === 0 ? day : "\u00A0"}
                </span>
              ))}
            </div>
            <div className="flex flex-1 flex-col min-w-0 shrink-0">
              <div className="flex w-full gap-0.5 mb-1.5 min-h-5 shrink-0 min-w-0 items-center text-xs">
                {renderMonthLabels()}
              </div>
              <div className="flex flex-1 gap-0.5 min-h-0 w-full min-w-0 shrink-0 [&>div]:shrink-0">
                {renderWeeks()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center text-sm font-semibold text-muted-foreground tabular-nums">
          {yearLabel}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2.5 mt-1.5 border-t border-border/60 shrink-0 text-xs text-muted-foreground text-center">
        <span>Less</span>
        {useTheme
          ? THEME_LEVEL_CLASSES.map((levelClass, index) => (
              <div
                key={index}
                className={cn("w-3 h-3 rounded-[2px] shrink-0", levelClass)}
              />
            ))
          : colors.map((color, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-[2px] shrink-0"
                style={{ backgroundColor: color }}
              />
            ))}
        <span>More</span>
      </div>
    </div>
  );
};

export { GitHubCalendar };
