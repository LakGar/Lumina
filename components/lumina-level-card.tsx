"use client";

import { IconSparkles } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LEVEL_MAX = 5;
const THRESHOLDS = [0, 100, 300, 600, 1000];

function progressInLevel(score: number): number {
  for (let i = LEVEL_MAX - 1; i >= 0; i--) {
    if (score >= THRESHOLDS[i]) {
      const next = THRESHOLDS[i + 1] ?? Infinity;
      const range = next - THRESHOLDS[i];
      const inRange = score - THRESHOLDS[i];
      return range === Infinity ? 100 : Math.min(100, (inRange / range) * 100);
    }
  }
  return 0;
}

type Stats = {
  luminaScore: number;
  luminaLevel: number;
  currentStreak: number;
  consistency: number;
};

export function LuminaLevelCard({
  stats,
  isLoading,
}: {
  stats: Stats | null | undefined;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 mt-2" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-2 flex-1 rounded-full" />
        </CardFooter>
      </Card>
    );
  }

  const level = stats?.luminaLevel ?? 1;
  const score = stats?.luminaScore ?? 0;
  const progress = progressInLevel(score);

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-card transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5">
          <IconSparkles className="size-4 text-primary" />
          Lumina level
        </CardDescription>
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums">Level {level}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {score} pts
          </span>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {level >= LEVEL_MAX
            ? "Max level — keep journaling!"
            : `Journal, streak, and consistency to reach Level ${level + 1}`}
        </p>
      </CardFooter>
    </Card>
  );
}
