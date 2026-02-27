"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Settings {
  id: string;
  emailEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPass: string | null;
  emailFrom: string | null;
  emailTo: string | null;
  discordEnabled: boolean;
  discordWebhook: string | null;
  onNewPost: boolean;
  onStatusChange: boolean;
  onNewComment: boolean;
  onVoteThreshold: boolean;
  voteThreshold: number;
}

interface SettingsFormProps {
  settings: Settings;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors ${checked ? "bg-zinc-900 dark:bg-zinc-50" : "bg-zinc-200 dark:bg-zinc-700"}`}
        />
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform dark:bg-zinc-900 ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

export function SettingsForm({ settings: initial }: SettingsFormProps) {
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Email */}
      <Section title="Email (SMTP)">
        <Toggle
          label="Enable email notifications"
          checked={s.emailEnabled}
          onChange={(v) => set("emailEnabled", v)}
        />
        {s.emailEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="SMTP Host">
              <Input
                value={s.smtpHost ?? ""}
                onChange={(e) => set("smtpHost", e.target.value || null)}
                placeholder="smtp.example.com"
              />
            </Field>
            <Field label="SMTP Port">
              <Input
                type="number"
                value={s.smtpPort}
                onChange={(e) => set("smtpPort", parseInt(e.target.value) || 587)}
                placeholder="587"
              />
            </Field>
            <Field label="SMTP User">
              <Input
                value={s.smtpUser ?? ""}
                onChange={(e) => set("smtpUser", e.target.value || null)}
                placeholder="user@example.com"
              />
            </Field>
            <Field label="SMTP Password">
              <Input
                type="password"
                value={s.smtpPass ?? ""}
                onChange={(e) => set("smtpPass", e.target.value || null)}
                placeholder="••••••••"
              />
            </Field>
            <Field label="From address">
              <Input
                value={s.emailFrom ?? ""}
                onChange={(e) => set("emailFrom", e.target.value || null)}
                placeholder="FollowFeat <noreply@example.com>"
              />
            </Field>
            <Field label="Admin email(s) to notify">
              <Input
                value={s.emailTo ?? ""}
                onChange={(e) => set("emailTo", e.target.value || null)}
                placeholder="admin@example.com, team@example.com"
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Discord */}
      <Section title="Discord">
        <Toggle
          label="Enable Discord notifications"
          checked={s.discordEnabled}
          onChange={(v) => set("discordEnabled", v)}
        />
        {s.discordEnabled && (
          <Field label="Webhook URL">
            <Input
              value={s.discordWebhook ?? ""}
              onChange={(e) => set("discordWebhook", e.target.value || null)}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </Field>
        )}
      </Section>

      {/* Events */}
      <Section title="Events">
        <Toggle
          label="New post submitted"
          description="Notify admins when a user submits a new feature request"
          checked={s.onNewPost}
          onChange={(v) => set("onNewPost", v)}
        />
        <Toggle
          label="Post status changed"
          description="Notify the post author when an admin updates their post status"
          checked={s.onStatusChange}
          onChange={(v) => set("onStatusChange", v)}
        />
        <Toggle
          label="New comment"
          description="Notify the post author when someone comments on their post"
          checked={s.onNewComment}
          onChange={(v) => set("onNewComment", v)}
        />
        <div className="flex flex-col gap-2">
          <Toggle
            label="Vote threshold reached"
            description="Notify admins when a post hits a vote milestone"
            checked={s.onVoteThreshold}
            onChange={(v) => set("onVoteThreshold", v)}
          />
          {s.onVoteThreshold && (
            <div className="ml-12">
              <Field label="Vote threshold">
                <Input
                  type="number"
                  value={s.voteThreshold}
                  onChange={(e) => set("voteThreshold", parseInt(e.target.value) || 10)}
                  className="w-28"
                />
              </Field>
            </div>
          )}
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved!</span>
        )}
      </div>
    </div>
  );
}
