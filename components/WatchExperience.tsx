"use client";

import { useEffect, useState } from "react";
import { Crown, Lock, Wallet } from "lucide-react";
import { BalanceLoader } from "@/components/BalanceLoader";
import { CreatorCard } from "@/components/CreatorCard";
import { EmojiReactions } from "@/components/EmojiReactions";
import { SubscribeButton } from "@/components/SubscribeButton";
import { TipButton } from "@/components/TipButton";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LiveDot } from "@/components/LiveDot";
import { getStoredWallet } from "@/lib/viewerWallet";
import { ratePerMinute, usd } from "@/lib/utils";
import type { Video } from "@/types";

export function WatchExperience({ video }: { video: Video }) {
  const [balance,    setBalance]    = useState(0);
  const [subscribed, setSubscribed] = useState<boolean | null>(null); // null = loading

  const isPaidCreator = video.creator.isPaidTier;
  const subPrice      = video.creator.subscriptionPrice ?? 5;

  useEffect(() => {
    if (!isPaidCreator) { setSubscribed(true); return; } // free creator — always access
    const wallet = getStoredWallet();
    if (!wallet) { setSubscribed(false); return; }
    fetch(`/api/subscriptions?viewerId=${wallet.walletId}&creatorHandle=${video.creator.handle}`)
      .then((r) => r.json())
      .then((d) => setSubscribed(d.subscribed))
      .catch(() => setSubscribed(false));
  }, [isPaidCreator, video.creator.handle]);

  // Loading state
  if (subscribed === null) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="aspect-video animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  // Subscription gate
  if (isPaidCreator && !subscribed) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0 space-y-4">
          {/* Blurred preview */}
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center blur-2xl"
              style={{ backgroundImage: `url(${video.thumbnailSrc})` }}
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/30 bg-violet-500/20">
                <Crown className="h-8 w-8 text-violet-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">Paid Creator</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Subscribe to <span className="text-violet-300">{video.creator.name}</span> to watch this video
                </p>
              </div>
              <SubscribeButton creatorHandle={video.creator.handle} subscriptionPrice={subPrice} />
              <p className="text-xs text-zinc-600">
                {usd(subPrice, 0)}/month · all videos unlocked · nanopayments via Circle
              </p>
            </div>
          </div>

          {/* Video meta (visible even locked) */}
          <div className="glass rounded-2xl p-5">
            <h1 className="text-2xl font-bold tracking-tight text-white">{video.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{video.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <span key={tag} className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-400">#{tag}</span>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-violet-400" />
              <p className="text-sm font-semibold text-violet-300">Subscription Required</p>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Once subscribed, pay-per-second nanopayments flow as you watch — no further action needed.
            </p>
            <SubscribeButton creatorHandle={video.creator.handle} subscriptionPrice={subPrice} className="w-full justify-center" />
          </div>
          <CreatorCard creator={video.creator} />
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Wallet className="h-4 w-4" />
              <span>Need a wallet? <a href="/wallet" className="text-teal-400 underline">Set one up</a></span>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Full access
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="min-w-0 space-y-4">
        {video.nftGated ? (
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
                {isPaidCreator && (
                  <span className="flex items-center gap-1 rounded-lg border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-300">
                    <Crown className="h-3 w-3" /> Paid
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
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {video.tags.map((tag) => (
              <span key={tag} className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.09] hover:text-zinc-200">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <EmojiReactions />
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {/* Rate card */}
        <div className="rounded-2xl border border-teal-400/20 bg-gradient-to-br from-teal-400/10 to-transparent p-4">
          <p className="text-xs text-teal-400/70">Nanopayment rate</p>
          <p className="mt-0.5 font-mono text-2xl font-semibold text-teal-300">
            {usd(ratePerMinute(video.ratePerSecond), 6)}/min
          </p>
          <p className="mt-1 text-xs text-teal-400/50">
            {video.ratePerSecond.toFixed(6)} USDC/s · Circle-powered
          </p>
          {isPaidCreator && subscribed && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-violet-500/10 border border-violet-400/20 px-3 py-2">
              <Crown className="h-3.5 w-3.5 text-violet-400" />
              <p className="text-xs text-violet-300">Subscribed · watching free</p>
            </div>
          )}
        </div>

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
