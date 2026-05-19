import Link from "next/link";
import { Play } from "lucide-react";
import type { Video } from "@/types";
import { ratePerMinute, usd } from "@/lib/utils";
import { LiveDot } from "@/components/LiveDot";

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/30 hover:shadow-teal-950/30"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        <div
          className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${video.thumbnailSrc})` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white/90 shadow-xl shadow-black/40 transition group-hover:scale-110">
            <Play className="h-5 w-5 translate-x-0.5 fill-zinc-950 text-zinc-950" />
          </div>
        </div>

        {/* Rate badge */}
        <span className="absolute right-2.5 top-2.5 rounded-lg bg-teal-400/90 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-950 shadow-lg backdrop-blur-sm">
          {usd(ratePerMinute(video.ratePerSecond), 6)}/min
        </span>

        {/* NFT-gated badge */}
        {video.nftGated && (
          <span className="absolute left-2.5 top-2.5 rounded-lg border border-violet-400/40 bg-violet-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-300 backdrop-blur-sm">
            NFT
          </span>
        )}

        {/* Live viewers overlay on hover */}
        {video.liveViewers > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <LiveDot count={video.liveViewers} size="sm" />
            <span className="text-xs text-zinc-300">live</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2.5 p-3.5">
        <div>
          <h2 className="line-clamp-1 text-sm font-semibold text-white">{video.title}</h2>
          <p className="mt-0.5 text-xs text-zinc-500">@{video.creator.handle}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
          {video.liveViewers > 0 ? (
            <LiveDot count={video.liveViewers} size="sm" />
          ) : (
            <span className="font-mono text-[10px] text-zinc-600">
              {(video.totalWatchSeconds / 3600).toFixed(1)}h watched
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
