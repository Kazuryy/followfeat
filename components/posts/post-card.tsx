import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "./vote-button";
import { MessageSquare } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import type { Post, Board, Status, Tag, user } from "@prisma/client";

type PostWithRelations = Post & {
  board: Board;
  status: Status;
  author: Pick<user, "id" | "name" | "image">;
  tags: Tag[];
  _count: { comments: number; votes: number };
};

interface PostCardProps {
  post: PostWithRelations;
  userVoted?: boolean;
}

export function PostCard({ post, userVoted = false }: PostCardProps) {
  return (
    <div className="group flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:shadow-none">
      <VoteButton
        postId={post.id}
        voteCount={post.voteCount}
        initialVoted={userVoted}
      />

      <div className="flex-1 min-w-0">
        <Link href={`/feedback/${post.slug}`} className="block">
          <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
            {post.isPinned && (
              <span className="mr-1.5 inline-block text-zinc-400 dark:text-zinc-500">
                📌
              </span>
            )}
            {post.title}
          </h3>
          {post.content && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {post.content}
            </p>
          )}
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge color={post.status.color}>{post.status.name}</Badge>
          <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {post.board.icon} {post.board.name}
          </Badge>
          {post.tags.map((tag) => (
            <Badge key={tag.id} color={tag.color ?? undefined}>
              {tag.name}
            </Badge>
          ))}
          <span className="ml-auto flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
            <MessageSquare size={12} />
            {post._count.comments}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatRelativeDate(post.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
