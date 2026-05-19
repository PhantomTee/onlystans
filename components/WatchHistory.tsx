"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { getHistory } from "@/lib/localStorage";
import type { HistoryEntry } from "@/types";

export function WatchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (!history.length) return null;

  return (
    <section className="animate-slide-up">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-500" />
        <h2 className="text-sm font-semibold text-zinc-400">Continue watching</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {history.slice(0, 10).map((entry) => (
          <Link
            key={entry.videoId}
            href={`/watch/${entry.videoId}`}
            className="group relative shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-zinc-900/60 transition hover:-translate-y-0.5 hover:border-teal-400/30"
            style={{ width: 160 }}
          >
            <div
              className="aspect-video w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${entry.thumbnailSrc})` }}
            />
            <div className="p-2">
              <p className="line-clamp-1 text-xs font-medium text-zinc-200">{entry.title}</p>
              <p className="text-[10px] text-zinc-600">@{entry.handle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
