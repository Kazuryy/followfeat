import { prisma } from "@/lib/db";
import { ChangelogCategoryBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Changelog" };
export const dynamic = "force-dynamic";

function getExcerpt(html: string): string {
  const start = html.indexOf("<p");
  const end = html.indexOf("</p>", start);
  const inner = start !== -1 && end !== -1
    ? html.slice(html.indexOf(">", start) + 1, end)
    : html;
  const text = inner.replace(/<[^>]*>/g, "").trim();
  return text.length > 160 ? text.slice(0, 160) + "…" : text;
}

export default async function ChangelogPage() {
  const [entries, allCategories] = await Promise.all([
    prisma.changelogEntry.findMany({
      where: { state: "LIVE" },
      orderBy: { publishedAt: "desc" },
    }),
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Changelog
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Latest updates and improvements.
        </p>
      </div>

      {parsed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400">
            No updates yet
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-2.75 top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          <div className="flex flex-col gap-10">
            {parsed.map((entry) => (
              <div key={entry.id} className="flex gap-6">
                {/* Timeline dot */}
                <div className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>

                <div className="flex-1 pb-2">
                  {/* Date */}
                  <p className="mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    {entry.publishedAt
                      ? formatDate(entry.publishedAt)
                      : "Draft"}
                  </p>

                  {/* Categories */}
                  {entry.categories.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
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
                  )}

                  {/* Card */}
                  <Link href={`/changelog/${entry.slug}`}>
                    <div className="rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                      {entry.featuredImage && (
                        <div className="relative h-44 w-full overflow-hidden">
                          <Image
                            src={entry.featuredImage}
                            alt={entry.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {entry.title}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {getExcerpt(entry.content)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
