import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ChevronUp, MessageSquare, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    postCount,
    memberCount,
    commentCount,
    changelogCount,
    pendingCount,
    postsByStatus,
    pendingPosts,
    topPosts,
    recentComments,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.changelogEntry.count({ where: { state: "LIVE" } }),
    prisma.post.count({ where: { status: { type: "REVIEWING" } } }),
    // Posts grouped by status
    prisma.status.findMany({
      orderBy: { position: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
    // Posts awaiting review
    prisma.post.findMany({
      take: 6,
      where: { status: { type: "REVIEWING" } },
      orderBy: { createdAt: "desc" },
      include: {
        board: true,
        author: { select: { name: true } },
        _count: { select: { votes: true } },
      },
    }),
    // Top voted posts
    prisma.post.findMany({
      take: 6,
      orderBy: { voteCount: "desc" },
      where: { voteCount: { gt: 0 } },
      include: {
        status: true,
        board: true,
        _count: { select: { votes: true } },
      },
    }),
    // Recent comments
    prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        post: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Total Posts", value: postCount, href: "/admin/posts" },
    {
      label: "Pending Review",
      value: pendingCount,
      href: "/admin/posts",
      highlight: pendingCount > 0,
    },
    { label: "Members", value: memberCount, href: "/admin/members" },
    {
      label: "Changelog Live",
      value: changelogCount,
      href: "/admin/changelog",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
            <p
              className={`mt-1 text-2xl font-semibold ${
                stat.highlight
                  ? "text-amber-500"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* ── Posts by status ────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Posts by Status
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {postsByStatus.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {s.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {s._count.posts}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column section ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Awaiting review */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Awaiting Review
              {pendingCount > 0 && (
                <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  {pendingCount}
                </span>
              )}
            </h2>
            <Link
              href="/admin/posts"
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {pendingPosts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-400">
                Nothing to review 🎉
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pendingPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/feedback/${post.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {post.title}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {post.author.name} · {post.board.icon} {post.board.name}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                        <ChevronUp size={12} />
                        {post._count.votes}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top posts */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Top Posts
            </h2>
            <Link
              href="/admin/posts"
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {topPosts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-400">
                No votes yet
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {topPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/feedback/${post.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {post.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: post.status.color }}
                          />
                          {post.status.name}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        <ChevronUp size={12} />
                        {post._count.votes}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent comments ────────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Recent Comments
          </h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {recentComments.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-400">
              No comments yet
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentComments.map((comment) => (
                <li key={comment.id}>
                  <Link
                    href={`/feedback/${comment.post.slug}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <MessageSquare
                      size={14}
                      className="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                        {comment.content}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {comment.author.name} on{" "}
                        <span className="font-medium text-zinc-500 dark:text-zinc-400">
                          {comment.post.title}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                      <Clock size={11} />
                      {formatDate(comment.createdAt)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
