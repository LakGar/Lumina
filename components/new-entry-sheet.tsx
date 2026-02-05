"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useUIStore } from "@/lib/store/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
    onError: (err: Error) => toast.error(err.message ?? "Failed to create entry"),
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
    createMutation.mutate({ jId: parsed.data.journalId, c: parsed.data.content });
  };

  return (
    <Sheet open={newEntryOpen} onOpenChange={setNewEntryOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>New entry</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label>Journal</Label>
            <Select
              value={journalId === "" ? "" : String(journalId)}
              onValueChange={(v) => setJournalId(v === "" ? "" : Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select journal" />
              </SelectTrigger>
              <SelectContent>
                {journals.map((j: { id: number; title: string }) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 flex-1">
            <Label htmlFor="new-entry-content">Content</Label>
            <textarea
              id="new-entry-content"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[200px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setNewEntryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
