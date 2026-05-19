"use client";

import type { Chapter } from "@/types";
import { formatDuration } from "@/lib/utils";

interface VideoChaptersProps {
  chapters: Chapter[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function VideoChapters({ chapters, duration, currentTime, onSeek }: VideoChaptersProps) {
  if (!chapters.length) return null;
  const safeD = duration || 1;
  const active = [...chapters].reverse().find((c) => currentTime >= c.time) ?? chapters[0];

  return (
    <div className="space-y-2">
      {/* Chapter marker bar */}
      <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full bg-teal-400 transition-all duration-300"
          style={{ width: `${(currentTime / safeD) * 100}%` }}
        />
        {chapters.map((ch) => (
          <button
            key={ch.time}
            onClick={() => onSeek(ch.time)}
            title={ch.title}
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-white/60 hover:bg-white transition"
            style={{ left: `${(ch.time / safeD) * 100}%` }}
          />
        ))}
      </div>

      {/* Chapter list */}
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
        {chapters.map((ch) => (
          <button
            key={ch.time}
            onClick={() => onSeek(ch.time)}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
              active === ch
                ? "bg-teal-400/15 text-teal-300"
                : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
            }`}
          >
            <span className="font-mono tabular-nums">{formatDuration(ch.time)}</span>
            <span className="truncate">{ch.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
