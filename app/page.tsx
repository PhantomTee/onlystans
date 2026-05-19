import { listVideosRepo } from "@/lib/repository";
import { FeedSection } from "@/components/FeedSection";
import { HeroStats }   from "@/components/HeroStats";

export default async function FeedPage() {
  const videos      = await listVideosRepo("trending");
  const live        = videos.reduce((s, v) => s + v.liveViewers, 0);
  const totalEarned = videos.reduce((s, v) => s + v.totalEarned, 0);

  return (
    <div className="space-y-10">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent px-6 py-12 sm:px-10 sm:py-16">
        {/* Animated orbs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl animate-hero-orb"  aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl animate-hero-orb [animation-delay:4s]" aria-hidden />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
          <div className="space-y-5">
            <span className="inline-block rounded-full border border-teal-400/25 bg-teal-400/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-teal-400">
              Arc Testnet · USDC per second
            </span>

            <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.03em] text-gradient-hero sm:text-6xl lg:text-7xl">
              Watch.<br />
              <span className="text-gradient-teal">Pay</span> only<br />
              while watching.
            </h1>

            <p className="max-w-md text-base leading-relaxed text-zinc-400">
              No ads, no flat subscriptions, no platform cut. Playback opens a
              sponsored USDC stream — it pauses when you pause and closes when you leave.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#feed"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-bold text-zinc-950 shadow-lg shadow-teal-950/30 transition hover:bg-teal-300 active:scale-[0.97]">
                Browse Clips
              </a>
              <a href="/upload"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08]">
                Become a Creator
              </a>
            </div>
          </div>

          <HeroStats videoCount={videos.length} live={live} totalEarned={totalEarned} />
        </div>
      </section>

      {/* ── Feed ── */}
      <div id="feed">
        <FeedSection videos={videos} />
      </div>
    </div>
  );
}
