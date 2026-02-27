import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if ((session.user as { role?: string }).role !== "admin") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { label, color } = await req.json();
  if (!label?.trim())
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  if (!color?.trim())
    return NextResponse.json({ error: "Color is required" }, { status: 400 });

  const category = await prisma.changelogCategory.update({
    where: { id },
    data: { label: label.trim(), color: color.trim() },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.changelogCategory.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
