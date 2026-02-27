import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/v1/changelog/categories
 * Returns the list of available changelog categories from the database.
 * No authentication required.
 */
export async function GET() {
  const categories = await prisma.changelogCategory.findMany({
    orderBy: { position: "asc" },
    select: { value: true, label: true, color: true },
  });
  return NextResponse.json(categories);
}
