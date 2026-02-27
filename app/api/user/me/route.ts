import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { avatarColor } = await req.json();

  if (avatarColor !== null && !HEX_RE.test(avatarColor)) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarColor: avatarColor ?? null },
    select: { id: true, avatarColor: true },
  });

  return NextResponse.json(user);
}
