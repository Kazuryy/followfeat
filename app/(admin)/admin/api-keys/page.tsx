import { prisma } from "@/lib/db";
import { ApiKeysManager } from "./api-keys-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "API Keys" };
export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
      createdBy: { select: { name: true, email: true } },
    },
  });

  const serialized = keys.map((k) => ({
    ...k,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    expiresAt: k.expiresAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          API Keys
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gérez les clés d&apos;accès à l&apos;API. Chaque clé est affichée une seule fois à la création.
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
            Récupérer les catégories disponibles
          </p>
          <pre className="overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{`GET /api/v1/changelog/categories
# Pas d'authentification requise

# Réponse :
[
  { "value": "NEW",      "label": "New" },
  { "value": "IMPROVED", "label": "Improved" },
  { "value": "FIXED",    "label": "Fixed" },
  { "value": "BETA",     "label": "Beta" }
]`}</pre>
        </div>

        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
            Publier un changelog via l&apos;API
          </p>
          <pre className="overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{`POST /api/v1/changelog
Authorization: Bearer <api_key>
Content-Type: application/json

{
  "title": "v2.0.0",
  "content": "<p>Description en HTML</p>",
  "categories": ["NEW", "FIXED"],  // valeurs du GET /categories
  "featuredImage": "https://...",  // optionnel
  "publishedAt": "2026-02-27",     // optionnel
  "state": "LIVE"                  // "LIVE" | "DRAFT"
}`}</pre>
        </div>
      </div>

      <ApiKeysManager initialKeys={serialized} />
    </div>
  );
}
