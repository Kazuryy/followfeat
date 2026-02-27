import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChangelogCategoryBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Tag } from "lucide-react";
import { DeleteChangelogButton } from "./delete-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Changelog" };
export const dynamic = "force-dynamic";

export default async function AdminChangelogPage() {
  const [entries, allCategories] = await Promise.all([
    prisma.changelogEntry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.changelogCategory.findMany({ orderBy: { position: "asc" } }),
  ]);

  type Category = { value: string; label: string; color: string };
  const categoryMap: Record<string, Category> = Object.fromEntries(
    allCategories.map((c) => [c.value, c])
  );

  const parsed = entries.map((e) => ({
    ...e,
    categories: JSON.parse(e.categories) as string[],
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Changelog
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/changelog/categories">
            <Button size="sm" variant="secondary">
              <Tag size={14} />
              Categories
            </Button>
          </Link>
          <Link href="/admin/changelog/new">
            <Button size="sm">
              <Plus size={14} />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        {parsed.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No entries yet
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                  Title
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                  Categories
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                  State
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">
                  Date
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {parsed.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50 max-w-xs line-clamp-1">
                    {entry.title}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {entry.categories.map((val) => {
                        const cat = categoryMap[val];
                        return (
                          <ChangelogCategoryBadge
                            key={val}
                            label={cat?.label ?? val}
                            color={cat?.color ?? "#71717a"}
                          />
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.state === "LIVE"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {entry.state === "LIVE" ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-zinc-400 dark:text-zinc-500">
                    {entry.publishedAt ? formatDate(entry.publishedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/changelog/${entry.id}/edit`}
                        className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        Edit
                      </Link>
                      <DeleteChangelogButton entryId={entry.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
