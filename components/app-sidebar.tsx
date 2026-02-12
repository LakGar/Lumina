"use client";

import * as React from "react";
import {
  IconBook2,
  IconBulb,
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
  IconTag,
  IconBell,
} from "@tabler/icons-react";
import { useUser } from "@clerk/nextjs";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { NewEntrySheet } from "@/components/new-entry-sheet";
import { SearchEntriesModal } from "@/components/search-entries-modal";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useJournals } from "@/lib/hooks/use-dashboard";
import { useRecentEntries } from "@/lib/hooks/use-dashboard";

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Journals", url: "/journals", icon: IconBook2 },
  { title: "Entries", url: "/entries", icon: IconChartBar },
  { title: "Tags", url: "/tags", icon: IconTag },
  { title: "Reminders", url: "/reminders", icon: IconBell },
  { title: "Insights", url: "/insights", icon: IconBulb },
];

const navSecondary = [
  { title: "Settings", url: "/settings", icon: IconSettings },
  { title: "Get Help", url: "#", icon: IconHelp },
  { title: "Search", url: "#", icon: IconSearch },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { data: journalsData } = useJournals();
  const { data: entriesData } = useRecentEntries(200);
  const journals = journalsData?.data ?? [];
  const entries = (entriesData?.data ?? []) as Array<{
    id: number;
    journalId: number;
    content: string;
    createdAt: string;
    journal?: { title: string };
    mood?: { label: string };
    summary?: { text?: string };
  }>;
  const documents = React.useMemo(
    () =>
      journals.map((j: { id: number; title: string }) => ({
        name: j.title,
        url: `/journals/${j.id}`,
        icon: IconBook2,
      })),
    [journals],
  );
  const userInfo = React.useMemo(
    () => ({
      name: user?.fullName ?? user?.firstName ?? "User",
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      avatar: user?.imageUrl ?? "",
    }),
    [user],
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <NewEntrySheet />
      <SearchEntriesModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        entries={entries}
      />
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary
          items={navSecondary}
          className="mt-auto"
          onSearchClick={() => setSearchOpen(true)}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}
