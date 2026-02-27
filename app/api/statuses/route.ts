import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const statuses = await prisma.status.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(statuses);
}
