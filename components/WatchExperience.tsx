"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { BalanceLoader } from "@/components/BalanceLoader";
import { CreatorCard } from "@/components/CreatorCard";
import { EmojiReactions } from "@/components/EmojiReactions";
import { TipButton } from "@/components/TipButton";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LiveDot } from "@/components/LiveDot";
import { ratePerMinute, usd } from "@/lib/utils";
import type { Video } from "@/types";

export function WatchExperience({ video }: { video: Video }) {
  const [balance, setBalance] = useState(0);

  // NFT-gate mock check
  const gated = video.nftGated;
  // In production: actually verify NFT ownership via wallet read
  const hasAccess = true; // mock: always granted

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* ── Left: player + info ── */}
      <section className="min-w-0 space-y-4">
        {gated && !hasAccess ? (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
            <div className="text-center">
              <Lock className="mx-auto mb-3 h-10 w-10 text-violet-400" />
              <p className="text-lg font-semibold text-violet-300">NFT-gated content</p>
              <p className="mt-1 text-sm text-zinc-500">Hold the required NFT to unlock this video.</p>
            </div>
          </div>
        ) : (
          <VideoPlayer video={video} balance={balance} />
        )}

        {/* Video meta */}
        <div className="glass rounded-2xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">{video.title}</h1>
                {video.nftGated && (
                  <span className="rounded-lg border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-300">
                    NFT-gated
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{video.description}</p>
            </div>
            <div className="shrink-0 rounded-xl border border-teal-400/20 bg-teal-400/[0.07] px-3 py-2">
              <p className="font-mono text-xs text-zinc-500">total earned</p>
              <p className="font-mono text-lg text-teal-300">{usd(video.totalEarned, 4)}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {video.tags.map((tag) => (
              <span key={tag} className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.09] hover:text-zinc-200">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Emoji reactions */}
        <EmojiReactions />
      </section>

      {/* ── Right: sidebar ── */}
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {/* Rate card */}
        <div className="rounded-2xl border border-teal-400/20 bg-gradient-to-br from-teal-400/10 to-transparent p-4 shadow-xl shadow-teal-950/20">
          <p className="text-xs text-teal-400/70">Current rate</p>
          <p className="mt-0.5 font-mono text-2xl font-semibold text-teal-300">
            {usd(ratePerMinute(video.ratePerSecond), 6)}/min
          </p>
          <p className="mt-1 text-xs text-teal-400/50">
            {video.ratePerSecond.toFixed(6)} USDC/s · sponsored gas
          </p>

          {/* Subscription bundle option */}
          {video.subscriptionRate && (
            <div className="mt-3 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2">
              <p className="text-xs text-zinc-500">Or subscribe for flat rate</p>
              <p className="font-mono text-sm text-violet-300">${video.subscriptionRate.toFixed(2)}/month</p>
              <button className="mt-2 w-full rounded-lg border border-violet-400/30 bg-violet-500/15 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/25">
                Subscribe (demo)
              </button>
            </div>
          )}
        </div>

        {/* Live viewers */}
        {video.liveViewers > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
            <LiveDot size="md" />
            <span className="text-sm text-zinc-400">
              <span className="font-semibold text-white">{video.liveViewers}</span> watching live
            </span>
          </div>
        )}

        <CreatorCard creator={video.creator} />
        <BalanceLoader ratePerSecond={video.ratePerSecond} onBalance={setBalance} />
        <TipButton videoId={video.id} creatorWalletId={video.creator.walletAddress} />
      </aside>
    </div>
  );
}
