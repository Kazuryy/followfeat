import { NextResponse } from "next/server";
import { CHANGELOG_CATEGORIES } from "@/lib/changelog-categories";

/**
 * GET /api/v1/changelog/categories
 * Returns the list of available changelog category badges.
 * No authentication required.
 */
export function GET() {
  return NextResponse.json(CHANGELOG_CATEGORIES);
}
