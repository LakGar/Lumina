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

// Mock journals for frontend – replace with API later
const MOCK_JOURNALS = [
  { id: "today", title: "Today" },
  { id: "work", title: "Work" },
  { id: "personal", title: "Personal" },
  { id: "gratitude", title: "Gratitude" },
  { id: "ideas", title: "Ideas" },
];

const QuickCreateModal = ({
  open,
  onOpenChange,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend?: (message: string, files?: File[]) => void;
}) => {
  const [selectedJournalId, setSelectedJournalId] = React.useState(
    MOCK_JOURNALS[0]?.id ?? "",
  );

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
                      {MOCK_JOURNALS.map((journal) => (
                        <SelectItem key={journal.id} value={journal.id}>
                          {journal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }
              onSend={(message, files) => {
                onSend?.(message, files);
                onOpenChange(false);
              }}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { QuickCreateModal };
