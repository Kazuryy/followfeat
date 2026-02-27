import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const boards = await prisma.board.findMany({
    orderBy: { position: "asc" },
  });
  return NextResponse.json(boards);
}
