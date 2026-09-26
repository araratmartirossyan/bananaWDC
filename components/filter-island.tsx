"use client";

import { useState } from "react";

export interface PickerItem {
  id: string;
  name: string;
}

function itemAccent(id: string): string {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `hsl(${hash % 360} 42% 32%)`;
}

const GridIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
    />
  </svg>
);

interface PickerIslandProps {
  title: string;
  items: PickerItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PickerIsland({
  title,
  items,
  selectedId,
  onSelect,
}: PickerIslandProps) {
  const [open, setOpen] = useState(false);
  const current = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <div
      className="w-full max-w-lg mx-auto touch-auto"
      onTouchStart={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="rounded-[28px] bg-black/40 backdrop-blur-xl border border-white/15 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3"
        >
          <span className="flex items-center gap-2 text-white font-mono text-sm">
            <GridIcon className="w-4 h-4" />
            {title}
          </span>
          <span className="text-yellow-400 font-mono text-sm truncate">
            {current?.name ?? title}
          </span>
        </button>

        {open && (
          <div className="px-3 pb-3 max-h-[36vh] overflow-y-auto overscroll-contain">
            <div className="grid grid-cols-4 gap-2">
              {items.map((item) => {
                const selected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.id);
                      setOpen(false);
                    }}
                    className={`aspect-square rounded-2xl flex items-center justify-center p-1.5 transition-all ${
                      selected
                        ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-black/40"
                        : "ring-1 ring-white/10"
                    }`}
                    style={{ background: itemAccent(item.id) }}
                  >
                    <span
                      className={`font-mono text-[10px] sm:text-xs leading-tight text-center line-clamp-3 ${
                        selected ? "text-yellow-300" : "text-white"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
