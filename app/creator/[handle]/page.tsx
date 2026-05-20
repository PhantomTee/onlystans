import { notFound } from "next/navigation";
import Link from "next/link";
import { Crown, ExternalLink, Users } from "lucide-react";
import { VideoCard }           from "@/components/VideoCard";
import { FollowButton }        from "@/components/FollowButton";
import { ReferralLink }        from "@/components/ReferralLink";
import { SubscribeButton }     from "@/components/SubscribeButton";
import { LiveDot }             from "@/components/LiveDot";
import { listVideosRepo, getFollowerCountRepo } from "@/lib/repository";
import { usd }                 from "@/lib/utils";

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const all        = await listVideosRepo("new");
  const videos     = all.filter((v) => v.creator.handle === handle);
  const creator    = videos[0]?.creator;
  if (!creator) notFound();

  const totalEarned   = videos.reduce((s, v) => s + v.totalEarned, 0);
  const totalWatch    = videos.reduce((s, v) => s + v.totalWatchSeconds, 0);
  const totalLive     = videos.reduce((s, v) => s + v.liveViewers, 0);
  const followerCount = await getFollowerCountRepo(handle);

  const accentClass = handle.length % 3 === 0
    ? "from-teal-600/30 to-teal-900/10"
    : handle.length % 3 === 1
    ? "from-violet-600/30 to-violet-900/10"
    : "from-pink-600/30 to-pink-900/10";

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Banner ── */}
      <div className={`relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br ${accentClass} p-6 sm:p-10`}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-500 text-2xl font-black text-white shadow-xl shadow-black/40 sm:h-24 sm:w-24">
              {creator.avatar}
            </div>
            {creator.isPaidTier && (
              <div className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-lg bg-violet-500 shadow-lg shadow-violet-900/50">
                <Crown className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{creator.name}</h1>
              {creator.isPaidTier && (
                <span className="flex items-center gap-1 rounded-lg border border-violet-400/30 bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                  <Crown className="h-3 w-3" /> Paid Creator
                </span>
              )}
              {totalLive > 0 && <LiveDot count={totalLive} size="md" />}
            </div>
            <p className="font-mono text-sm text-zinc-500">@{creator.handle}</p>
            {creator.bio && <p className="max-w-xl text-sm text-zinc-400">{creator.bio}</p>}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Users className="h-3.5 w-3.5" />
              <span>{followerCount.toLocaleString()} followers</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            {creator.isPaidTier && creator.subscriptionPrice && (
              <SubscribeButton
                creatorHandle={creator.handle}
                subscriptionPrice={creator.subscriptionPrice}
              />
            )}
            <FollowButton handle={creator.handle} />
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total earned",  value: usd(totalEarned, 2),                  mono: true  },
          { label: "Watch time",    value: `${(totalWatch / 3600).toFixed(1)}h`, mono: true  },
          { label: "Clips",         value: videos.length.toString(),              mono: false },
          { label: "Followers",     value: followerCount.toLocaleString(),        mono: false },
        ].map(({ label, value, mono }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className="text-xs text-zinc-600">{label}</p>
            <p className={`mt-1 text-base font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Subscription pricing card ── */}
      {creator.isPaidTier && creator.subscriptionPrice && (
        <div className="glass rounded-2xl p-5 border border-violet-400/20">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="h-5 w-5 text-violet-400" />
            <p className="font-semibold text-violet-300">Subscription</p>
          </div>
          <p className="text-sm text-zinc-400 mb-4">
            Subscribe for <span className="text-white font-semibold">{usd(creator.subscriptionPrice, 0)}/month</span> to unlock all {videos.length} video{videos.length !== 1 ? "s" : ""}.
            Paid via Circle nanopayment — one USDC transfer, 30 days of access.
          </p>
          <SubscribeButton creatorHandle={creator.handle} subscriptionPrice={creator.subscriptionPrice} />
        </div>
      )}

      {/* ── Referral ── */}
      <ReferralLink handle={creator.handle} />

      {/* ── On-chain link ── */}
      {creator.walletAddress && (
        <div className="flex items-center gap-2 text-xs text-zinc-700">
          <span className="font-mono">{creator.walletAddress}</span>
          <Link
            href={`https://explorer.arc.network/address/${creator.walletAddress}`}
            target="_blank" rel="noopener noreferrer"
            className="text-zinc-600 transition hover:text-zinc-400"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* ── Videos ── */}
      {videos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      ) : (
        <p className="py-12 text-center text-zinc-600">No clips yet.</p>
      )}
    </div>
  );
}
