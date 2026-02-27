import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entry = await prisma.changelogEntry.findUnique({
    where: { slug: id },
  });

  if (!entry || entry.state !== "LIVE") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...entry,
    categories: JSON.parse(entry.categories),
  });
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
  const { title, content, categories, featuredImage, state, publishedAt } =
    body;

  const current = await prisma.changelogEntry.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isPublishing =
    state === "LIVE" && current.state === "DRAFT";

  const entry = await prisma.changelogEntry.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content }),
      ...(categories !== undefined && {
        categories: JSON.stringify(categories),
      }),
      ...(featuredImage !== undefined && {
        featuredImage: featuredImage || null,
      }),
      ...(state !== undefined && { state }),
      ...(isPublishing && {
        publishedAt: new Date(publishedAt ?? Date.now()),
      }),
    },
  });

  return NextResponse.json({
    ...entry,
    categories: JSON.parse(entry.categories),
  });
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

  await prisma.changelogEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
