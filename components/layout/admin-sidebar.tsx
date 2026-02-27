"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Map,
  FileText,
  Grid2X2,
  Users,
  KeyRound,
  Settings,
  ArrowLeft,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: MessageSquare },
  { href: "/admin/boards", label: "Boards", icon: Grid2X2 },
  { href: "/admin/roadmap", label: "Roadmap", icon: Map },
  { href: "/admin/changelog", label: "Changelog", icon: FileText },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col gap-1 border-r border-zinc-200 bg-white px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 px-3">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Admin
        </span>
      </div>

      {adminLinks.map((link) => {
        const Icon = link.icon;
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            )}
          >
            <Icon size={15} />
            {link.label}
          </Link>
        );
      })}

      <div className="mt-auto">
        <Link
          href="/feedback"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-50"
        >
          <ArrowLeft size={15} />
          Back to app
        </Link>
      </div>
    </aside>
  );
}
