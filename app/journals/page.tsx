"use client";

import { useJournals } from "@/lib/hooks/use-dashboard";
import { apiClient } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { IconBook2, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

const createJournalSchema = z.object({ title: z.string().min(1).max(200) });

export default function JournalsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useJournals();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const createMutation = useMutation({
    mutationFn: (t: string) => apiClient.journals.create(t),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      setTitle("");
      setOpen(false);
      toast.success("Journal created");
    },
    onError: (err: Error & { status?: number }) => {
      toast.error(err.message ?? "Failed to create journal");
    },
  });

  const handleCreate = () => {
    const parsed = createJournalSchema.safeParse({ title: title.trim() });
    if (!parsed.success) {
      toast.error("Enter a title (1–200 characters)");
      return;
    }
    createMutation.mutate(parsed.data.title);
  };

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">{error?.message ?? "Failed to load journals."}</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Journals</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button>
                <IconPlus className="size-4" />
                New journal
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New journal</SheetTitle>
                <SheetDescription>
                  Give your journal a name. You can change it later.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="journal-title">Title</Label>
                  <Input
                    id="journal-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning pages"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  Create
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>No journals yet</CardTitle>
              <CardDescription>
                Create a journal to start writing entries.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((j) => (
              <Link key={j.id} href={`/journals/${j.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <IconBook2 className="size-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">
                      {j._count?.entries ?? 0} entries
                    </span>
                  </CardHeader>
                  <CardTitle className="text-lg">{j.title}</CardTitle>
                  <CardDescription>
                    Created {new Date(j.createdAt).toLocaleDateString()}
                  </CardDescription>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SidebarInset>
  );
}
