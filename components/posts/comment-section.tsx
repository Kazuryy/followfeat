"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";
import { Pin } from "lucide-react";
import { signIn } from "@/lib/auth-client";

interface Comment {
  id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    avatarColor: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data);
        setFetching(false);
      });
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setLoading(false);

    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setContent("");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Comments ({comments.length})
      </h3>

      {fetching ? (
        <div className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar
                name={comment.author.name}
                image={comment.author.image}
                color={comment.author.avatarColor}
                size={32}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {comment.author.name ?? "Anonymous"}
                  </span>
                  {comment.isPinned && (
                    <Pin size={12} className="text-zinc-400" />
                  )}
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatRelativeDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        {session ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Avatar
              name={session.user.name}
              image={session.user.image}
              size={32}
            />
            <div className="flex-1 flex flex-col gap-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !content.trim()}
                >
                  {loading ? "Posting..." : "Post comment"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to leave a comment
            </p>
            <Button
              size="sm"
              onClick={() =>
                signIn.social({ provider: "authentik", callbackURL: window.location.href })
              }
            >
              Sign in
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
