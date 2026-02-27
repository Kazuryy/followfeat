import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyStatusChange } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { slug: id },
    include: {
      board: true,
      status: true,
      author: { select: { id: true, name: true, image: true } },
      tags: true,
      _count: { select: { comments: true, votes: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { statusId, isPinned, tagIds, title, content, eta } = body;

  // Fetch current post to detect status change and get author email
  const existing = statusId !== undefined
    ? await prisma.post.findUnique({
        where: { id },
        select: { statusId: true, author: { select: { email: true } } },
      })
    : null;

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(statusId !== undefined && { statusId }),
      ...(isPinned !== undefined && { isPinned }),
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(eta !== undefined && { eta: eta ? new Date(eta) : null }),
      ...(tagIds !== undefined && {
        tags: { set: tagIds.map((tid: string) => ({ id: tid })) },
      }),
    },
    include: {
      board: true,
      status: true,
      author: { select: { id: true, name: true, image: true } },
      tags: true,
    },
  });

  if (existing && statusId && existing.statusId !== statusId) {
    notifyStatusChange(post, post.status, existing.author.email).catch(() => {});
    logger.info("post.status_changed", {
      postId: id,
      fromStatusId: existing.statusId,
      toStatusId: statusId,
      statusName: post.status?.name,
      adminId: session.user.id,
    });
  }

  if (isPinned !== undefined) {
    logger.info("post.pin_toggled", { postId: id, isPinned, adminId: session.user.id });
  }

  return NextResponse.json(post);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  logger.warn("post.deleted", { postId: id, adminId: session.user.id });
  return NextResponse.json({ success: true });
}
