import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChangelogForm } from "../../changelog-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Changelog Entry" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditChangelogPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await prisma.changelogEntry.findUnique({ where: { id } });
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Edit Changelog Entry
      </h1>
      <ChangelogForm
        entryId={entry.id}
        initialData={{
          title: entry.title,
          content: entry.content,
          categories: JSON.parse(entry.categories),
          featuredImage: entry.featuredImage ?? "",
          state: entry.state,
          publishedAt: entry.publishedAt?.toISOString(),
        }}
      />
    </div>
  );
}
