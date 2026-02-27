"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

const PRESET_COLORS = [
  "#18181b", "#3b82f6", "#8b5cf6", "#22c55e",
  "#f97316", "#ef4444", "#eab308", "#06b6d4",
];

export function TagsManager({ tags: initial }: { tags: Tag[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  // ── New tag form ─────────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  async function handleCreate() {
    setError(null);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: newColor }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setTags((t) => [...t, data]);
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
    setCreating(false);
    router.refresh();
  }

  // ── Inline edit ──────────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  function startEdit(tag: Tag) {
    setEditId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color ?? PRESET_COLORS[0]);
  }

  async function handleUpdate(id: string) {
    setError(null);
    const res = await fetch(`/api/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, color: editColor }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setTags((t) => t.map((x) => (x.id === id ? { ...x, ...data } : x)));
    setEditId(null);
    router.refresh();
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setTags((t) => t.filter((x) => x.id !== id));
    router.refresh();
  }

  const ColorPicker = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (c: string) => void;
  }) => (
    <div className="flex items-center gap-1.5">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: c,
            borderColor: value === c ? "white" : "transparent",
            boxShadow: value === c ? `0 0 0 2px ${c}` : "none",
          }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-5 w-5 cursor-pointer rounded"
        title="Custom color"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Preview</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Name</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Color</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {tags.map((tag) =>
              editId === tag.id ? (
                <tr key={tag.id}>
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: editColor + "20", color: editColor }}
                    >
                      {editName || "Preview"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Service name"
                      className="w-40"
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(tag.id)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <ColorPicker value={editColor} onChange={setEditColor} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleUpdate(tag.id)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={tag.id}>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={
                        tag.color
                          ? { backgroundColor: tag.color + "20", color: tag.color }
                          : { backgroundColor: "#f4f4f5", color: "#3f3f46" }
                      }
                    >
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {tag.name}
                  </td>
                  <td className="px-4 py-3">
                    {tag.color ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-mono text-xs text-zinc-500">{tag.color}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(tag)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}

            {/* New tag row */}
            {creating && (
              <tr>
                <td className="px-4 py-2">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: newColor + "20", color: newColor }}
                  >
                    {newName || "Preview"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Service name"
                    className="w-40"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </td>
                <td className="px-4 py-2">
                  <ColorPicker value={newColor} onChange={setNewColor} />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => { setCreating(false); setNewName(""); setNewColor(PRESET_COLORS[0]); }}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!creating && (
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Add service
        </Button>
      )}
    </div>
  );
}
