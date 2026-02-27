"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangelogEditor } from "@/components/changelog/changelog-editor";
import { cn } from "@/lib/utils";

interface Category {
  value: string;
  label: string;
  color: string;
}

interface ChangelogFormProps {
  availableCategories: Category[];
  entryId?: string;
  initialData?: {
    title: string;
    content: string;
    categories: string[];
    featuredImage: string;
    state: "DRAFT" | "LIVE";
    publishedAt?: string;
  };
}

export function ChangelogForm({
  availableCategories,
  entryId,
  initialData,
}: ChangelogFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [categories, setCategories] = useState<string[]>(
    initialData?.categories ?? []
  );
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCategory = (val: string) => {
    setCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const handleSave = async (state: "DRAFT" | "LIVE") => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      title,
      content,
      categories,
      featuredImage: featuredImage.trim() || null,
      state,
      publishedAt: state === "LIVE" ? new Date().toISOString() : undefined,
    };

    const url = entryId ? `/api/changelog/${entryId}` : "/api/changelog";
    const method = entryId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/changelog");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's new?"
          className="text-base font-medium"
        />
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleCategory(cat.value)}
                style={
                  categories.includes(cat.value)
                    ? { backgroundColor: cat.color, borderColor: cat.color, color: "#fff" }
                    : { borderColor: cat.color + "40", color: cat.color }
                }
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-colors border"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured image */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Featured image URL
        </label>
        <Input
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>

      {/* Content editor */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Content
        </label>
        <ChangelogEditor content={content} onChange={setContent} />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSave("DRAFT")}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save draft"}
        </Button>
        <Button
          onClick={() => handleSave("LIVE")}
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}
