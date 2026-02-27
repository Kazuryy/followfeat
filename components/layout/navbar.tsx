"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut, useSession, signIn } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/feedback", label: "Feedback" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/changelog", label: "Changelog" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/feedback"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
        >
          FollowFeat
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <ThemeToggle />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          {session ? (
            <>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80"
              >
                <Avatar
                  name={session.user.name}
                  image={session.user.image}
                  size={32}
                />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {session.user.email}
                  </div>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <Link
                    href={`/u/${session.user.id}`}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User size={14} />
                    My profile
                  </Link>
                  {(session.user as { role?: string }).role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings size={14} />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Button
              size="sm"
              onClick={() =>
                signIn.social({ provider: "authentik", callbackURL: "/" })
              }
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
