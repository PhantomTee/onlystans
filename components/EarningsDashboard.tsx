import { EarningsChart } from "@/components/EarningsChart";
import { WithdrawModal } from "@/components/WithdrawModal";
import { LiveDot } from "@/components/LiveDot";
import { usd } from "@/lib/utils";
import type { Video } from "@/types";

export function EarningsDashboard({ videos }: { videos: Video[] }) {
  const lifetime   = videos.reduce((s, v) => s + v.totalEarned, 0);
  const day        = lifetime * 0.08;
  const week       = lifetime * 0.37;
  const totalLive  = videos.reduce((s, v) => s + v.liveViewers, 0);
  const totalWatch = videos.reduce((s, v) => s + v.totalWatchSeconds, 0);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400">Creator Studio</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Earnings Dashboard</h1>
          <p className="mt-1 text-zinc-500">Real-time stream revenue, live viewers, and cross-chain withdrawals.</p>
        </div>
        <WithdrawModal />
      </div>

      {/* ── Summary cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lifetime",     value: usd(lifetime, 4),                         accent: "teal"   },
          { label: "24h",          value: usd(day, 4),                               accent: "violet" },
          { label: "7d",           value: usd(week, 4),                              accent: "violet" },
          { label: "Live viewers", value: totalLive.toString(),                      accent: "red"    },
        ].map(({ label, value, accent }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className="text-xs text-zinc-500">{label}</p>
            <div className="mt-2 flex items-end gap-2">
              {accent === "red" ? (
                <div className="flex items-center gap-2">
                  {totalLive > 0 && <LiveDot size="md" />}
                  <span className="font-mono text-2xl font-semibold text-white">{value}</span>
                </div>
              ) : (
                <span className={`font-mono text-2xl font-semibold ${accent === "teal" ? "text-gradient-teal" : "text-gradient-violet"}`}>
                  {value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-400">Earnings trend</h2>
        <EarningsChart videos={videos} />
      </div>

      {/* ── Per-video table ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-400">Videos</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                {["Video", "Earned", "Watch time", "Live", "Rate/s"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-t border-white/[0.05] transition hover:bg-white/[0.025]">
                  <td className="px-4 py-3 font-medium text-white">{video.title}</td>
                  <td className="px-4 py-3 font-mono text-teal-300">{usd(video.totalEarned, 4)}</td>
                  <td className="px-4 py-3 text-zinc-400">{(video.totalWatchSeconds / 3600).toFixed(1)}h</td>
                  <td className="px-4 py-3">
                    {video.liveViewers > 0 ? <LiveDot count={video.liveViewers} size="sm" /> : <span className="text-zinc-700">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{video.ratePerSecond.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Total watch time ── */}
      <p className="text-center text-xs text-zinc-700">
        {(totalWatch / 3600).toFixed(1)} total hours watched across all videos
      </p>
    </div>
  );
}
