import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [postCount, voteCount, commentCount, changelogCount] =
    await Promise.all([
      prisma.post.count(),
      prisma.vote.count(),
      prisma.comment.count(),
      prisma.changelogEntry.count({ where: { state: "LIVE" } }),
    ]);

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      status: true,
      author: { select: { name: true } },
      _count: { select: { votes: true } },
    },
  });

  const stats = [
    { label: "Total Posts", value: postCount },
    { label: "Total Votes", value: voteCount },
    { label: "Comments", value: commentCount },
    { label: "Changelog Entries", value: changelogCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Posts
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          {recentPosts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No posts yet
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                    Post
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                    Author
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">
                    Votes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1 max-w-xs">
                      {post.title}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                      {post.author.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${post.status.color}20`,
                          color: post.status.color,
                        }}
                      >
                        {post.status.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-500 dark:text-zinc-400">
                      {post._count.votes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
