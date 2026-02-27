import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

/** Generate a new API key. Returns the plain key (shown once) + hash + prefix. */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = randomBytes(32).toString("hex");
  const key = `ff_live_${raw}`;
  const hash = createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 15); // "ff_live_" + first 7 hex chars
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** Validate key from Authorization header. Returns the ApiKey record or null. */
export async function validateApiKey(authHeader: string | null): Promise<{
  id: string;
  createdById: string;
  expiresAt: Date | null;
} | null> {
  if (!authHeader) return null;

  const key = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!key.startsWith("ff_live_")) return null;

  const hash = hashApiKey(key);

  const record = await prisma.apiKey.findUnique({ where: { keyHash: hash } });
  if (!record) return null;

  if (record.expiresAt && record.expiresAt < new Date()) return null;

  // Update lastUsedAt asynchronously
  prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return record;
}
