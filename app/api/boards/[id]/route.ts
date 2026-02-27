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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name, icon, color } = await req.json();
  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const board = await prisma.board.update({
    where: { id },
    data: { name: name.trim(), icon: icon?.trim() || null, color: color?.trim() || null },
  });

  return NextResponse.json(board);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const postCount = await prisma.post.count({ where: { boardId: id } });
  if (postCount > 0)
    return NextResponse.json(
      { error: `Cannot delete: ${postCount} post(s) are linked to this board.` },
      { status: 409 }
    );

  await prisma.board.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
