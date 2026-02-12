"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconCirclePlusFilled,
  IconNotification,
  type Icon,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { QuickCreateModal } from "@/components/quick-create-modal";
import { useJournals } from "@/lib/hooks/use-dashboard";
import { apiClient } from "@/lib/api/client";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: journalsData } = useJournals();
  const journals = (journalsData?.data ?? []).map(
    (j: { id: number; title: string }) => ({
      id: j.id,
      title: j.title,
    }),
  );

  const createMutation = useMutation({
    mutationFn: ({
      journalId,
      content,
    }: {
      journalId: number;
      content: string;
    }) => apiClient.entries.create(journalId, content),
    onSuccess: (_, { journalId }) => {
      queryClient.invalidateQueries({
        queryKey: ["journals", journalId, "entries"],
      });
      queryClient.invalidateQueries({ queryKey: ["me", "entries"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      setQuickCreateOpen(false);
      toast.success("Entry created");
    },
    onError: (err: Error) =>
      toast.error(err.message ?? "Failed to create entry"),
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              onClick={() => setQuickCreateOpen(true)}
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconNotification />
              <span className="sr-only">Notifications</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <QuickCreateModal
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
          journals={journals}
          onSend={(journalId, content) =>
            createMutation.mutate({ journalId, content })
          }
        />
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
