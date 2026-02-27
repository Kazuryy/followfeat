import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
          "dark:focus:ring-zinc-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
