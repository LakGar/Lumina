"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useUIStore } from "@/lib/store/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJournals } from "@/lib/hooks/use-dashboard";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { IconBook2, IconPencil } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const schema = z.object({ content: z.string().min(1), journalId: z.number() });

export function NewEntrySheet() {
  const { newEntryOpen, setNewEntryOpen } = useUIStore();
  const queryClient = useQueryClient();
  const { data: journalsData } = useJournals();
  const [journalId, setJournalId] = useState<number | "">("");
  const [content, setContent] = useState("");

  const createMutation = useMutation({
    mutationFn: ({ jId, c }: { jId: number; c: string }) =>
      apiClient.entries.create(jId, c),
    onSuccess: (_, { jId }) => {
      queryClient.invalidateQueries({ queryKey: ["journals", jId, "entries"] });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      setContent("");
      setNewEntryOpen(false);
      toast.success("Entry created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create entry"),
  });

  const journals = journalsData?.data ?? [];
  const handleSubmit = () => {
    const parsed = schema.safeParse({
      journalId: journalId === "" ? undefined : journalId,
      content: content.trim(),
    });
    if (!parsed.success || typeof parsed.data.journalId !== "number") {
      toast.error("Pick a journal and write something.");
      return;
    }
    createMutation.mutate({
      jId: parsed.data.journalId,
      c: parsed.data.content,
    });
  };

  const canSubmit =
    !createMutation.isPending && content.trim().length > 0 && journalId !== "";

  return (
    <Sheet open={newEntryOpen} onOpenChange={setNewEntryOpen}>
      <SheetContent
        className={cn(
          "flex flex-col w-full border-0 shadow-xl sm:max-w-md",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90",
        )}
      >
        <SheetHeader className="shrink-0 space-y-2 border-b border-border/60 pb-6">
          <SheetTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <IconPencil className="size-5" />
            </span>
            New entry
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            Choose a journal and capture your thoughts. You can add mood and
            tags when you edit later.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-hidden py-6">
          <div className="space-y-3 shrink-0">
            <Label className="text-sm font-medium">Journal</Label>
            <Select
              value={journalId === "" ? "" : String(journalId)}
              onValueChange={(v) => setJournalId(v === "" ? "" : Number(v))}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-muted/30 hover:bg-muted/50 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select a journal" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {journals.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No journals yet. Create one from the Journals page.
                  </div>
                ) : (
                  journals.map((j: { id: number; title: string }) => (
                    <SelectItem
                      key={j.id}
                      value={String(j.id)}
                      className="rounded-lg"
                    >
                      <span className="flex items-center gap-2">
                        <IconBook2 className="size-4 text-muted-foreground" />
                        {j.title}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <Label htmlFor="new-entry-content" className="text-sm font-medium">
              What&apos;s on your mind?
            </Label>
            <textarea
              id="new-entry-content"
              className={cn(
                "flex-1 min-h-[200px] w-full resize-none rounded-xl border border-border/80 px-4 py-3.5 text-sm leading-relaxed",
                "bg-muted/20 placeholder:text-muted-foreground/80",
                "focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0",
              )}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing… no need to be perfect."
            />
          </div>
          <div className="flex shrink-0 flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setNewEntryOpen(false)}
              className="h-11 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "h-11 rounded-xl font-medium",
                canSubmit && "shadow-sm",
              )}
            >
              {createMutation.isPending ? "Saving…" : "Save entry"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
