import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function requireAdmin(selfId?: string, targetId?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") return null;
  if (selfId && targetId && selfId === targetId) return null; // prevent self-modification
  return session;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.id === id) {
    return NextResponse.json({ error: "Cannot modify yourself" }, { status: 400 });
  }

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (typeof body.role === "string") allowed.role = body.role;
  if (typeof body.banned === "boolean") allowed.banned = body.banned;

  const user = await prisma.user.update({ where: { id }, data: allowed });
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.id === id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
