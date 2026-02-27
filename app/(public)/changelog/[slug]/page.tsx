import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChangelogCategoryBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await prisma.changelogEntry.findUnique({ where: { slug } });
  return { title: entry?.title ?? "Changelog" };
}

export default async function ChangelogEntryPage({ params }: PageProps) {
  const { slug } = await params;

  const [entry, allCategories] = await Promise.all([
    prisma.changelogEntry.findUnique({ where: { slug } }),
    prisma.changelogCategory.findMany({ orderBy: { position: "asc" } }),
  ]);

  if (!entry || entry.state !== "LIVE") notFound();

  type Category = { value: string; label: string; color: string };
  const categoryMap: Record<string, Category> = Object.fromEntries(
    allCategories.map((c) => [c.value, c])
  );

  const categories = JSON.parse(entry.categories) as string[];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/changelog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to changelog
      </Link>

      <article className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
        {entry.featuredImage && (
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={entry.featuredImage}
              alt={entry.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Meta */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {categories.map((val) => {
              const cat = categoryMap[val];
              return (
                <ChangelogCategoryBadge
                  key={val}
                  label={cat?.label ?? val}
                  color={cat?.color ?? "#71717a"}
                />
              );
            })}
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {entry.publishedAt ? formatDate(entry.publishedAt) : ""}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {entry.title}
          </h1>

          {/* Rich content */}
          <div
            className="changelog-content mt-6 text-sm text-zinc-700 dark:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        </div>
      </article>
    </div>
  );
}
