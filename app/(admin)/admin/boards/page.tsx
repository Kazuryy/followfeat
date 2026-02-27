import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { BoardsManager } from "./boards-manager";

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
      <BoardsManager boards={boards} />
    </div>
  );
}
