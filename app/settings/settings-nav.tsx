"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/settings/preferences", label: "Preferences" },
  { href: "/settings/notification", label: "Notification" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/privacy", label: "Privacy" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 border-b pb-4 mb-6">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname === href ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
