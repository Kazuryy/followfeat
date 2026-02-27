"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tag } from "@prisma/client";

interface EditPostDialogProps {
  postId: string;
  initialTitle: string;
  initialContent: string | null;
  initialTagIds: string[];
  allTags: Tag[];
}

export function EditPostDialog({
  postId,
  initialTitle,
  initialContent,
  initialTagIds,
  allTags,
}: EditPostDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const [localTags, setLocalTags] = useState<Tag[]>(allTags);
  const [newTagInput, setNewTagInput] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (id: string) =>
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAddTag = async () => {
    const name = newTagInput.trim();
    if (!name) { setShowTagInput(false); return; }
    setAddingTag(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setAddingTag(false);
    if (res.ok) {
      const tag: Tag = await res.json();
      setLocalTags((prev) => prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]);
      setSelectedTagIds((prev) => prev.includes(tag.id) ? prev : [...prev, tag.id]);
    }
    setNewTagInput("");
    setShowTagInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: content || null, tagIds: selectedTagIds }),
    });

    setLoading(false);

    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <Pencil size={12} />
        Edit
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Edit feedback">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Service / App
            </label>
            <div className="flex flex-wrap gap-2">
              {localTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-transparent text-white"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400"
                    )}
                    style={
                      selected
                        ? { backgroundColor: tag.color ?? "#18181b", borderColor: tag.color ?? "#18181b" }
                        : tag.color
                        ? { borderColor: tag.color + "50", color: tag.color }
                        : undefined
                    }
                  >
                    {tag.name}
                  </button>
                );
              })}

              {showTagInput ? (
                <input
                  autoFocus
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleAddTag(); }
                    if (e.key === "Escape") { setShowTagInput(false); setNewTagInput(""); }
                  }}
                  onBlur={handleAddTag}
                  disabled={addingTag}
                  placeholder="Service name…"
                  className="h-6 rounded-full border border-dashed border-zinc-300 bg-transparent px-3 text-xs text-zinc-600 outline-none placeholder:text-zinc-400 dark:border-zinc-600 dark:text-zinc-400"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:hover:border-zinc-500"
                >
                  + Add
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
