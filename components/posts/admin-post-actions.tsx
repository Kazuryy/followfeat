"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import type { Status } from "@prisma/client";

interface AdminPostActionsProps {
  postId: string;
  currentStatusId: string;
  statuses: Status[];
}

export function AdminPostActions({
  postId,
  currentStatusId,
  statuses,
}: AdminPostActionsProps) {
  const router = useRouter();
  const [statusId, setStatusId] = useState(currentStatusId);
  const [loading, setLoading] = useState(false);

  const canceledStatus = statuses.find((s) => s.type === "CANCELED");

  const updateStatus = async (newStatusId: string) => {
    setLoading(true);
    setStatusId(newStatusId);
    await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId: newStatusId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <ShieldCheck size={14} className="shrink-0 text-zinc-400" />
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Admin
      </span>
      <div className="ml-auto flex items-center gap-2">
        <select
          value={statusId}
          disabled={loading}
          onChange={(e) => updateStatus(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 disabled:opacity-50"
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {canceledStatus && statusId !== canceledStatus.id && (
          <button
            onClick={() => updateStatus(canceledStatus.id)}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800/50 dark:bg-zinc-950 dark:hover:bg-red-900/20"
          >
            <X size={12} />
            Reject
          </button>
        )}
      </div>
    </div>
  );
}
