import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-key";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * POST /api/v1/changelog
 *
 * Headers:
 *   Authorization: Bearer <api_key>
 *
 * Body:
 * {
 *   title: string
 *   content: string          // HTML
 *   slug?: string            // auto-generated from title if omitted
 *   categories?: string[]    // e.g. ["New", "Fixed"]
 *   featuredImage?: string   // URL
 *   publishedAt?: string     // ISO date, defaults to now
 *   state?: "LIVE" | "DRAFT" // defaults to "LIVE"
 * }
 */
export async function POST(req: NextRequest) {
  const apiKey = await validateApiKey(req.headers.get("Authorization"));
  if (!apiKey) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, categories, featuredImage, publishedAt, state } = body as {
    title?: string;
    content?: string;
    slug?: string;
    categories?: string[];
    featuredImage?: string;
    publishedAt?: string;
    state?: "LIVE" | "DRAFT";
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Build slug — ensure uniqueness
  let baseSlug = (body.slug as string | undefined)?.trim()
    ? slugify(body.slug as string)
    : slugify(title);

  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.changelogEntry.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const entry = await prisma.changelogEntry.create({
    data: {
      title: title.trim(),
      slug,
      content: content.trim(),
      categories: JSON.stringify(Array.isArray(categories) ? categories : []),
      featuredImage: featuredImage ?? null,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      state: state === "DRAFT" ? "DRAFT" : "LIVE",
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
