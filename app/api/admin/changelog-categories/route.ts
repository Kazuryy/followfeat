import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if ((session.user as { role?: string }).role !== "admin") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const categories = await prisma.changelogCategory.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { label, color } = await req.json();
  if (!label?.trim())
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  if (!color?.trim())
    return NextResponse.json({ error: "Color is required" }, { status: 400 });

  const value = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  const existing = await prisma.changelogCategory.count({ where: { value } });
  const finalValue = existing > 0 ? `${value}_${Date.now()}` : value;

  const last = await prisma.changelogCategory.findFirst({
    orderBy: { position: "desc" },
  });

  const category = await prisma.changelogCategory.create({
    data: {
      value: finalValue,
      label: label.trim(),
      color: color.trim(),
      position: last ? last.position + 1 : 0,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
