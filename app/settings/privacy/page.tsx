"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type Action = "journals" | "ai" | "all" | null;

const ACTIONS: {
  key: Action;
  label: string;
  description: string;
  confirmLabel: string;
  variant: "default" | "destructive";
}[] = [
  {
    key: "journals",
    label: "Delete all journal data",
    description:
      "Permanently delete all journals and entries. This cannot be undone.",
    confirmLabel: "Delete journals",
    variant: "destructive",
  },
  {
    key: "ai",
    label: "Delete AI data",
    description:
      "Remove AI-generated summaries, moods, tags, and insights. Your raw entries stay.",
    confirmLabel: "Delete AI data",
    variant: "destructive",
  },
  {
    key: "all",
    label: "Delete all data",
    description:
      "Permanently delete your account data (journals, entries, preferences, AI data) and sign you out. This cannot be undone.",
    confirmLabel: "Delete everything & sign out",
    variant: "destructive",
  },
];

export default function PrivacyPage() {
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const [confirmOpen, setConfirmOpen] = useState<Action>(null);

  const deleteJournalsMutation = useMutation({
    mutationFn: () => apiClient.me.deleteAllJournals(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setConfirmOpen(null);
      toast.success("All journal data deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete"),
  });

  const deleteAiMutation = useMutation({
    mutationFn: () => apiClient.me.deleteAiData(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setConfirmOpen(null);
      toast.success("AI data deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete"),
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => apiClient.me.deleteAllData(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setConfirmOpen(null);
      toast.success("Account data deleted");
      signOut({ redirectUrl: "/" });
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete"),
  });

  const runAction = () => {
    if (confirmOpen === "journals") deleteJournalsMutation.mutate();
    else if (confirmOpen === "ai") deleteAiMutation.mutate();
    else if (confirmOpen === "all") deleteAllMutation.mutate();
  };

  const isPending =
    deleteJournalsMutation.isPending ||
    deleteAiMutation.isPending ||
    deleteAllMutation.isPending;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Privacy & data</h1>
        <p className="text-muted-foreground text-sm">
          Control and delete your data.
        </p>
      </div>
      <div className="flex flex-col gap-4 max-w-xl">
        {ACTIONS.map(({ key, label, description, confirmLabel, variant }) => (
          <div
            key={key}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              </div>
              <Button
                variant="outline"
                className={cn(
                  variant === "destructive" &&
                    "border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive",
                )}
                onClick={() => setConfirmOpen(key)}
                disabled={isPending}
              >
                <IconTrash className="size-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DialogPrimitive.Root
        open={confirmOpen !== null}
        onOpenChange={(open) => !open && setConfirmOpen(null)}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <DialogPrimitive.Title className="text-lg font-semibold">
              {ACTIONS.find((a) => a.key === confirmOpen)?.label}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. Are you sure?
            </DialogPrimitive.Description>
            <div className="flex justify-end gap-2 mt-6">
              <DialogPrimitive.Close asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogPrimitive.Close>
              <Button
                variant="destructive"
                onClick={runAction}
                disabled={isPending}
              >
                {isPending
                  ? "Deleting…"
                  : ACTIONS.find((a) => a.key === confirmOpen)?.confirmLabel}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
