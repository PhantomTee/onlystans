"use client";

import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { cctpDomains } from "@/lib/cctp";

export function WithdrawModal() {
  const [open,   setOpen]   = useState(false);
  const [chain,  setChain]  = useState<keyof typeof cctpDomains>("Base");
  const [amount, setAmount] = useState("25");
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [result, setResult] = useState("");

  async function withdraw() {
    setStatus("pending");
    setResult("");
    try {
      const resp = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), destinationChain: chain, destinationAddress: "0xcreator" }),
      });
      const data = await resp.json();
      setStatus("done");
      setResult(data.attestation || data.messageHash || data.status);
    } catch {
      setStatus("error");
    }
  }

  function close() { setOpen(false); setStatus("idle"); setResult(""); }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/20 active:scale-[0.98]"
      >
        <ArrowUpRight className="h-4 w-4" />
        Withdraw via CCTP
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-slide-up rounded-2xl border border-white/[0.10] bg-zinc-950 shadow-2xl shadow-black/80">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">CCTP Withdrawal</h2>
                <p className="text-xs text-zinc-500">Bridge USDC to any supported chain</p>
              </div>
              <button onClick={close} className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.07] hover:text-zinc-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Amount (USDC)</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-7 pr-4 text-sm text-white outline-none ring-violet-400/30 transition focus:ring-2"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-400">Destination chain</span>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value as keyof typeof cctpDomains)}
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-900 py-2.5 px-4 text-sm text-white outline-none ring-violet-400/30 transition focus:ring-2"
                >
                  {Object.keys(cctpDomains).map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>

              <button
                onClick={withdraw}
                disabled={status === "pending"}
                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:from-violet-400 hover:to-violet-500 disabled:opacity-50 active:scale-[0.98]"
              >
                {status === "pending" ? "Bridging…" : `Bridge ${amount || "0"} USDC to ${chain}`}
              </button>

              {status === "done"  && <p className="break-all text-xs text-teal-400">✓ {result}</p>}
              {status === "error" && <p className="text-xs text-red-400">Something went wrong. Try again.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
