"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";

const updateEntrySchema = z.object({ content: z.string().min(1) });

export default function EntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["entry", id],
    queryFn: () => apiClient.entries.get(id),
    enabled: !Number.isNaN(id),
  });

  const entry = data?.data as { id: number; journalId: number; content: string; createdAt: string; summary?: { text?: string }; mood?: { label?: string }; journal?: { title?: string } } | undefined;
  useEffect(() => {
    if (entry?.content) setContent(entry.content);
  }, [entry?.content]);

  const updateMutation = useMutation({
    mutationFn: (c: string) => apiClient.entries.update(id, { content: c }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      queryClient.invalidateQueries({ queryKey: ["journals", entry?.journalId, "entries"] });
      toast.success("Entry saved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.entries.delete(id),
    onSuccess: () => {
      router.push(entry?.journalId ? `/journals/${entry.journalId}` : "/dashboard");
      toast.success("Entry deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete"),
  });

  const handleSave = () => {
    const parsed = updateEntrySchema.safeParse({ content: content.trim() });
    if (!parsed.success) {
      toast.error("Content cannot be empty.");
      return;
    }
    updateMutation.mutate(parsed.data.content);
  };

  if (Number.isNaN(id)) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">Invalid entry.</p>
        </div>
      </SidebarInset>
    );
  }

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">{error?.message ?? "Failed to load entry."}</p>
        </div>
      </SidebarInset>
    );
  }

  if (isLoading || !entry) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={entry.journalId ? `/journals/${entry.journalId}` : "/dashboard"}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {entry.journal?.title ?? "Journal"}
            </Link>
            <span className="text-muted-foreground text-sm">
              {new Date(entry.createdAt).toLocaleDateString()}
              {entry.mood?.label ? ` · ${entry.mood.label}` : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="entry-content">Content</Label>
          <textarea
            id="entry-content"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[300px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </SidebarInset>
  );
}
