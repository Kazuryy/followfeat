"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteChangelogButton({ entryId }: { entryId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this changelog entry? This cannot be undone.")) return;

    const res = await fetch(`/api/changelog/${entryId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-zinc-400 hover:text-red-500 transition-colors"
      title="Delete"
    >
      <Trash2 size={14} />
    </button>
  );
}
