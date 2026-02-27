import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/api-key";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if ((session.user as { role?: string }).role !== "admin") return null;
  return session;
}

// GET /api/admin/api-keys — list all keys
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  return NextResponse.json(keys);
}

// POST /api/admin/api-keys — create a new key
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, expiresAt } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { key, hash, prefix } = generateApiKey();

  const record = await prisma.apiKey.create({
    data: {
      name: name.trim(),
      keyHash: hash,
      prefix,
      createdById: session.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  // Return the plain key ONCE — it won't be retrievable again
  return NextResponse.json({ id: record.id, name: record.name, prefix, key });
}
