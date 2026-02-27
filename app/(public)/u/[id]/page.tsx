import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ChevronUp, MessageSquare, CalendarDays } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return { title: user?.name ?? "Profile" };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;

  const [user, session] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        role: true,
        _count: { select: { posts: true, comments: true } },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!user) notFound();

  const isOwnProfile = session?.user?.id === user.id;

  // Stats: total votes received on their posts
  const votesReceived = await prisma.vote.count({
    where: { post: { authorId: user.id } },
  });

  // Their posts, sorted by votes desc
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { voteCount: "desc" },
    include: {
      board: true,
      status: true,
      tags: true,
      _count: { select: { comments: true, votes: true } },
    },
  });

  // Which posts the viewer voted on
  const viewerId = session?.user?.id;
  const votedPostIds = viewerId
    ? new Set(
        (
          await prisma.vote.findMany({
            where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          })
        ).map((v) => v.postId)
      )
    : new Set<string>();

  const stats = [
    { label: "Posts", value: user._count.posts },
    { label: "Votes received", value: votesReceived },
    { label: "Comments", value: user._count.comments },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile header */}
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-5">
          <Avatar name={user.name} image={user.image} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {user.name ?? "Unknown"}
              </h1>
              {user.role === "admin" && (
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">
                  Admin
                </span>
              )}
            </div>
            {isOwnProfile && (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            )}
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <CalendarDays size={12} />
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 flex gap-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {s.value}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Posts
      </h2>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 dark:border-zinc-800">
          <p className="text-sm text-zinc-400">No posts yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/feedback/${post.slug}`}
              className="group flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              {/* Vote count */}
              <div
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2 ${
                  votedPostIds.has(post.id)
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                }`}
              >
                <ChevronUp size={14} strokeWidth={2.5} />
                <span className="text-xs font-semibold leading-none">
                  {post._count.votes}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-300">
                  {post.title}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge color={post.status.color}>{post.status.name}</Badge>
                  <Badge color={post.board.color ?? undefined}>
                    {post.board.icon} {post.board.name}
                  </Badge>
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} color={tag.color ?? undefined}>
                      {tag.name}
                    </Badge>
                  ))}
                  <span className="ml-auto flex items-center gap-1 text-xs text-zinc-400">
                    <MessageSquare size={12} />
                    {post._count.comments}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
