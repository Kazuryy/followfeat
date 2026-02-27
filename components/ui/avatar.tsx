"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export const AVATAR_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#f97316", // orange
  "#14b8a6", // teal
];

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: number;
  color?: string | null;
  className?: string;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getFallbackColor(name?: string | null): string {
  if (!name) return AVATAR_COLORS[0];
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function Initials({
  name,
  size,
  color,
  className,
}: {
  name?: string | null;
  size: number;
  color?: string | null;
  className?: string;
}) {
  const bg = color ?? getFallbackColor(name);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white font-medium shrink-0",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.375, backgroundColor: bg }}
    >
      {getInitials(name)}
    </span>
  );
}

export function Avatar({ name, image, size = 32, color, className }: AvatarProps) {
  const [error, setError] = useState(false);

  if (image && !error) {
    return (
      // Use a plain <img> so Next.js doesn't try to proxy/optimize the image
      // server-side — this way failures are silent client-side fallbacks.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ?? ""}
        width={size}
        height={size}
        className={cn("rounded-full object-cover shrink-0", className)}
        style={{ width: size, height: size }}
        onError={() => setError(true)}
      />
    );
  }

  return <Initials name={name} size={size} color={color} className={className} />;
}
