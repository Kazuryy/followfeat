import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { notifyNewPost } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const boardSlug = searchParams.get("board");
  const statusId = searchParams.get("status");
  const sort = searchParams.get("sort") ?? "trending";
  const q = searchParams.get("q");

  const where: Record<string, unknown> = {};

  if (boardSlug && boardSlug !== "all") {
    const board = await prisma.board.findUnique({ where: { slug: boardSlug } });
    if (board) where.boardId = board.id;
  }
  if (statusId) where.statusId = statusId;
  if (q) where.title = { contains: q };

  const orderBy =
    sort === "new"
      ? { createdAt: "desc" as const }
      : sort === "top"
        ? { voteCount: "desc" as const }
        : { voteCount: "desc" as const }; // trending: simplified as top for now

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, orderBy],
    include: {
      board: true,
      status: true,
      author: { select: { id: true, name: true, image: true, avatarColor: true } },
      tags: true,
      _count: { select: { comments: true, votes: true } },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, boardId, tagIds } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!boardId) {
    return NextResponse.json({ error: "Board is required" }, { status: 400 });
  }

  const defaultStatus = await prisma.status.findFirst({
    where: { type: "REVIEWING" },
    orderBy: { position: "asc" },
  });

  if (!defaultStatus) {
    return NextResponse.json(
      { error: "No status configured" },
      { status: 500 }
    );
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.post.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content?.trim() || null,
      slug,
      boardId,
      statusId: defaultStatus.id,
      authorId: session.user.id,
      ...(Array.isArray(tagIds) && tagIds.length > 0 && {
        tags: { connect: tagIds.map((id: string) => ({ id })) },
      }),
    },
    include: {
      board: true,
      status: true,
      author: { select: { id: true, name: true, image: true, avatarColor: true } },
      tags: true,
      _count: { select: { comments: true, votes: true } },
    },
  });

  notifyNewPost(post).catch(() => {});

  logger.info("post.created", {
    postId: post.id,
    slug: post.slug,
    title: post.title,
    userId: session.user.id,
    boardId,
  });

  return NextResponse.json(post, { status: 201 });
}
