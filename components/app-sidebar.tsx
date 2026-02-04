"use client";

import * as React from "react";
import {
  IconBook2,
  IconChartBar,
  IconDashboard,
  IconHeart,
  IconHelp,
  IconSearch,
  IconSettings,
  IconTag,
} from "@tabler/icons-react";

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

const data = {
  user: {
    name: "Alex",
    email: "alex@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Journals",
      url: "/journals",
      icon: IconBook2,
    },
    {
      title: "Entries",
      url: "/dashboard",
      icon: IconChartBar,
    },
    {
      title: "Tags",
      url: "/dashboard",
      icon: IconTag,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Morning pages",
      url: "#",
      icon: IconBook2,
    },
    {
      name: "Gratitude",
      url: "#",
      icon: IconHeart,
    },
    {
      name: "Favorites",
      url: "#",
      icon: IconHeart,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
