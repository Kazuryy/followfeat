import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare, ChevronUp } from "lucide-react";

interface PostCard {
  id: string;
  title: string;
  slug: string;
  isPinned: boolean;
  voteCount: number;
  tags: { id: string; name: string; color: string | null }[];
  content: string | null;
  board: { id: string; name: string; icon: string | null } | null;
  _count: { comments: number };
}

interface SortableCardProps {
  card: PostCard;
}

function SortableCard({ card }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-3 cursor-grab active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-950",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <Link
        href={`/feedback/${card.slug}`}
        onClick={(e) => e.stopPropagation()}
        className="block"
      >
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 line-clamp-2">
          {card.isPinned && <span className="mr-1">📌</span>}
          {card.title}
        </p>
      </Link>
      {card.content && (
        <p className="mt-1 text-[11px] text-zinc-400 line-clamp-1 dark:text-zinc-500">
          {card.content}
        </p>
      )}
      {card.board && (
        <div className="mt-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {card.board.icon && <span>{card.board.icon}</span>}
            {card.board.name}
          </span>
        </div>
      )}
      {card.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={
                tag.color
                  ? { backgroundColor: tag.color + "22", color: tag.color }
                  : { backgroundColor: "rgb(244 244 245)", color: "rgb(82 82 91)" }
              }
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-0.5">
          <ChevronUp size={12} />
          {card.voteCount}
        </span>
        <span className="flex items-center gap-0.5">
          <MessageSquare size={12} />
          {card._count.comments}
        </span>
      </div>
    </div>
  );
}

interface RoadmapColumnProps {
  id: string;
  name: string;
  color: string;
  cards: PostCard[];
}

export function RoadmapColumn({ id, name, color, cards }: RoadmapColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {name}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {cards.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-colors",
          isOver
            ? "bg-zinc-100 dark:bg-zinc-900"
            : "bg-zinc-50 dark:bg-zinc-900/50"
        )}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="flex items-center justify-center py-6 text-xs text-zinc-400 dark:text-zinc-600">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}
