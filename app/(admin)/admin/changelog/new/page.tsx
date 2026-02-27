import { prisma } from "@/lib/db";
import { ChangelogForm } from "../changelog-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Changelog Entry" };

export default async function NewChangelogPage() {
  const availableCategories = await prisma.changelogCategory.findMany({
    orderBy: { position: "asc" },
    select: { value: true, label: true, color: true },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        New Changelog Entry
      </h1>
      <ChangelogForm availableCategories={availableCategories} />
    </div>
  );
}
