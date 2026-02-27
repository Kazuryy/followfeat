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

  const chipBase =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors";
  const chipActive =
    "border-transparent bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900";
  const chipInactive =
    "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Filter bar — scrollable */}
      <div className="relative mb-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1.5 w-max pb-0.5">
            {/* Board chips */}
            <Link
              href={`/feedback?sort=${sort}${statusId ? `&status=${statusId}` : ""}`}
              className={cn(chipBase, board === "all" ? chipActive : chipInactive)}
            >
              All
            </Link>
            {boards.map((b) => (
              <Link
                key={b.id}
                href={`/feedback?board=${b.slug}&sort=${sort}${statusId ? `&status=${statusId}` : ""}`}
                className={cn(chipBase, board === b.slug ? chipActive : chipInactive)}
              >
                {b.icon && <span>{b.icon}</span>}
                {b.name}
              </Link>
            ))}

            {/* Separator */}
            <div className="mx-1 w-px self-stretch bg-zinc-200 dark:bg-zinc-800" />

            {/* Status chips */}
            <Link
              href={`/feedback?board=${board}&sort=${sort}`}
              className={cn(chipBase, !statusId ? chipActive : chipInactive)}
            >
              All statuses
            </Link>
            {statuses
              .filter((s) => s.type !== "CANCELED")
              .map((s) => (
                <Link
                  key={s.id}
                  href={`/feedback?board=${board}&sort=${sort}&status=${s.id}`}
                  className={cn(chipBase, statusId === s.id ? chipActive : chipInactive)}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusId === s.id ? "currentColor" : s.color }}
                  />
                  {s.name}
                </Link>
              ))}
          </div>
        </div>

        {/* Fade hint — right edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-zinc-50 to-transparent dark:from-zinc-950 sm:hidden" />
      </div>

      {/* Sort + New Post */}
      <div className="mb-5 flex items-center justify-between gap-3">
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
  );
}
