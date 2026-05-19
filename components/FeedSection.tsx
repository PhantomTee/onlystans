"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { WatchHistory } from "@/components/WatchHistory";
import { getFollows } from "@/lib/localStorage";
import type { Video } from "@/types";

const TABS = ["trending", "new", "cheapest", "following"] as const;
type Tab = (typeof TABS)[number];

function sort(videos: Video[], tab: Exclude<Tab, "following">): Video[] {
  const arr = [...videos];
  if (tab === "new")      return arr.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (tab === "cheapest") return arr.sort((a, b) => a.ratePerSecond - b.ratePerSecond);
  return arr.sort((a, b) => (b.liveViewers + b.totalWatchSeconds / 10_000) - (a.liveViewers + a.totalWatchSeconds / 10_000));
}

interface FeedSectionProps {
  videos: Video[];
}

export function FeedSection({ videos }: FeedSectionProps) {
  const [tab,     setTab]     = useState<Tab>("trending");
  const [query,   setQuery]   = useState("");
  const [selTag,  setSelTag]  = useState("");
  const [follows, setFollows] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFollows(getFollows()); }, []);

  // Collect all unique tags
  const allTags = useMemo(
    () => Array.from(new Set(videos.flatMap((v) => v.tags))).sort(),
    [videos],
  );

  const filtered = useMemo(() => {
    let list = tab === "following"
      ? videos.filter((v) => follows.includes(v.creator.handle))
      : sort(videos, tab as Exclude<Tab, "following">);

    if (selTag)  list = list.filter((v) => v.tags.includes(selTag));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.creator.handle.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [videos, tab, query, selTag, follows]);

  return (
    <div className="space-y-6">
      {/* Watch history */}
      <WatchHistory />

      {/* Tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelTag(""); }}
              className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                tab === t
                  ? "bg-white/[0.09] text-white shadow-inner"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clips, creators, tags…"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-9 text-sm text-zinc-200 placeholder-zinc-600 outline-none ring-teal-400/25 transition focus:ring-2"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelTag(selTag === tag ? "" : tag)}
            className={`rounded-lg px-2.5 py-1 text-xs transition ${
              selTag === tag
                ? "bg-teal-400/20 text-teal-300 border border-teal-400/40"
                : "border border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => <VideoCard key={v.id} video={v} />)}
        </section>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-4xl">🎬</p>
          <p className="text-zinc-400">
            {tab === "following" && follows.length === 0
              ? "Follow some creators to build your personalised feed."
              : "No clips match — try a different search or tag."}
          </p>
          {(query || selTag) && (
            <button onClick={() => { setQuery(""); setSelTag(""); }} className="text-sm text-teal-400 hover:text-teal-300">
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
