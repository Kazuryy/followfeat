import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if ((session.user as { role?: string }).role !== "admin") return null;
  return session;
}

export async function GET() {
  const boards = await prisma.board.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, icon, color } = await req.json();
  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // ensure slug uniqueness
  const existing = await prisma.board.count({ where: { slug } });
  const finalSlug = existing > 0 ? `${slug}-${Date.now()}` : slug;

  const last = await prisma.board.findFirst({ orderBy: { position: "desc" } });
  const position = last ? last.position + 1 : 0;

  const board = await prisma.board.create({
    data: { name: name.trim(), slug: finalSlug, icon: icon?.trim() || null, color: color?.trim() || null, position },
  });

  return NextResponse.json(board, { status: 201 });
}
