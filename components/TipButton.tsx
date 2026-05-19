"use client";

import { useState } from "react";
import { Gift, Sparkles, X } from "lucide-react";

interface TipButtonProps {
  videoId: string;
  creatorWalletId: string;
}

const PRESETS = [0.1, 0.5, 1, 5];
const SUPER_TIP_THRESHOLD = 1;

export function TipButton({ videoId, creatorWalletId }: TipButtonProps) {
  const [open,       setOpen]   = useState(false);
  const [custom,     setCustom] = useState("0.25");
  const [status,     setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [superTip,   setSuperTip] = useState<{ amount: number; txHash: string } | null>(null);

  async function tip(amount: number) {
    setStatus("sending");
    try {
      const resp = await fetch("/api/payments/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, creatorWalletId, amount }),
      });
      const data = await resp.json();
      setStatus("done");

      if (amount >= SUPER_TIP_THRESHOLD) {
        setSuperTip({ amount, txHash: data.txHash });
        setTimeout(() => setSuperTip(null), 6000);
      }
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => { setStatus("idle"); setOpen(false); }, 1800);
    }
  }

  return (
    <>
      {/* Super tip banner */}
      {superTip && (
        <div className="animate-slide-up rounded-xl border border-pink-400/30 bg-gradient-to-r from-pink-500/15 to-violet-500/10 p-4 shadow-xl glow-pink">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-pink-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-pink-300">Super Tip — ${superTip.amount.toFixed(2)} sent! 🎉</p>
              <p className="font-mono text-[11px] text-zinc-500">{superTip.txHash}</p>
            </div>
            <button onClick={() => setSuperTip(null)} className="ml-auto text-zinc-600 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-2.5 text-sm font-semibold text-pink-300 transition hover:border-pink-400/50 hover:bg-pink-500/20 active:scale-[0.98]"
        >
          <Gift className="h-4 w-4" />
          Tip creator
        </button>

        {open && (
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-white/[0.10] bg-zinc-950/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl animate-slide-up">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Quick tip</p>

            <div className="grid grid-cols-4 gap-1.5">
              {PRESETS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => tip(amount)}
                  disabled={status === "sending"}
                  className={`rounded-lg border py-2 text-sm font-semibold transition ${
                    amount >= SUPER_TIP_THRESHOLD
                      ? "border-pink-400/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20"
                      : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08]"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pl-6 pr-3 text-sm text-white outline-none ring-pink-400/30 transition focus:ring-2"
                  placeholder="Custom"
                />
              </div>
              <button
                onClick={() => tip(Number(custom) || 0.1)}
                disabled={status === "sending"}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50 active:scale-95"
              >
                {status === "sending" ? "…" : "Send"}
              </button>
            </div>

            {status === "done"  && <p className="mt-2 text-xs text-teal-400">Tip sent ✓</p>}
            {status === "error" && <p className="mt-2 text-xs text-red-400">Something went wrong</p>}
          </div>
        )}
      </div>
    </>
  );
}
