"use client";

import { generateSparklineData, usd } from "@/lib/utils";

interface EarningsChartProps {
  videos: { title: string; totalEarned: number }[];
}

function Sparkline({ data, color = "#2dd4bf", height = 36 }: { data: number[]; color?: string; height?: number }) {
  const width = 120;
  const max = Math.max(...data, 0.0001);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + ((1 - (v - min) / range) * (height - pad * 2));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Area fill path
  const first = data[0];
  const last = data[data.length - 1];
  const fx = pad;
  const lx = pad + (width - pad * 2);
  const fy = pad + ((1 - (first - min) / range) * (height - pad * 2));
  const ly = pad + ((1 - (last - min) / range) * (height - pad * 2));
  const areaPath = `M ${fx} ${fy} ${points.split(" ").slice(1).map((p, i) => `L ${p}`).join(" ")} L ${lx} ${height} L ${fx} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`area-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#area-${color.replace("#", "")})`} />
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}

export function EarningsChart({ videos }: EarningsChartProps) {
  const totalData = generateSparklineData(
    videos.reduce((s, v) => s + v.totalEarned, 0),
    28,
  );

  return (
    <div className="space-y-4">
      {/* Overall sparkline */}
      <div className="glass rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-zinc-500">14-day earnings trend (estimated)</span>
          <span className="font-mono text-sm text-teal-300">
            {usd(videos.reduce((s, v) => s + v.totalEarned, 0), 2)} total
          </span>
        </div>
        <div className="h-16">
          <Sparkline data={totalData} height={64} />
        </div>
      </div>

      {/* Per-video sparklines */}
      <div className="space-y-2">
        {videos.map((video) => {
          const data = generateSparklineData(video.totalEarned, 14);
          return (
            <div key={video.title} className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{video.title}</p>
                <p className="font-mono text-xs text-zinc-500">{usd(video.totalEarned, 4)}</p>
              </div>
              <div className="h-9 w-28 shrink-0">
                <Sparkline data={data} color="#a78bfa" height={36} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
