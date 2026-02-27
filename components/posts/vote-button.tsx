"use client";

import { cn } from "@/lib/utils";
import { ChevronUp, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useSession, signIn } from "@/lib/auth-client";

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
  const [showSignIn, setShowSignIn] = useState(false);

  const handleVote = () => {
    if (!session) {
      onSignInRequired ? onSignInRequired() : setShowSignIn(true);
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
    <>
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

      {showSignIn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowSignIn(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <X size={16} />
            </button>

            <div className="mb-1 text-2xl">👋</div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Connectez-vous pour voter
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Votre vote aide à prioriser les fonctionnalités.
            </p>

            <button
              onClick={() =>
                signIn.social({ provider: "authentik", callbackURL: window.location.href })
              }
              className="mt-5 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Se connecter
            </button>
          </div>
        </div>
      )}
    </>
  );
}
