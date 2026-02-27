import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function Badge({ children, className, color }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        !color && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        className
      )}
      style={
        color
          ? { backgroundColor: `${color}20`, color: color }
          : undefined
      }
    >
      {children}
    </span>
  );
}

// Dumb badge: receives resolved label + color from the caller (server page or client component)
export function ChangelogCategoryBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return <Badge color={color}>{label}</Badge>;
}
