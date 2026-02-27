import { prisma } from "@/lib/db";
import { RoadmapBoard } from "@/components/roadmap/roadmap-board";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Roadmap" };
export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const [statuses, posts] = await Promise.all([
    prisma.status.findMany({ orderBy: { position: "asc" } }),
    prisma.post.findMany({
      where: {
        status: { type: { not: "CANCELED" } },
      },
      orderBy: { voteCount: "desc" },
      include: {
        tags: true,
        board: true,
        _count: { select: { comments: true } },
      },
    }),
  ]);

  const postCards = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    statusId: p.statusId,
    isPinned: p.isPinned,
    voteCount: p.voteCount,
    content: p.content ?? null,
    tags: p.tags,
    board: p.board,
    _count: p._count,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Roadmap
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          See what we&apos;re working on and what&apos;s coming next.
        </p>
      </div>

      <RoadmapBoard initialPosts={postCards} statuses={statuses} />
    </div>
  );
}
