"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface TagPickerProps {
  postId: string;
  initialTags: Tag[];
  onChange?: (tags: Tag[]) => void;
}

export function TagPicker({ postId, initialTags, onChange }: TagPickerProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then(setAllTags);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const save = async (newTags: Tag[]) => {
    setTags(newTags);
    onChange?.(newTags);
    await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds: newTags.map((t) => t.id) }),
    });
  };

  const addTag = async (tag: Tag) => {
    if (tags.find((t) => t.id === tag.id)) return;
    await save([...tags, tag]);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeTag = async (tagId: string) => {
    await save(tags.filter((t) => t.id !== tagId));
  };

  const createAndAdd = async () => {
    if (!query.trim()) return;
    const existing = allTags.find(
      (t) => t.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (existing) {
      await addTag(existing);
      return;
    }
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: query.trim() }),
    });
    if (res.ok) {
      const tag = await res.json();
      setAllTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      await addTag(tag);
    }
  };

  const filtered = allTags.filter(
    (t) =>
      !tags.find((st) => st.id === t.id) &&
      t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-1">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={
              tag.color
                ? { backgroundColor: tag.color + "22", color: tag.color }
                : { backgroundColor: "rgb(244 244 245)", color: "rgb(82 82 91)" }
            }
          >
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-0.5 rounded-full hover:opacity-70"
            >
              <X size={9} />
            </button>
          </span>
        ))}
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:hover:border-zinc-500"
        >
          <Plus size={9} />
          Add
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createAndAdd();
                if (e.key === "Escape") { setOpen(false); setQuery(""); }
              }}
              placeholder="Search or create..."
              className="w-full rounded-lg border border-zinc-200 bg-transparent px-2 py-1 text-xs outline-none dark:border-zinc-800"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                onClick={() => addTag(tag)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {tag.color && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                {tag.name}
              </button>
            ))}
            {query.trim() && !allTags.find((t) => t.name.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                onClick={createAndAdd}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <Plus size={10} />
                Create &ldquo;{query.trim()}&rdquo;
              </button>
            )}
            {filtered.length === 0 && !query.trim() && (
              <p className="px-3 py-2 text-xs text-zinc-400">No tags yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
