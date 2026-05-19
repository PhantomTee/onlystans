"use client";

import { useEffect, useRef, useState } from "react";
import { usd } from "@/lib/utils";

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number | undefined>(undefined);

  useEffect(() => {
    startRef.current = null;
    function frame(now: number) {
      if (startRef.current === null) startRef.current = now;
      const progress = Math.min((now - startRef.current) / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

interface HeroStatsProps {
  videoCount:   number;
  live:         number;
  totalEarned:  number;
}

export function HeroStats({ videoCount, live, totalEarned }: HeroStatsProps) {
  const countVideos  = useCountUp(videoCount);
  const countLive    = useCountUp(live);
  const countEarned  = useCountUp(totalEarned);

  const stats = [
    { label: "clips",          value: Math.round(countVideos).toString()       },
    { label: "watching live",  value: Math.round(countLive).toString()         },
    { label: "USDC streamed",  value: usd(countEarned, 2)                      },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="font-mono text-xl font-semibold text-white tabular-nums">{value}</div>
          <div className="text-[11px] text-zinc-600">{label}</div>
        </div>
      ))}
    </div>
  );
}
