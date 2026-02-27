import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyNewComment } from "@/lib/notify";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: [{ isPinned: "desc" }, { createdAt: "asc" }],
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const [comment, post] = await Promise.all([
    prisma.comment.create({
      data: {
        content: content.trim(),
        postId: id,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.post.findUnique({
      where: { id },
      select: { title: true, slug: true, author: { select: { id: true, email: true } } },
    }),
  ]);

  if (post && post.author.id !== session.user.id) {
    notifyNewComment(post, comment.author, post.author.email).catch(() => {});
  }

  return NextResponse.json(comment, { status: 201 });
}
