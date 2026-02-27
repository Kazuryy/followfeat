"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { RoadmapColumn } from "./roadmap-column";
import { useSession } from "@/lib/auth-client";

interface PostCard {
  id: string;
  title: string;
  slug: string;
  statusId: string;
  isPinned: boolean;
  voteCount: number;
  tags: { id: string; name: string; color: string | null }[];
  content: string | null;
  board: { id: string; name: string; icon: string | null } | null;
  _count: { comments: number };
}

interface Status {
  id: string;
  name: string;
  color: string;
  type: string;
}

interface RoadmapBoardProps {
  initialPosts: PostCard[];
  statuses: Status[];
}

export function RoadmapBoard({ initialPosts, statuses }: RoadmapBoardProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const [posts, setPosts] = useState(initialPosts);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !isAdmin) return;

    const postId = active.id as string;
    const overId = over.id as string;

    // over.id is either a status ID (column droppable) or a post ID (card droppable)
    const isStatus = statuses.some((s) => s.id === overId);
    const targetStatusId = isStatus
      ? overId
      : posts.find((p) => p.id === overId)?.statusId;

    if (!targetStatusId) return;

    const post = posts.find((p) => p.id === postId);
    if (!post || post.statusId === targetStatusId) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, statusId: targetStatusId } : p
      )
    );

    // API call
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId: targetStatusId }),
    });

    if (!res.ok) {
      // Revert on error
      setPosts(initialPosts);
    }
  };

  const activePost = posts.find((p) => p.id === activeId);

  // Only show meaningful roadmap statuses (exclude CANCELED)
  const roadmapStatuses = statuses.filter((s) => s.type !== "CANCELED");

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="-mx-4 sm:mx-0 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 px-4 sm:px-0">
          {roadmapStatuses.map((status) => {
            const columnPosts = posts.filter((p) => p.statusId === status.id);
            return (
              <RoadmapColumn
                key={status.id}
                id={status.id}
                name={status.name}
                color={status.color}
                cards={columnPosts}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activePost && (
          <div className="w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2">
              {activePost.isPinned && <span className="mr-1">📌</span>}
              {activePost.title}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
