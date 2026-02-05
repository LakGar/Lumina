"use client";

import * as React from "react";
import {
  IconBook2,
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
  IconTag,
} from "@tabler/icons-react";
import { useUser } from "@clerk/nextjs";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useJournals } from "@/lib/hooks/use-dashboard";

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Journals", url: "/journals", icon: IconBook2 },
  { title: "Entries", url: "/dashboard", icon: IconChartBar },
  { title: "Tags", url: "/dashboard", icon: IconTag },
];

const navSecondary = [
  { title: "Settings", url: "/settings", icon: IconSettings },
  { title: "Get Help", url: "#", icon: IconHelp },
  { title: "Search", url: "#", icon: IconSearch },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const { data: journalsData } = useJournals();
  const journals = journalsData?.data ?? [];
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
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}
