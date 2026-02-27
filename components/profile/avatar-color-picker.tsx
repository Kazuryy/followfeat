"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AVATAR_COLORS } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarColorPickerProps {
  name: string | null;
  currentColor: string | null;
}

export function AvatarColorPicker({ name, currentColor }: AvatarColorPickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(currentColor);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (color: string) => {
    const next = selected === color ? null : color;
    setSelected(next);
    setSaving(true);
    await fetch("/api/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarColor: next }),
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <Avatar name={name} color={selected} size={40} />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {saving ? "Saving…" : "Choose a color"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handleSelect(color)}
            title={color}
            className={cn(
              "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
              selected === color
                ? "border-zinc-900 dark:border-zinc-50 scale-110"
                : "border-transparent"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
