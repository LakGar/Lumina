"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, BookOpen } from "lucide-react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type QuickCreateJournal = { id: number; title: string };

const QuickCreateModal = ({
  open,
  onOpenChange,
  onSend,
  journals = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend?: (journalId: number, content: string) => void;
  journals?: QuickCreateJournal[];
}) => {
  const firstId = journals[0]?.id;
  const [selectedJournalId, setSelectedJournalId] = React.useState(
    firstId != null ? String(firstId) : "",
  );
  React.useEffect(() => {
    if (open && journals.length) setSelectedJournalId(String(journals[0].id));
  }, [open, journals]);

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
            "fixed left-1/2 top-1/2 z-50 w-full max-w-[500px] -translate-x-1/2 -translate-y-1/2",
            "p-4 focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onPointerDownOutside={() => onOpenChange(false)}
        >
          <div className="relative flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "absolute -top-1 -right-1 z-10 rounded-full p-1.5",
                "bg-background/80 border border-border text-muted-foreground",
                "hover:bg-muted hover:text-foreground transition-colors",
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <PromptInputBox
              variant="journal"
              prefixContent={
                <div className="flex items-center gap-2 w-full">
                  <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Select
                    value={selectedJournalId}
                    onValueChange={setSelectedJournalId}
                  >
                    <SelectTrigger className="flex-1 min-w-0 border-0 bg-transparent shadow-none text-sm font-medium text-foreground focus:ring-0 focus-visible:ring-0 h-auto py-0">
                      <SelectValue placeholder="Choose journal" />
                    </SelectTrigger>
                    <SelectContent
                      align="start"
                      className="min-w-[var(--radix-select-trigger-width)]"
                    >
                      {journals.length === 0 ? (
                        <div className="py-2 px-2 text-sm text-muted-foreground">
                          No journals yet
                        </div>
                      ) : (
                        journals.map((j) => (
                          <SelectItem key={j.id} value={String(j.id)}>
                            {j.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              }
              onSend={(message) => {
                const id = selectedJournalId ? Number(selectedJournalId) : NaN;
                if (!Number.isNaN(id) && message.trim()) {
                  onSend?.(id, message.trim());
                  onOpenChange(false);
                }
              }}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { QuickCreateModal };
