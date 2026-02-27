"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Board {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  position: number;
  _count: { posts: number };
}

const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f97316",
  "#ef4444", "#eab308", "#06b6d4", "#ec4899",
];

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
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
        value={value || "#3b82f6"}
        onChange={(e) => onChange(e.target.value)}
        className="h-5 w-5 cursor-pointer rounded"
        title="Custom color"
      />
    </div>
  );
}

export function BoardsManager({ boards: initial }: { boards: Board[] }) {
  const router = useRouter();
  const [boards, setBoards] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  // ── New board form ──────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  async function handleCreate() {
    setError(null);
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, icon: newIcon, color: newColor }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setBoards((b) => [...b, { ...data, _count: { posts: 0 } }]);
    setNewName("");
    setNewIcon("");
    setNewColor(PRESET_COLORS[0]);
    setCreating(false);
    router.refresh();
  }

  // ── Inline edit ─────────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editColor, setEditColor] = useState(PRESET_COLORS[0]);

  function startEdit(board: Board) {
    setEditId(board.id);
    setEditName(board.name);
    setEditIcon(board.icon ?? "");
    setEditColor(board.color ?? PRESET_COLORS[0]);
  }

  async function handleUpdate(id: string) {
    setError(null);
    const res = await fetch(`/api/boards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, icon: editIcon, color: editColor }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setBoards((b) => b.map((x) => (x.id === id ? { ...x, ...data } : x)));
    setEditId(null);
    router.refresh();
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setBoards((b) => b.filter((x) => x.id !== id));
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
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Board</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Color</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Slug</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">Posts</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {boards.map((board) =>
              editId === board.id ? (
                <tr key={board.id}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        placeholder="Icon"
                        className="w-16 text-center"
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Board name"
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(board.id)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <ColorPicker value={editColor} onChange={setEditColor} />
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-zinc-400">{board.slug}</td>
                  <td className="px-4 py-2 text-right text-zinc-500 dark:text-zinc-400">
                    {board._count.posts}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleUpdate(board.id)}
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
                <tr key={board.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {board.color && (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: board.color }}
                        />
                      )}
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {board.icon} {board.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {board.color ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: board.color }} />
                        <span className="font-mono text-xs text-zinc-500">{board.color}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {board.slug}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500 dark:text-zinc-400">
                    {board._count.posts}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(board)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(board.id)}
                        disabled={board._count.posts > 0}
                        title={board._count.posts > 0 ? "Board has posts" : "Delete"}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}

            {/* New board row */}
            {creating && (
              <tr>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      placeholder="Icon"
                      className="w-16 text-center"
                      autoFocus
                    />
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Board name"
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                  </div>
                </td>
                <td className="px-4 py-2">
                  <ColorPicker value={newColor} onChange={setNewColor} />
                </td>
                <td />
                <td />
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
                      onClick={() => { setCreating(false); setNewName(""); setNewIcon(""); setNewColor(PRESET_COLORS[0]); }}
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
          Add board
        </Button>
      )}
    </div>
  );
}
