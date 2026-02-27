import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { VoteButton } from "@/components/posts/vote-button";
import { CommentSection } from "@/components/posts/comment-section";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { AdminPostActions } from "@/components/posts/admin-post-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  return { title: post?.title ?? "Post" };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      board: true,
      status: true,
      author: { select: { id: true, name: true, image: true } },
      tags: true,
      _count: { select: { comments: true, votes: true } },
    },
  });

  if (!post) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [userVote, statuses] = await Promise.all([
    userId
      ? prisma.vote.findUnique({
          where: { postId_userId: { postId: post.id, userId } },
        })
      : Promise.resolve(null),
    isAdmin ? prisma.status.findMany({ orderBy: { position: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/feedback"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to feedback
      </Link>

      {isAdmin && statuses.length > 0 && (
        <AdminPostActions
          postId={post.id}
          currentStatusId={post.statusId}
          statuses={statuses}
        />
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex gap-4">
          <VoteButton
            postId={post.id}
            voteCount={post.voteCount}
            initialVoted={!!userVote}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {post.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge color={post.status.color}>{post.status.name}</Badge>
              <Badge>
                {post.board.icon} {post.board.name}
              </Badge>
              {post.tags.map((tag) => (
                <Badge key={tag.id} color={tag.color ?? undefined}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {post.content && (
          <p className="mt-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <Link href={`/u/${post.author.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar
              name={post.author.name}
              image={post.author.image}
              size={24}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {post.author.name ?? "Anonymous"}
            </span>
          </Link>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">· {formatDate(post.createdAt)}</span>
          {post.eta && (
            <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
              ETA: {formatDate(post.eta)}
            </span>
          )}
        </div>
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
}
