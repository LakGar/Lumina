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

// Pixel pattern for "LUMINA" in default (trailing) view: [wordCol, row] where wordCol 0–33, row 0 (Sun)–6 (Sat)
const LUMINA_WORD_START_COL = 9;
const LUMINA_PATTERN: [number, number][] = [
  // L (cols 0–4): 9 blocks = vertical col 0 rows 1–6 (6) + bottom row 6 cols 1–3 (3)
  [-1, 1],
  [-1, 2],
  [-1, 3],
  [-1, 4],
  [-1, 5],
  [-1, 6],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],

  [5, 1],
  [5, 2],
  [5, 3],
  [5, 4],
  [5, 5],
  [5, 6],
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [6, 5],
  [6, 6],
  [7, 6],
  [8, 6],
  [9, 1],
  [9, 2],
  [9, 3],
  [9, 4],
  [9, 5],
  [9, 6],
  [10, 1],
  [10, 2],
  [10, 3],
  [10, 4],
  [10, 5],
  [10, 6],

  [12, 1],
  [12, 2],
  [12, 3],
  [12, 4],
  [12, 5],
  [12, 6],
  [13, 1],
  [13, 2],
  [13, 3],
  [13, 4],
  [13, 5],
  [13, 6],
  [14, 1],
  [16, 1],
  [15, 2],
  [17, 1],
  [17, 2],
  [17, 3],
  [17, 4],
  [17, 5],
  [17, 6],
  [18, 1],
  [18, 2],
  [18, 3],
  [18, 4],
  [18, 5],
  [18, 6],

  [20, 1],
  [20, 2],
  [20, 3],
  [20, 4],
  [20, 5],
  [20, 6],
  [21, 1],
  [21, 2],
  [21, 3],
  [21, 4],
  [21, 5],
  [21, 6],

  [23, 1],
  [23, 2],
  [23, 3],
  [23, 4],
  [23, 5],
  [23, 6],
  [24, 1],
  [24, 2],
  [24, 3],
  [24, 4],
  [24, 5],
  [24, 6],
  [25, 1],
  [25, 2],
  [25, 3],
  [26, 3],
  [26, 4],
  [27, 4],
  [27, 5],
  [27, 6],
  [28, 1],
  [28, 2],
  [28, 3],
  [28, 4],
  [28, 5],
  [28, 6],
  [29, 1],
  [29, 2],
  [29, 3],
  [29, 4],
  [29, 5],
  [29, 6],

  [31, 6],
  [31, 5],
  [31, 4],
  [31, 3],
  [31, 2],
  [31, 1],
  [32, 1],
  [32, 2],
  [32, 3],
  [32, 4],
  [32, 5],
  [32, 6],
  [35, 6],
  [35, 5],
  [35, 4],
  [35, 3],
  [35, 2],
  [35, 1],
  [36, 1],
  [36, 2],
  [36, 3],
  [32, 4],
  [36, 5],
  [36, 6],
  [33, 1],
  [34, 1],
  [33, 4],
  [34, 4],
];

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

  const { displayContributions, luminaPatternDates } = useMemo(() => {
    const base = contributions.map((c) => ({ ...c, count: c.count }));
    const patternDates = new Set<string>();
    if (viewMode !== "trailing" || weekStarts.length === 0)
      return { displayContributions: base, luminaPatternDates: patternDates };
    const byDate = new Map<string, number>();
    for (const c of base) byDate.set(format(c.date, "yyyy-MM-dd"), c.count);
    for (const [wordCol, row] of LUMINA_PATTERN) {
      const col = LUMINA_WORD_START_COL + wordCol;
      if (col >= weekStarts.length) continue;
      const date = addDays(weekStarts[col], row);
      const key = format(date, "yyyy-MM-dd");
      patternDates.add(key);
      byDate.set(key, 4); // full level so LUMINA is always clearly visible
    }
    const displayContributions = Array.from(byDate.entries()).map(
      ([dateStr, count]) => ({ date: new Date(dateStr), count }),
    );
    return { displayContributions, luminaPatternDates: patternDates };
  }, [contributions, viewMode, weekStarts]);

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
            const isLuminaCell = luminaPatternDates.has(
              format(day, "yyyy-MM-dd"),
            );
            const level = isLuminaCell ? 4 : getLevel(count);

            return (
              <div
                key={index}
                className={cn(
                  "aspect-square w-full min-w-[8px] min-h-[8px] max-w-[16px] rounded-[2px] transition-all duration-150 hover:ring-2 hover:ring-primary/30 hover:ring-offset-0 hover:scale-105 shrink-0",
                  useTheme ? THEME_LEVEL_CLASSES[level] : "",
                  isLuminaCell && "ring-1 ring-primary/50 ring-inset",
                )}
                style={
                  useTheme
                    ? undefined
                    : {
                        backgroundColor: getColor(isLuminaCell ? 4 : count),
                      }
                }
                title={
                  isLuminaCell
                    ? "Lumina"
                    : `${format(day, "PPP")}: ${count} contributions`
                }
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
