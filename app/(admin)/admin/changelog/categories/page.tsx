import { prisma } from "@/lib/db";
import { CategoriesManager } from "./categories-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Changelog Categories" };
export const dynamic = "force-dynamic";

export default async function ChangelogCategoriesPage() {
  const categories = await prisma.changelogCategory.findMany({
    orderBy: { position: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Changelog Categories
      </h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
