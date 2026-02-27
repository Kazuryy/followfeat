import { cn } from "@/lib/utils";
import { CHANGELOG_CATEGORIES } from "@/lib/changelog-categories";

const CATEGORY_STYLES: Record<string, string> = {
  NEW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  IMPROVED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  FIXED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  BETA: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

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
          ? {
              backgroundColor: `${color}20`,
              color: color,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

const changelogCategoryConfig: Record<string, { label: string; className: string }> =
  Object.fromEntries(
    CHANGELOG_CATEGORIES.map((c) => [
      c.value,
      { label: c.label, className: CATEGORY_STYLES[c.value] ?? "" },
    ])
  );

export function ChangelogCategoryBadge({ category }: { category: string }) {
  const config = changelogCategoryConfig[category] ?? {
    label: category,
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
