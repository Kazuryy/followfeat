import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account suspended" };

export default function BannedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-2xl border border-red-200 bg-white p-12 dark:border-red-800/50 dark:bg-zinc-950">
        <p className="text-4xl">🚫</p>
        <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Account suspended
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Your account has been suspended. Contact the administrator if you think this is a mistake.
        </p>
      </div>
    </div>
  );
}
