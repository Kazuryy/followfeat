import { prisma } from "@/lib/db";
import { SettingsForm } from "./settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

const defaults = {
  id: "singleton",
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

export default async function SettingsPage() {
  const settings =
    (await prisma.notificationSettings.findUnique({ where: { id: "singleton" } })) ?? defaults;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Settings
      </h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
