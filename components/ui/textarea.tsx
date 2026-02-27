import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors resize-none",
          "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600",
          "dark:focus:ring-zinc-300",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
