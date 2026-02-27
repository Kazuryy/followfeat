import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as { role?: string }).role !== "admin") return null;
  return session;
}

const defaults = {
  emailEnabled: false,
  smtpHost: null,
  smtpPort: 587,
  smtpUser: null,
  smtpPass: null,
  emailFrom: null,
  emailTo: null,
  discordEnabled: false,
  discordWebhook: null,
  onNewPost: true,
  onStatusChange: true,
  onNewComment: false,
  onVoteThreshold: false,
  voteThreshold: 10,
};

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await prisma.notificationSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings ?? { id: "singleton", ...defaults });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const settings = await prisma.notificationSettings.upsert({
    where: { id: "singleton" },
    update: body,
    create: { id: "singleton", ...defaults, ...body },
  });
  return NextResponse.json(settings);
}
