"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TagPicker } from "@/components/posts/tag-picker";
import { formatRelativeDate } from "@/lib/utils";
import { Trash2, Pin, PinOff } from "lucide-react";
import type { Post, Board, Status, Tag, user } from "@prisma/client";

type PostWithRelations = Post & {
  board: Board;
  status: Status;
  author: Pick<user, "id" | "name">;
  tags: Tag[];
  _count: { votes: number; comments: number };
};

interface PostsAdminTableProps {
  posts: PostWithRelations[];
  statuses: Status[];
}

export function PostsAdminTable({ posts: initialPosts, statuses }: PostsAdminTableProps) {
  const [posts, setPosts] = useState(initialPosts);

  const updatePostStatus = async (postId: string, statusId: string) => {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: updated.status } : p)));
    }
  };

  const togglePin = async (postId: string, isPinned: boolean) => {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !isPinned }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isPinned: !isPinned } : p))
      );
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
      {posts.length === 0 ? (
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
                Board
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                Status
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">
                Tags
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">
                Votes
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">
                Date
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {posts.map((post) => (
              <tr key={post.id} className="group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="text-zinc-400" title="Pinned">
                        📌
                      </span>
                    )}
                    <span className="font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1 max-w-xs">
                      {post.title}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {post.author.name ?? "Anonymous"}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                  {post.board.icon} {post.board.name}
                </td>
                <td className="px-4 py-3">
                  <TagPicker postId={post.id} initialTags={post.tags} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={post.status.id}
                    onChange={(e) => updatePostStatus(post.id, e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right text-zinc-500 dark:text-zinc-400">
                  {post._count.votes}
                </td>
                <td className="px-4 py-3 text-right text-xs text-zinc-400 dark:text-zinc-500">
                  {formatRelativeDate(post.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => togglePin(post.id, post.isPinned)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                      title={post.isPinned ? "Unpin" : "Pin"}
                    >
                      {post.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
