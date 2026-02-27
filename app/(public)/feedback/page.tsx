import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PostCard } from "@/components/posts/post-card";
import { NewPostForm } from "@/components/posts/new-post-form";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    board?: string;
    status?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function FeedbackPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const board = sp.board ?? "all";
  const sort = sp.sort ?? "trending";
  const statusId = sp.status;
  const q = sp.q;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  type SortDir = "asc" | "desc";
  const orderBy: { [k: string]: SortDir }[] =
    sort === "new"
      ? [{ isPinned: "desc" }, { createdAt: "desc" }]
      : sort === "top"
        ? [{ isPinned: "desc" }, { voteCount: "desc" }]
        : [{ isPinned: "desc" }, { updatedAt: "desc" }, { voteCount: "desc" }];

  const [boards, statuses, tags, posts] = await Promise.all([
    prisma.board.findMany({ orderBy: { position: "asc" } }),
    prisma.status.findMany({ orderBy: { position: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.post.findMany({
      where: {
        ...(board !== "all" && {
          board: { slug: board },
        }),
        ...(statusId
          ? { statusId }
          : { status: { type: { not: "CANCELED" } } }),
        ...(q && { title: { contains: q } }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy: orderBy as any,
      include: {
        board: true,
        status: true,
        author: { select: { id: true, name: true, image: true } },
        tags: true,
        _count: { select: { comments: true, votes: true } },
      },
    }),
  ]);

  // Récupère les IDs des posts votés par l'utilisateur connecté
  const votedPostIds = userId
    ? new Set(
        (
          await prisma.vote.findMany({
            where: { userId, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          })
        ).map((v) => v.postId)
      )
    : new Set<string>();

  const sortLinks = [
    { label: "Trending", value: "trending" },
    { label: "Top", value: "top" },
    { label: "New", value: "new" },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-52 shrink-0">
        <div className="mb-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Boards
          </p>
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/feedback?sort=${sort}${statusId ? `&status=${statusId}` : ""}`}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                board === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              All feedback
            </Link>
            {boards.map((b) => (
              <Link
                key={b.id}
                href={`/feedback?board=${b.slug}&sort=${sort}${statusId ? `&status=${statusId}` : ""}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  board === b.slug
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                )}
              >
                {b.color && board !== b.slug && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                )}
                {b.icon} {b.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Status
          </p>
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/feedback?board=${board}&sort=${sort}`}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                !statusId
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              All statuses
            </Link>
            {statuses.map((s) => (
              <Link
                key={s.id}
                href={`/feedback?board=${board}&sort=${sort}&status=${s.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  statusId === s.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                )}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
            {sortLinks.map((link) => (
              <Link
                key={link.value}
                href={`/feedback?board=${board}&sort=${link.value}${statusId ? `&status=${statusId}` : ""}`}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                  sort === link.value
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <NewPostForm boards={boards} tags={tags} />
        </div>

        {/* Posts list */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">No posts yet</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Be the first to share your feedback!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} userVoted={votedPostIds.has(post.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
