"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type SearchEntry = {
  id: number;
  journalId: number;
  content: string;
  createdAt: string;
  journal?: { title: string };
  mood?: { label: string };
  summary?: { text?: string };
};

export function SearchEntriesModal({
  open,
  onOpenChange,
  entries = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries?: SearchEntry[];
}) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered =
    q.length < 2
      ? []
      : entries.filter((e) => {
          const content = (e.content ?? "").toLowerCase();
          const summary = (e.summary?.text ?? "").toLowerCase();
          const journal = (e.journal?.title ?? "").toLowerCase();
          const mood = (e.mood?.label ?? "").toLowerCase();
          return (
            content.includes(q) ||
            summary.includes(q) ||
            journal.includes(q) ||
            mood.includes(q)
          );
        });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
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
            "fixed left-1/2 top-[20%] z-50 w-full max-w-[520px] -translate-x-1/2",
            "rounded-xl border bg-background shadow-lg focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onPointerDownOutside={() => onOpenChange(false)}
        >
          <div className="flex flex-col max-h-[70vh]">
            <div className="flex items-center gap-2 border-b p-3">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entries…"
                className="border-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-auto p-2">
              {query.trim().length < 2 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search.
                </p>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No entries match &quot;{query}&quot;.
                </p>
              ) : (
                <ul className="space-y-1">
                  {filtered.slice(0, 20).map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/entries/${e.id}`}
                        onClick={() => onOpenChange(false)}
                        className="flex flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <span className="line-clamp-2 text-sm text-foreground">
                          {(e.summary?.text ?? e.content ?? "")
                            .slice(0, 100)
                            .replace(/\n/g, " ")}
                          {(e.content?.length ?? 0) > 100 ? "…" : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {e.journal?.title ?? "Journal"} ·{" "}
                          {new Date(e.createdAt).toLocaleDateString()}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
