"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  value: string;
  label: string;
  color: string;
  position: number;
}

const PRESET_COLORS = [
  "#22c55e", "#3b82f6", "#8b5cf6", "#f97316",
  "#ef4444", "#eab308", "#06b6d4", "#ec4899",
];

export function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  // ── New category form ────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  async function handleCreate() {
    setError(null);
    const res = await fetch("/api/admin/changelog-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel, color: newColor }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setCategories((c) => [...c, data]);
    setNewLabel("");
    setNewColor(PRESET_COLORS[0]);
    setCreating(false);
    router.refresh();
  }

  // ── Inline edit ──────────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditLabel(cat.label);
    setEditColor(cat.color);
  }

  async function handleUpdate(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/changelog-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editLabel, color: editColor }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setCategories((c) => c.map((x) => (x.id === id ? { ...x, ...data } : x)));
    setEditId(null);
    router.refresh();
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/changelog-categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setCategories((c) => c.filter((x) => x.id !== id));
    router.refresh();
  }

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
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Label</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Color</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Value</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {categories.map((cat) =>
              editId === cat.id ? (
                <tr key={cat.id}>
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: editColor + "20", color: editColor }}
                    >
                      {editLabel || "Preview"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Label"
                      className="w-32"
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: c,
                            borderColor: editColor === c ? "#000" : "transparent",
                          }}
                        />
                      ))}
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="h-5 w-5 cursor-pointer rounded"
                        title="Custom color"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-zinc-400">{cat.value}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleUpdate(cat.id)}
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
                <tr key={cat.id}>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: cat.color + "20", color: cat.color }}
                    >
                      {cat.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {cat.label}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-mono text-xs text-zinc-500">{cat.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{cat.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}

            {/* New category row */}
            {creating && (
              <tr>
                <td className="px-4 py-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: newColor + "20", color: newColor }}
                  >
                    {newLabel || "Preview"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Label"
                    className="w-32"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          borderColor: newColor === c ? "#000" : "transparent",
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="h-5 w-5 cursor-pointer rounded"
                      title="Custom color"
                    />
                  </div>
                </td>
                <td />
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={handleCreate}
                      disabled={!newLabel.trim()}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => { setCreating(false); setNewLabel(""); setNewColor(PRESET_COLORS[0]); }}
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
          Add category
        </Button>
      )}
    </div>
  );
}
