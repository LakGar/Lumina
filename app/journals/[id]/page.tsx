"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconPlus, IconMessageCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";

const createEntrySchema = z.object({ content: z.string().min(1) });

export default function JournalEntriesPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [content, setContent] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSessionId, setChatSessionId] = useState<number | undefined>();
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const journalQuery = useQuery({
    queryKey: ["journal", id],
    queryFn: () => apiClient.journals.get(id),
    enabled: !Number.isNaN(id),
  });

  const entriesQuery = useQuery({
    queryKey: ["journals", id, "entries"],
    queryFn: () => apiClient.entries.listByJournal(id),
    enabled: !Number.isNaN(id),
  });

  const createMutation = useMutation({
    mutationFn: (c: string) => apiClient.entries.create(id, c),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals", id, "entries"] });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      setContent("");
      setSheetOpen(false);
      toast.success("Entry created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create entry"),
  });

  const chatMutation = useMutation({
    mutationFn: ({
      message,
      sessionId,
    }: {
      message: string;
      sessionId: number | undefined;
    }) => apiClient.chat.send(id, message, sessionId),
    onSuccess: (res) => {
      const reply = res?.data?.reply ?? "";
      const sid = res?.data?.sessionId;
      if (sid != null) setChatSessionId(sid);
      setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setChatMessage("");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to send"),
  });

  const handleSendChat = () => {
    const msg = chatMessage.trim();
    if (!msg || chatMutation.isPending) return;
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    chatMutation.mutate({ message: msg, sessionId: chatSessionId });
  };

  const handleCreate = () => {
    const parsed = createEntrySchema.safeParse({ content: content.trim() });
    if (!parsed.success) {
      toast.error("Write something first.");
      return;
    }
    createMutation.mutate(parsed.data.content);
  };

  if (Number.isNaN(id)) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">Invalid journal.</p>
        </div>
      </SidebarInset>
    );
  }

  const journal = journalQuery.data?.data;
  const entries = entriesQuery.data?.data ?? [];
  const isLoading = journalQuery.isLoading || entriesQuery.isLoading;
  const isError = journalQuery.isError || entriesQuery.isError;

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">
            {journalQuery.error?.message ??
              entriesQuery.error?.message ??
              "Failed to load."}
          </p>
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
              href="/journals"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Journals
            </Link>
            <h1 className="text-2xl font-semibold">
              {journal?.title ?? (isLoading ? "…" : "Journal")}
            </h1>
          </div>
          <Button variant="outline" onClick={() => setChatOpen(true)}>
            <IconMessageCircle className="size-4" />
            Chat
          </Button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <IconPlus className="size-4" />
                New entry
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>New entry</SheetTitle>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-4 py-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="entry-content">Content</Label>
                  <textarea
                    id="entry-content"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[200px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={chatOpen} onOpenChange={setChatOpen}>
            <SheetContent className="flex flex-col sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Journal chat</SheetTitle>
              </SheetHeader>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions about this journal or get reflections.
              </p>
              <div className="flex-1 overflow-y-auto mt-4 space-y-3 min-h-0">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Send a message to start.
                  </p>
                )}
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "ml-8 bg-primary text-primary-foreground"
                        : "mr-8 bg-muted"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  placeholder="Message…"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  className="rounded-lg"
                />
                <Button
                  onClick={handleSendChat}
                  disabled={!chatMessage.trim() || chatMutation.isPending}
                >
                  Send
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : !entries.length ? (
          <Card>
            <CardHeader>
              <CardTitle>No entries yet</CardTitle>
              <p className="text-muted-foreground text-sm">
                Create your first entry to get started.
              </p>
            </CardHeader>
          </Card>
        ) : (
          <ul className="space-y-2">
            {entries.map(
              (e: {
                id: number;
                content: string;
                createdAt: string;
                summary?: { text?: string } | null;
                mood?: { label?: string } | null;
              }) => (
                <li key={e.id}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <Link href={`/entries/${e.id}`}>
                      <CardHeader className="py-4">
                        <CardTitle className="text-base font-medium line-clamp-2">
                          {(e.summary?.text ??
                            e.content.slice(0, 120).replace(/\n/g, " ")) ||
                            "Untitled"}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                          {new Date(e.createdAt).toLocaleDateString()}
                          {e.mood?.label ? ` · ${e.mood.label}` : ""}
                        </p>
                      </CardHeader>
                    </Link>
                  </Card>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </SidebarInset>
  );
}
