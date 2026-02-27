import nodemailer from "nodemailer";
import { prisma } from "./db";

async function getSettings() {
  return prisma.notificationSettings.findUnique({ where: { id: "singleton" } });
}

async function sendDiscord(webhookUrl: string, content: string) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch {
    // silent — don't break the main flow
  }
}

async function sendEmail(
  settings: {
    smtpHost: string | null;
    smtpPort: number;
    smtpUser: string | null;
    smtpPass: string | null;
    emailFrom: string | null;
  },
  opts: { to: string; subject: string; html: string }
) {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) return;
  try {
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: { user: settings.smtpUser, pass: settings.smtpPass },
    });
    await transporter.sendMail({
      from: settings.emailFrom ?? settings.smtpUser,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch {
    // silent
  }
}

export async function notifyNewPost(post: {
  title: string;
  slug: string;
  author: { name: string | null };
}) {
  const s = await getSettings();
  if (!s || !s.onNewPost) return;

  const url = `${process.env.BETTER_AUTH_URL}/feedback/${post.slug}`;
  const text = `**New post**: [${post.title}](${url}) by **${post.author.name ?? "Anonymous"}**`;

  if (s.discordEnabled && s.discordWebhook) {
    await sendDiscord(s.discordWebhook, text);
  }
  if (s.emailEnabled && s.emailTo) {
    await sendEmail(s, {
      to: s.emailTo,
      subject: `New post: ${post.title}`,
      html: `<p>New post submitted by <strong>${post.author.name ?? "Anonymous"}</strong>:</p><p><a href="${url}">${post.title}</a></p>`,
    });
  }
}

export async function notifyStatusChange(
  post: { title: string; slug: string },
  newStatus: { name: string },
  authorEmail: string
) {
  const s = await getSettings();
  if (!s || !s.onStatusChange) return;
  if (!s.emailEnabled) return;

  const url = `${process.env.BETTER_AUTH_URL}/feedback/${post.slug}`;
  await sendEmail(s, {
    to: authorEmail,
    subject: `Your post status changed to "${newStatus.name}"`,
    html: `<p>Your post <a href="${url}"><strong>${post.title}</strong></a> has been updated to status <strong>${newStatus.name}</strong>.</p>`,
  });
}

export async function notifyNewComment(
  post: { title: string; slug: string },
  commenter: { name: string | null },
  authorEmail: string
) {
  const s = await getSettings();
  if (!s || !s.onNewComment) return;
  if (!s.emailEnabled) return;

  const url = `${process.env.BETTER_AUTH_URL}/feedback/${post.slug}`;
  await sendEmail(s, {
    to: authorEmail,
    subject: `New comment on your post "${post.title}"`,
    html: `<p><strong>${commenter.name ?? "Someone"}</strong> commented on your post <a href="${url}"><strong>${post.title}</strong></a>.</p>`,
  });
}

export async function notifyVoteThreshold(
  post: { title: string; slug: string; voteCount: number },
  threshold: number
) {
  const s = await getSettings();
  if (!s || !s.onVoteThreshold) return;
  if (post.voteCount !== threshold) return;

  const url = `${process.env.BETTER_AUTH_URL}/feedback/${post.slug}`;
  const text = `**Vote milestone** 🎉: [${post.title}](${url}) just reached **${threshold} votes**!`;

  if (s.discordEnabled && s.discordWebhook) {
    await sendDiscord(s.discordWebhook, text);
  }
  if (s.emailEnabled && s.emailTo) {
    await sendEmail(s, {
      to: s.emailTo,
      subject: `Post "${post.title}" reached ${threshold} votes`,
      html: `<p>The post <a href="${url}"><strong>${post.title}</strong></a> just reached <strong>${threshold} votes</strong>!</p>`,
    });
  }
}
