"use client";

import { useState } from "react";
import { Trash2, Copy, Check, Plus, KeyRound } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  createdBy: { name: string; email: string };
}

interface ApiKeysManagerProps {
  initialKeys: ApiKeyRecord[];
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState(initialKeys);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        expiresAt: newExpiry || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setRevealedKey(data.key);
      setKeys((prev) => [
        {
          id: data.id,
          name: data.name,
          prefix: data.prefix,
          lastUsedAt: null,
          expiresAt: newExpiry || null,
          createdAt: new Date().toISOString(),
          createdBy: { name: "", email: "" },
        },
        ...prev,
      ]);
      setNewName("");
      setNewExpiry("");
      setCreating(false);
    }
    setLoading(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Révoquer cette clé ? Cette action est irréversible.")) return;
    const res = await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCopy = async () => {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Revealed key banner */}
      {revealedKey && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
          <p className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            Copiez cette clé maintenant — elle ne sera plus affichée.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white px-3 py-2 font-mono text-xs text-zinc-900 border border-amber-200 break-all dark:bg-zinc-900 dark:text-zinc-100 dark:border-amber-800/50">
              {revealedKey}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60 transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
          <button
            onClick={() => setRevealedKey(null)}
            className="mt-2 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400"
          >
            J&apos;ai sauvegardé la clé ✓
          </button>
        </div>
      )}

      {/* Create form */}
      {creating ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Nouvelle clé API
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ex: CI/CD pipeline"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Expiration (optionnelle)
              </label>
              <input
                type="date"
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={loading || !newName.trim()}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? "Création…" : "Créer la clé"}
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(""); setNewExpiry(""); }}
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={14} />
          Créer une clé
        </button>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
          <KeyRound size={24} className="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Aucune clé API</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Préfixe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Dernière utilisation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Expiration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Créée le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {keys.map((key) => {
                const expired = key.expiresAt && new Date(key.expiresAt) < new Date();
                return (
                  <tr key={key.id} className={expired ? "opacity-50" : ""}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {key.name}
                      {expired && (
                        <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          Expirée
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {key.prefix}…
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {key.lastUsedAt ? formatDate(new Date(key.lastUsedAt)) : "Jamais"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {key.expiresAt ? formatDate(new Date(key.expiresAt)) : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {formatDate(new Date(key.createdAt))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                        title="Révoquer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
