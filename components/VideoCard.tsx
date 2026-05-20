import Link from "next/link";
import { Crown, Play } from "lucide-react";
import type { Video } from "@/types";
import { ratePerMinute, usd } from "@/lib/utils";
import { LiveDot } from "@/components/LiveDot";

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.025)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,107,0,0.25)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 40px rgba(255,107,0,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 20px rgba(0,0,0,0.4)";
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-zinc-900/60">
        <div
          className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${video.thumbnailSrc})` }}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100">
          <div className="grid h-13 w-13 place-items-center rounded-full bg-white shadow-2xl shadow-black/60 transition-transform duration-200 group-hover:scale-110">
            <Play className="h-5 w-5 translate-x-0.5 fill-zinc-950 text-zinc-950" />
          </div>
        </div>

        {/* Rate badge */}
        <span className="absolute right-2.5 top-2.5 rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-lg"
          style={{ background: "rgba(255,107,0,0.90)", backdropFilter: "blur(8px)" }}>
          {usd(ratePerMinute(video.ratePerSecond), 6)}/min
        </span>

        {/* Paid creator badge */}
        {video.creator.isPaidTier && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-lg border border-violet-400/40 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-300"
            style={{ background: "rgba(139,92,246,0.25)", backdropFilter: "blur(8px)" }}>
            <Crown className="h-2.5 w-2.5" /> Sub
          </span>
        )}

        {/* Live */}
        {video.liveViewers > 0 && (
          <div className="absolute bottom-2.5 left-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <LiveDot count={video.liveViewers} size="sm" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2.5 p-4">
        <div>
          <h2 className="line-clamp-1 text-sm font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-syne)" }}>
            {video.title}
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>@{video.creator.handle}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-md px-1.5 py-0.5 text-[10px]"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}>
                #{tag}
              </span>
            ))}
          </div>
          {video.liveViewers > 0 ? (
            <LiveDot count={video.liveViewers} size="sm" />
          ) : (
            <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              {(video.totalWatchSeconds / 3600).toFixed(1)}h watched
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
