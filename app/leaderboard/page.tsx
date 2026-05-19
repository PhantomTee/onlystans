import Link from "next/link";
import { Medal, TrendingUp, Eye } from "lucide-react";
import { listVideosRepo } from "@/lib/repository";
import { usd } from "@/lib/utils";
import { LiveDot } from "@/components/LiveDot";

export default async function LeaderboardPage() {
  const videos = await listVideosRepo("trending");

  const topEarners  = [...videos].sort((a, b) => b.totalEarned  - a.totalEarned).slice(0, 10);
  const mostWatched = [...videos].sort((a, b) => b.totalWatchSeconds - a.totalWatchSeconds).slice(0, 10);
  const rising      = [...videos].sort((a, b) => b.liveViewers  - a.liveViewers).slice(0, 10);

  // Deduplicate creators for top-creator list
  const creatorMap = new Map<string, { name: string; handle: string; earned: number; avatar: string }>();
  for (const v of videos) {
    const prev = creatorMap.get(v.creator.handle);
    creatorMap.set(v.creator.handle, {
      name:   v.creator.name,
      handle: v.creator.handle,
      avatar: v.creator.avatar,
      earned: (prev?.earned ?? 0) + v.totalEarned,
    });
  }
  const topCreators = [...creatorMap.values()].sort((a, b) => b.earned - a.earned).slice(0, 5);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400">Platform Stats</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Leaderboard</h1>
        <p className="mt-1 text-zinc-500">Top earners, most-watched clips, and rising creators.</p>
      </div>

      {/* Top creators */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-400">
          <Medal className="h-4 w-4 text-amber-400" /> Top Creators
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {topCreators.map((creator, i) => (
            <Link
              key={creator.handle}
              href={`/creator/${creator.handle}`}
              className="glass group flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition hover:-translate-y-0.5 hover:border-violet-400/30"
            >
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 text-xl font-bold text-white shadow-lg">
                  {creator.avatar}
                </div>
                {i < 3 && (
                  <span className="absolute -right-1 -top-1 text-base">{medals[i]}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-white transition group-hover:text-violet-300">{creator.name}</p>
                <p className="text-xs text-zinc-600">@{creator.handle}</p>
              </div>
              <p className="font-mono text-sm text-teal-300">{usd(creator.earned, 2)}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Top earners */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <TrendingUp className="h-4 w-4 text-teal-400" /> Top Earning Clips
          </h2>
          <div className="glass rounded-2xl overflow-hidden">
            {topEarners.map((v, i) => (
              <Link
                key={v.id}
                href={`/watch/${v.id}`}
                className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 transition last:border-0 hover:bg-white/[0.04]"
              >
                <span className="w-5 shrink-0 font-mono text-xs text-zinc-700">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">{v.title}</p>
                  <p className="text-[11px] text-zinc-600">@{v.creator.handle}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-teal-300">{usd(v.totalEarned, 2)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Most watched */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <Eye className="h-4 w-4 text-violet-400" /> Most Watched
          </h2>
          <div className="glass rounded-2xl overflow-hidden">
            {mostWatched.map((v, i) => (
              <Link
                key={v.id}
                href={`/watch/${v.id}`}
                className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 transition last:border-0 hover:bg-white/[0.04]"
              >
                <span className="w-5 shrink-0 font-mono text-xs text-zinc-700">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">{v.title}</p>
                  <p className="text-[11px] text-zinc-600">@{v.creator.handle}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-zinc-500">
                  {(v.totalWatchSeconds / 3600).toFixed(1)}h
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Rising (live viewers) */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <span className="h-4 w-4 grid place-items-center"><LiveDot size="sm" /></span>
            Watching Now
          </h2>
          <div className="glass rounded-2xl overflow-hidden">
            {rising.map((v, i) => (
              <Link
                key={v.id}
                href={`/watch/${v.id}`}
                className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 transition last:border-0 hover:bg-white/[0.04]"
              >
                <span className="w-5 shrink-0 font-mono text-xs text-zinc-700">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">{v.title}</p>
                  <p className="text-[11px] text-zinc-600">@{v.creator.handle}</p>
                </div>
                <LiveDot count={v.liveViewers} size="sm" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
