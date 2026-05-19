import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { VideoCard }     from "@/components/VideoCard";
import { FollowButton }  from "@/components/FollowButton";
import { ReferralLink }  from "@/components/ReferralLink";
import { LiveDot }       from "@/components/LiveDot";
import { listVideosRepo } from "@/lib/repository";
import { usd }           from "@/lib/utils";

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const all     = await listVideosRepo("new");
  const videos  = all.filter((v) => v.creator.handle === handle);
  const creator = videos[0]?.creator;
  if (!creator) notFound();

  const totalEarned = videos.reduce((s, v) => s + v.totalEarned, 0);
  const totalWatch  = videos.reduce((s, v) => s + v.totalWatchSeconds, 0);
  const totalLive   = videos.reduce((s, v) => s + v.liveViewers, 0);

  // Accent colour derived from handle for personality
  const accentClass = handle.length % 3 === 0
    ? "from-teal-600/30 to-teal-900/10"
    : handle.length % 3 === 1
    ? "from-violet-600/30 to-violet-900/10"
    : "from-pink-600/30 to-pink-900/10";

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Banner + avatar ── */}
      <div className={`relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br ${accentClass} p-6 sm:p-10`}>
        {/* Decorative orb */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-500 text-2xl font-black text-white shadow-xl shadow-black/40 sm:h-24 sm:w-24">
            {creator.avatar}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{creator.name}</h1>
              {totalLive > 0 && <LiveDot count={totalLive} size="md" />}
            </div>
            <p className="font-mono text-sm text-zinc-500">@{creator.handle}</p>
            {creator.bio && <p className="max-w-xl text-sm text-zinc-400">{creator.bio}</p>}
          </div>

          <FollowButton handle={creator.handle} className="sm:self-start" />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total earned",    value: usd(totalEarned, 2),                  mono: true  },
          { label: "Watch time",      value: `${(totalWatch / 3600).toFixed(1)}h`, mono: true  },
          { label: "Clips",           value: videos.length.toString(),              mono: false },
          { label: "Wallet",          value: creator.walletAddress.slice(0, 12) + "…", mono: true },
        ].map(({ label, value, mono }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className="text-xs text-zinc-600">{label}</p>
            <p className={`mt-1 text-base font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Referral ── */}
      <ReferralLink handle={creator.handle} />

      {/* ── Wallet link ── */}
      <div className="flex items-center gap-2 text-xs text-zinc-700">
        <span className="font-mono">{creator.walletAddress}</span>
        <Link
          href={`https://explorer.arc.network/address/${creator.walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 transition hover:text-zinc-400"
        >
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* ── Video grid ── */}
      {videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      ) : (
        <p className="text-center py-12 text-zinc-600">No clips yet.</p>
      )}
    </div>
  );
}
