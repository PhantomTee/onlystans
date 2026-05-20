import { listVideosRepo } from "@/lib/repository";
import { FeedSection }    from "@/components/FeedSection";
import { HeroStats }      from "@/components/HeroStats";
import { ArrowRight, Zap } from "lucide-react";

export default async function FeedPage() {
  const videos      = await listVideosRepo("trending");
  const live        = videos.reduce((s, v) => s + v.liveViewers, 0);
  const totalEarned = videos.reduce((s, v) => s + v.totalEarned, 0);

  return (
    <div className="space-y-12">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.06] px-7 py-14 sm:px-12 sm:py-20"
        style={{ background: "linear-gradient(145deg, rgba(255,107,0,0.06) 0%, rgba(236,72,153,0.04) 50%, rgba(139,92,246,0.04) 100%)" }}>

        {/* Orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full animate-hero-orb"
          style={{ background: "radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)" }} aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full animate-hero-orb [animation-delay:5s]"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)" }} aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full animate-hero-orb [animation-delay:9s]"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} aria-hidden />

        {/* Border gradient top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,107,0,0.4), rgba(236,72,153,0.4), transparent)" }} aria-hidden />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_280px] lg:items-end">
          <div className="space-y-6">

            <div className="badge-orange">
              <Zap className="h-2.5 w-2.5" />
              Arc Testnet · USDC Nanopayments
            </div>

            <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[5.5rem]">
              <span className="text-gradient-hero block">Create.</span>
              <span className="text-gradient-orange block">Monetise</span>
              <span className="text-gradient-hero block">by the second.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed" style={{ color: "rgba(242,240,255,0.55)" }}>
              The first creator platform where money flows the same way attention does — in real time.
              No ads. No algorithms. Pure USDC, streamed second by second.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#feed" className="btn-primary">
                Explore Creators
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="/upload" className="btn-ghost">
                Start Creating
              </a>
            </div>
          </div>

          <HeroStats videoCount={videos.length} live={live} totalEarned={totalEarned} />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            n: "01",
            title: "Fund your wallet",
            body: "One click creates your Circle wallet. Send USDC on Arc Testnet — no gas needed beyond what's in USDC.",
            color: "rgba(255,107,0,0.12)",
            border: "rgba(255,107,0,0.2)",
            num: "rgba(255,107,0,0.8)",
          },
          {
            n: "02",
            title: "Watch & stream payments",
            body: "Hit play — a nanopayment fires every 10 seconds from your wallet to the creator. Pause and it stops instantly.",
            color: "rgba(236,72,153,0.10)",
            border: "rgba(236,72,153,0.18)",
            num: "rgba(236,72,153,0.8)",
          },
          {
            n: "03",
            title: "Subscribe or pay-per-sec",
            body: "Subscribe once for full access, or pay purely per second you watch. No subscriptions you forget to cancel.",
            color: "rgba(139,92,246,0.10)",
            border: "rgba(139,92,246,0.18)",
            num: "rgba(139,92,246,0.8)",
          },
        ].map(({ n, title, body, color, border, num }) => (
          <div key={n} className="rounded-2xl border p-6 space-y-3 transition hover:scale-[1.01]"
            style={{ background: color, borderColor: border }}>
            <span className="font-mono text-xs font-semibold" style={{ color: num }}>{n}</span>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(242,240,255,0.5)" }}>{body}</p>
          </div>
        ))}
      </section>

      {/* ── Feed ── */}
      <div id="feed">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-2xl font-black tracking-tight text-white">Trending now</h2>
          {live > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 font-mono text-[10px] text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse-ring" />
              {live} live
            </span>
          )}
        </div>
        <FeedSection videos={videos} />
      </div>

    </div>
  );
}
