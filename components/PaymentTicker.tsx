"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Radio } from "lucide-react";
import { usd } from "@/lib/utils";

interface PaymentTickerProps {
  totalPaid: number;
  ratePerSecond: number;
  balance: number;
  playing: boolean;
}

export function PaymentTicker({ totalPaid, ratePerSecond, balance, playing }: PaymentTickerProps) {
  const [display, setDisplay] = useState(totalPaid);
  const baseRef     = useRef(totalPaid);
  const syncTimeRef = useRef(Date.now());
  const rafRef      = useRef<number | undefined>(undefined);

  // When server confirms a new totalPaid (heartbeat), anchor to it
  useEffect(() => {
    baseRef.current    = totalPaid;
    syncTimeRef.current = Date.now();
    setDisplay(totalPaid);
  }, [totalPaid]);

  // Smooth per-frame interpolation while playing
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!playing) return;

    // Reset sync anchor when playback starts
    syncTimeRef.current = Date.now();

    function tick() {
      const elapsed = (Date.now() - syncTimeRef.current) / 1000;
      setDisplay(baseRef.current + elapsed * ratePerSecond);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, ratePerSecond]);

  const secondsLeft = ratePerSecond > 0 ? balance / ratePerSecond : Infinity;
  const low = secondsLeft < 60 && secondsLeft > 0;
  const fillPct = Math.min(100, totalPaid > 0 ? (totalPaid / (totalPaid + balance)) * 100 : playing ? 4 : 0);

  return (
    <div className={`glass rounded-2xl p-4 transition-all ${playing ? "glow-teal" : ""}`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-zinc-400">
          <Radio
            className={`h-4 w-4 transition-colors ${playing ? "text-teal-400 animate-teal-pulse-ring" : "text-zinc-600"}`}
          />
          Stream meter
        </span>
        <span
          className={`font-mono text-xl tabular-nums transition-all ${
            playing ? "text-gradient-teal animate-ticker-glow" : "text-zinc-400"
          }`}
        >
          {usd(display, 6)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            playing
              ? "bg-gradient-to-r from-teal-500 to-teal-300"
              : "bg-zinc-700"
          }`}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <p className="mt-2 text-[11px] text-zinc-600">
        {playing
          ? `Ticking at ${ratePerSecond.toFixed(6)} USDC/s · settled every 10s`
          : "Press play to start streaming payments"}
      </p>

      {/* Low balance warning */}
      {low && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] p-2.5 text-xs text-amber-300 animate-slide-up">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Less than {Math.floor(secondsLeft)}s of balance remaining — top up to keep watching.
          </span>
        </div>
      )}
    </div>
  );
}
