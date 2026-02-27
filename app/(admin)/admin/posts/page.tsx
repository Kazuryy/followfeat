import { prisma } from "@/lib/db";
import { PostsAdminTable } from "./posts-admin-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Posts" };
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const [posts, statuses] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        board: true,
        status: true,
        author: { select: { id: true, name: true } },
        tags: true,
        _count: { select: { votes: true, comments: true } },
      },
    }),
    prisma.status.findMany({ orderBy: { position: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Posts
      </h1>
      <PostsAdminTable posts={posts} statuses={statuses} />
    </div>
  );
}
