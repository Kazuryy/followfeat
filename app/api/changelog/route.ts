import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const includesDrafts = searchParams.get("drafts") === "true";

  const entries = await prisma.changelogEntry.findMany({
    where: includesDrafts ? {} : { state: "LIVE" },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json(
    entries.map((e: (typeof entries)[number]) => ({
      ...e,
      categories: JSON.parse(e.categories),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, categories, featuredImage, state, publishedAt } =
    body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 0;
  while (
    await prisma.changelogEntry.findUnique({ where: { slug } })
  ) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const entry = await prisma.changelogEntry.create({
    data: {
      title: title.trim(),
      slug,
      content: content ?? "",
      categories: JSON.stringify(categories ?? []),
      featuredImage: featuredImage || null,
      state: state === "LIVE" ? "LIVE" : "DRAFT",
      publishedAt:
        state === "LIVE" ? new Date(publishedAt ?? Date.now()) : null,
    },
  });

  return NextResponse.json(
    { ...entry, categories: JSON.parse(entry.categories) },
    { status: 201 }
  );
}
