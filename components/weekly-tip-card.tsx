"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IconBulb, IconChevronRight } from "@tabler/icons-react";
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

export function WeeklyTipCard() {
  const queryClient = useQueryClient();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["weekly-tips"],
    queryFn: () => apiClient.me.weeklyTips.list(1),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiClient.me.weeklyTips.generate(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["weekly-tips"] });
      const tip = (res as { data: Tip }).data;
      setSelectedTip(tip);
      setDetailOpen(true);
      toast.success("Tip generated");
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

  const tip = data?.data?.[0] as Tip | undefined;

  const openDetail = (t: Tip) => {
    setSelectedTip(t);
    setDetailOpen(true);
    if (!t.readAt) markReadMutation.mutate(t.id);
  };

  if (isLoading) {
    return (
      <Card className="border-muted/50">
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
      </Card>
    );
  }

  if (!tip) {
    return (
      <Card className="border-muted/50 transition-shadow hover:shadow-sm">
        <CardHeader className="pb-4">
          <CardDescription className="flex items-center gap-1.5">
            <IconBulb className="size-4 text-amber-500" />
            Weekly insight
          </CardDescription>
          <CardTitle className="text-base font-medium">
            Get a personalized tip
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on your journaling habits, we’ll suggest one thing to try this
            week.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2 w-fit"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "Generating…" : "Get my tip"}
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card
        className="cursor-pointer border-muted/50 transition-shadow hover:shadow-sm"
        onClick={() => openDetail(tip)}
      >
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <IconBulb className="size-4 text-amber-500" />
            Weekly insight
          </CardDescription>
          <CardTitle className="text-base font-medium leading-tight">
            {tip.title}
          </CardTitle>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {tip.shortDescription}
          </p>
          <span className="inline-flex items-center text-sm text-primary mt-1">
            Read more
            <IconChevronRight className="size-4" />
          </span>
        </CardHeader>
      </Card>
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="flex flex-col sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedTip?.title}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTip?.shortDescription}
            </p>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground"
              dangerouslySetInnerHTML={{
                __html: (selectedTip?.detailedText ?? "")
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br />"),
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
