"use client";

import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { useState, useTransition } from "react";
import { useSession } from "@/lib/auth-client";

interface VoteButtonProps {
  postId: string;
  voteCount: number;
  initialVoted?: boolean;
  onSignInRequired?: () => void;
  className?: string;
}

export function VoteButton({
  postId,
  voteCount,
  initialVoted = false,
  onSignInRequired,
  className,
}: VoteButtonProps) {
  const { data: session } = useSession();
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(voteCount);
  const [isPending, startTransition] = useTransition();

  const handleVote = () => {
    if (!session) {
      onSignInRequired?.();
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setVoted(data.voted);
        setCount((c) => (data.voted ? c + 1 : c - 1));
      }
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2 transition-all",
        voted
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900",
        "disabled:opacity-50",
        className
      )}
    >
      <ChevronUp size={16} strokeWidth={2.5} />
      <span className="text-xs font-semibold leading-none">{count}</span>
    </button>
  );
}
