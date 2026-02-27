import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyVoteThreshold } from "@/lib/notify";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const existing = await prisma.vote.findUnique({
    where: { postId_userId: { postId: id, userId } },
  });

  if (existing) {
    // Toggle off
    await prisma.$transaction([
      prisma.vote.delete({ where: { postId_userId: { postId: id, userId } } }),
      prisma.post.update({
        where: { id },
        data: { voteCount: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ voted: false });
  } else {
    // Toggle on
    const [, updatedPost] = await prisma.$transaction([
      prisma.vote.create({ data: { postId: id, userId } }),
      prisma.post.update({
        where: { id },
        data: { voteCount: { increment: 1 } },
      }),
    ]);

    // Check vote threshold
    const settings = await prisma.notificationSettings.findUnique({ where: { id: "singleton" } });
    if (settings?.onVoteThreshold && settings.voteThreshold) {
      notifyVoteThreshold(updatedPost, settings.voteThreshold).catch(() => {});
    }

    return NextResponse.json({ voted: true });
  }
}
