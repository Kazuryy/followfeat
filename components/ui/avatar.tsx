"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: number;
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

function getColor(name?: string | null): string {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-indigo-500",
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function Initials({ name, size, className }: { name?: string | null; size: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white font-medium shrink-0",
        getColor(name),
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.375 }}
    >
      {getInitials(name)}
    </span>
  );
}

export function Avatar({ name, image, size = 32, className }: AvatarProps) {
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

  return <Initials name={name} size={size} className={className} />;
}
