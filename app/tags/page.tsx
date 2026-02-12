"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { IconTag } from "@tabler/icons-react";

export default function TagsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me", "entries", 500],
    queryFn: () => apiClient.me.entries(500),
  });

  const tagCounts = useMemo(() => {
    const entries = data?.data ?? [];
    const counts = new Map<
      string,
      { total: number; user: number; ai: number }
    >();
    for (const e of entries) {
      const tags =
        (e as { tags?: Array<{ tag: string; source?: string }> }).tags ?? [];
      for (const t of tags) {
        const key = t.tag.toLowerCase().trim();
        if (!key) continue;
        const cur = counts.get(key) ?? { total: 0, user: 0, ai: 0 };
        cur.total++;
        if (t.source === "USER") cur.user++;
        else cur.ai++;
        counts.set(key, cur);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, counts]) => ({ tag, ...counts }))
      .sort((a, b) => b.total - a.total);
  }, [data?.data]);

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">
            {error?.message ?? "Failed to load tags."}
          </p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <p className="text-muted-foreground text-sm">
            Topics and labels across your entries. Click a tag to filter (coming
            soon).
          </p>
        </div>
        {isLoading ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : tagCounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <IconTag className="size-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No tags yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add tags to your entries when editing them. AI-generated tags will
              appear here too.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tagCounts.map(({ tag, total, user, ai }) => (
              <Link
                key={tag}
                href={`/entries?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="font-medium">{tag}</span>
                <span className="text-muted-foreground">×{total}</span>
                {(user > 0 || ai > 0) && (
                  <span className="text-xs text-muted-foreground">
                    {user > 0 && "you"}
                    {user > 0 && ai > 0 && " · "}
                    {ai > 0 && "AI"}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </SidebarInset>
  );
}
