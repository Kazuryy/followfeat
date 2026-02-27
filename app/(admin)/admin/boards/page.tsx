import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Boards" };
export const dynamic = "force-dynamic";

export default async function AdminBoardsPage() {
  const boards = await prisma.board.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Boards
      </h1>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                Board
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                Slug
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">
                Posts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {boards.map((board) => (
              <tr key={board.id}>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                  {board.icon} {board.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {board.slug}
                </td>
                <td className="px-4 py-3 text-right text-zinc-500 dark:text-zinc-400">
                  {board._count.posts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
