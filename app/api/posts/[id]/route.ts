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
      author: { select: { id: true, name: true, image: true, avatarColor: true } },
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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as { role?: string }).role === "admin";
  const body = await req.json();
  const { statusId, isPinned, tagIds, title, content, eta } = body;

  // Always fetch existing to check authorship and detect status change
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { statusId: true, authorId: true, author: { select: { email: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAuthor = existing.authorId === session.user.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = isAdmin
    ? {
        ...(statusId !== undefined && { statusId }),
        ...(isPinned !== undefined && { isPinned }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(eta !== undefined && { eta: eta ? new Date(eta) : null }),
        ...(tagIds !== undefined && {
          tags: { set: tagIds.map((tid: string) => ({ id: tid })) },
        }),
      }
    : {
        // Authors can only edit content fields, not status/admin fields
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tagIds !== undefined && {
          tags: { set: tagIds.map((tid: string) => ({ id: tid })) },
        }),
      };

  const post = await prisma.post.update({
    where: { id },
    data,
    include: {
      board: true,
      status: true,
      author: { select: { id: true, name: true, image: true, avatarColor: true } },
      tags: true,
    },
  });

  if (isAdmin && statusId && existing.statusId !== statusId) {
    notifyStatusChange(post, post.status, existing.author.email).catch(() => {});
    logger.info("post.status_changed", {
      postId: id,
      fromStatusId: existing.statusId,
      toStatusId: statusId,
      statusName: post.status?.name,
      adminId: session.user.id,
    });
  }

  if (isAdmin && isPinned !== undefined) {
    logger.info("post.pin_toggled", { postId: id, isPinned, adminId: session.user.id });
  }

  if (!isAdmin && isAuthor) {
    logger.info("post.edited", { postId: id, userId: session.user.id });
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
