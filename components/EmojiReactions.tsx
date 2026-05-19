"use client";

import { useCallback, useRef, useState } from "react";

const EMOJIS = ["🔥", "💸", "❤️", "🎉", "👏", "⚡"] as const;

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
}

export function EmojiReactions() {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const counterRef = useRef(0);

  const burst = useCallback((emoji: string) => {
    const id = ++counterRef.current;
    const x = 30 + Math.random() * 40; // % from left
    setFloating((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloating((prev) => prev.filter((e) => e.id !== id));
    }, 1350);
  }, []);

  return (
    <div className="relative select-none">
      {/* Floating emojis */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floating.map(({ id, emoji, x }) => (
          <span
            key={id}
            className="absolute bottom-0 animate-float-emoji text-2xl"
            style={{ left: `${x}%` }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Reaction buttons */}
      <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1.5">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => burst(emoji)}
            className="rounded-lg px-2.5 py-1.5 text-lg transition hover:scale-125 hover:bg-white/[0.08] active:scale-95"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
