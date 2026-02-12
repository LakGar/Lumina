"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EntryEditor } from "@/components/entry-editor";
import {
  IconBook2,
  IconMood,
  IconTag,
  IconSparkles,
  IconRefresh,
  IconMessageCircle,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const MOOD_OPTIONS = [
  "Calm",
  "Grateful",
  "Reflective",
  "Energized",
  "Peaceful",
  "Anxious",
  "Tired",
  "Hopeful",
  "Curious",
  "Uncertain",
  "Focused",
  "Content",
  "Overwhelmed",
];

type Entry = {
  id: number;
  journalId: number;
  content: string;
  createdAt: string;
  journal?: { id: number; title: string };
  mood?: { id: number; label: string; score?: number };
  tags?: Array<{ tag: string; source: string }>;
  summary?: { text?: string; qualityScore?: number };
};

export default function EntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [goDeeperOpen, setGoDeeperOpen] = useState(false);
  const [deeperQuestions, setDeeperQuestions] = useState<string[]>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["entry", id],
    queryFn: () => apiClient.entries.get(id),
    enabled: !Number.isNaN(id),
  });

  const entry = data?.data as Entry | undefined;

  useEffect(() => {
    if (entry?.content != null) setContent(entry.content);
  }, [entry?.content]);

  const updateMutation = useMutation({
    mutationFn: (c: string) => apiClient.entries.update(id, { content: c }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      queryClient.invalidateQueries({
        queryKey: ["journals", entry?.journalId, "entries"],
      });
      toast.success("Entry saved");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to save"),
  });

  const moodMutation = useMutation({
    mutationFn: (label: string) => apiClient.entries.setMood(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      toast.success("Mood updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to set mood"),
  });

  const addTagMutation = useMutation({
    mutationFn: (tag: string) => apiClient.entries.addTag(id, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      setNewTag("");
      toast.success("Tag added");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to add tag"),
  });

  const removeTagMutation = useMutation({
    mutationFn: (tag: string) => apiClient.entries.removeTag(id, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      toast.success("Tag removed");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to remove tag"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.entries.delete(id),
    onSuccess: () => {
      router.push(
        entry?.journalId ? `/journals/${entry.journalId}` : "/entries",
      );
      toast.success("Entry deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete"),
  });

  const regenerateAiMutation = useMutation({
    mutationFn: () => apiClient.entries.regenerateAi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      toast.success("AI insights updated");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to regenerate AI"),
  });

  const goDeeperMutation = useMutation({
    mutationFn: (currentContent?: string) =>
      apiClient.entries.goDeeper(id, currentContent),
    onSuccess: (res) => {
      setDeeperQuestions(res?.data?.questions ?? []);
      setGoDeeperOpen(true);
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to get questions"),
  });

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("Content cannot be empty.");
      return;
    }
    updateMutation.mutate(trimmed);
  };

  const userTags = entry?.tags?.filter((t) => t.source === "USER") ?? [];
  const aiTags = entry?.tags?.filter((t) => t.source === "AI") ?? [];

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
          <p className="text-destructive">
            {error?.message ?? "Failed to load entry."}
          </p>
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
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={
                entry.journalId ? `/journals/${entry.journalId}` : "/entries"
              }
              className="inline-flex items-center gap-1.5 rounded-md text-muted-foreground hover:text-foreground"
            >
              <IconBook2 className="size-4" />
              {entry.journal?.title ?? "Journal"}
            </Link>
            <span className="text-muted-foreground">
              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateAiMutation.mutate()}
              disabled={regenerateAiMutation.isPending}
            >
              <IconRefresh className="size-4 mr-1.5" />
              {regenerateAiMutation.isPending
                ? "Regenerating…"
                : "Regenerate AI"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                goDeeperMutation.mutate(content.trim() || undefined)
              }
              disabled={goDeeperMutation.isPending}
            >
              <IconMessageCircle className="size-4 mr-1.5" />
              {goDeeperMutation.isPending ? "Thinking…" : "Go deeper"}
            </Button>
            <Button
              variant="outline"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || !content.trim()}
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Content</Label>
          <EntryEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing…"
            disabled={updateMutation.isPending}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IconMood className="size-4" />
              Your mood
            </Label>
            <Select
              value={entry.mood?.label ?? ""}
              onValueChange={(v) => moodMutation.mutate(v)}
            >
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder="Set mood" />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Optional. Reflects how you felt when writing.
            </p>
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <IconSparkles className="size-4" />
              AI summary
            </Label>
            <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground min-h-[2.5rem]">
              {entry.summary?.text ? (
                <>
                  <p className="text-foreground">{entry.summary.text}</p>
                  {entry.summary.qualityScore != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Quality score: {entry.summary.qualityScore}
                    </p>
                  )}
                </>
              ) : (
                "Regenerate AI to get a summary and quality score."
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IconTag className="size-4" />
              Your tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {userTags.map((t) => (
                <span
                  key={t.tag}
                  className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-sm"
                >
                  {t.tag}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-muted"
                    onClick={() => removeTagMutation.mutate(t.tag)}
                    aria-label={`Remove ${t.tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const t = newTag.trim();
                    if (t) addTagMutation.mutate(t);
                  }
                }}
                className="rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const t = newTag.trim();
                  if (t) addTagMutation.mutate(t);
                }}
                disabled={!newTag.trim() || addTagMutation.isPending}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <IconSparkles className="size-4" />
              AI tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {aiTags.length > 0 ? (
                aiTags.map((t) => (
                  <span
                    key={t.tag}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm text-primary"
                  >
                    {t.tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Regenerate AI to get suggested tags.
                </span>
              )}
            </div>
          </div>
        </div>

        <Sheet open={goDeeperOpen} onOpenChange={setGoDeeperOpen}>
          <SheetContent className="flex flex-col sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Go deeper</SheetTitle>
            </SheetHeader>
            <p className="text-sm text-muted-foreground mt-2">
              Use a question below to reflect more in your entry.
            </p>
            <ul className="flex flex-col gap-2 mt-4 flex-1">
              {deeperQuestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    className="w-full rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => {
                      setContent((c) => (c.trim() ? `${c}\n\n${q}` : q));
                      setGoDeeperOpen(false);
                    }}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
    </SidebarInset>
  );
}
