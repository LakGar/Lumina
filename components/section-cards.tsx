import {
  IconBook2,
  IconFlame,
  IconMoodHappy,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type SectionCardsStats = {
  entriesThisWeek: number;
  lastWeekCount: number;
  streak: number;
  journalCount: number;
  journalTitles?: string;
  topMood: string;
};

export function SectionCards({ stats }: { stats?: SectionCardsStats | null }) {
  const diff = stats ? stats.entriesThisWeek - stats.lastWeekCount : 0;
  const diffLabel = diff > 0 ? `+${diff}` : diff < 0 ? String(diff) : "0";
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Entries this week</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.entriesThisWeek ?? "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {stats != null ? diffLabel : "—"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats != null
              ? diff > 0
                ? "More than last week"
                : diff < 0
                  ? "Fewer than last week"
                  : "Same as last week"
              : "—"}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Journal entries in the last 7 days
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current streak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats != null ? `${stats.streak} days` : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFlame className="text-amber-500" />
              {stats?.streak ? "On fire" : "—"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Keep writing every day
          </div>
          <div className="text-muted-foreground">
            Consecutive days with at least one entry
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Journals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.journalCount ?? "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconBook2 className="size-3.5" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats?.journalTitles ?? "Journals you're writing in"}
          </div>
          <div className="text-muted-foreground">
            Journals you’re writing in
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Mood this week</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.topMood ?? "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconMoodHappy className="size-3.5" />
              Balanced
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Based on your recent entries
          </div>
          <div className="text-muted-foreground">
            Reflected from last 7 days
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
