"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiClient } from "@/lib/api/client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconBulb } from "@tabler/icons-react";
import { toast } from "sonner";

type Tip = {
  id: number;
  title: string;
  shortDescription: string;
  detailedText: string;
  tipType: string | null;
  readAt: string | null;
  createdAt: string;
};

export default function InsightsPage() {
  const queryClient = useQueryClient();
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["weekly-tips"],
    queryFn: () => apiClient.me.weeklyTips.list(20),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiClient.me.weeklyTips.generate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-tips"] });
      toast.success("New tip generated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to generate tip"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiClient.me.weeklyTips.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-tips"] });
    },
  });

  const tips = (data?.data ?? []) as Tip[];
  const selectedTip = tips.find((t) => t.id === detailId);

  const openDetail = (t: Tip) => {
    setDetailId(t.id);
    if (!t.readAt) markReadMutation.mutate(t.id);
  };

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Insights</h1>
            <p className="text-muted-foreground text-sm">
              Weekly tips tailored to your journaling.
            </p>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <IconBulb className="size-4" />
            {generateMutation.isPending ? "Generating…" : "Generate tip"}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : tips.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm">
            No tips yet. Generate one based on your recent activity.
          </div>
        ) : (
          <ul className="space-y-2">
            {tips.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  onClick={() => openDetail(t)}
                >
                  <p className="font-medium">{t.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground mt-1">
                    {t.shortDescription}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(t.createdAt), "MMM d, yyyy")}
                    {t.readAt ? " · Read" : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        open={detailId !== null}
        onOpenChange={(open) => !open && setDetailId(null)}
      >
        <SheetContent className="flex flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedTip?.title}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            {selectedTip && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedTip.shortDescription}
                </p>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: (selectedTip.detailedText ?? "")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br />"),
                  }}
                />
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </SidebarInset>
  );
}
