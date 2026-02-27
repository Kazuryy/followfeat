import { prisma } from "@/lib/db";
import { TagsManager } from "./tags-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Services & Apps" };
export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Services & Apps
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Users can pick one or more services when submitting a post.
        </p>
      </div>
      <div className="mb-6" />
      <TagsManager tags={tags} />
    </div>
  );
}
