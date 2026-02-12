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
import { Skeleton } from "@/components/ui/skeleton";
import { IconBook2, IconPlus, IconFileText } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { NewJournalModal } from "@/components/new-journal-modal";

export default function JournalsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useJournals();
  const [modalOpen, setModalOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (t: string) => apiClient.journals.create(t),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      setModalOpen(false);
      toast.success("Journal created");
    },
    onError: (err: Error & { status?: number }) => {
      toast.error(err.message ?? "Failed to create journal");
    },
  });

  if (isError) {
    return (
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          <p className="text-destructive">
            {error?.message ?? "Failed to load journals."}
          </p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <NewJournalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(title) => createMutation.mutate(title)}
        isPending={createMutation.isPending}
      />
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Journals</h1>
          <p className="text-muted-foreground text-sm">
            Your writing spaces. Open one to view or add entries.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)} className="rounded-lg">
            <IconPlus className="size-4" />
            New journal
          </Button>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <Card className="rounded-xl border-dashed">
            <CardHeader className="text-center py-12">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <IconBook2 className="size-7 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">No journals yet</CardTitle>
              <CardDescription className="max-w-sm mx-auto">
                Create a journal to start writing entries and track your
                thoughts.
              </CardDescription>
              <Button
                className="mt-6 w-fit mx-auto rounded-lg"
                onClick={() => setModalOpen(true)}
              >
                <IconPlus className="size-4" />
                Create your first journal
              </Button>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((j) => (
              <Link key={j.id} href={`/journals/${j.id}`} className="group">
                <Card className="h-full rounded-xl border transition-all duration-200 hover:border-primary/30 hover:shadow-md group-hover:bg-muted/30">
                  <CardHeader className="flex flex-col gap-3 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <IconBook2 className="size-5" />
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {j._count?.entries ?? 0}{" "}
                        {j._count?.entries === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                      {j.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <IconFileText className="size-3.5" />
                      Created{" "}
                      {new Date(j.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SidebarInset>
  );
}
