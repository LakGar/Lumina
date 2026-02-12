"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

export function AddMoodModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, note: string) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = React.useState("");
  const [note, setNote] = React.useState("");
  const [customTitle, setCustomTitle] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = title === "Other" ? customTitle.trim() : title;
    if (!value) return;
    onSubmit(value, note.trim());
    setTitle("");
    setNote("");
    setCustomTitle("");
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTitle("");
      setNote("");
      setCustomTitle("");
    }
    onOpenChange(next);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border bg-background p-6 shadow-lg focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onPointerDownOutside={() => handleOpenChange(false)}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Log your mood</h2>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className={cn(
                "rounded-full p-1.5 text-muted-foreground",
                "hover:bg-muted hover:text-foreground transition-colors",
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mood-title">Mood</Label>
              <select
                id="mood-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select…</option>
                {MOOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {title === "Other" && (
                <Input
                  placeholder="Describe your mood"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="mt-1"
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mood-note">Note (optional)</Label>
              <textarea
                id="mood-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !title ||
                  (title === "Other" && !customTitle.trim())
                }
              >
                {isPending ? "Saving…" : "Save mood"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
