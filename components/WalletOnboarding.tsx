"use client";

import { useEffect, useState } from "react";
import { Wallet, Copy, CheckCheck, RefreshCw } from "lucide-react";
import { getStoredWallet, saveWallet, type StoredWallet } from "@/lib/viewerWallet";
import { usd } from "@/lib/utils";

export function WalletOnboarding() {
  const [wallet, setWallet]   = useState<StoredWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    const stored = getStoredWallet();
    if (stored) { setWallet(stored); refreshBalance(stored.walletId); }
  }, []);

  async function refreshBalance(walletId: string) {
    try {
      const res = await fetch(`/api/wallets?viewerId=${walletId}`);
      if (res.ok) {
        const data = await res.json();
        const updated = { walletId: data.walletId, address: data.address, balance: data.balance };
        setWallet(updated);
        saveWallet(updated);
      }
    } catch { /* ignore */ }
  }

  async function onboard() {
    setLoading(true);
    try {
      // Use a random stable ID as the viewer identity (no email/login needed)
      const viewerId = crypto.randomUUID();
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewerId }),
      });
      const data = await res.json();
      const stored: StoredWallet = { walletId: data.walletId, address: data.address, balance: data.balance ?? 0 };
      saveWallet(stored);
      setWallet(stored);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!wallet) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400/10">
            <Wallet className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Create your Circle Wallet</p>
            <p className="text-xs text-zinc-500">One-click — no sign-up needed</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          Your wallet holds USDC on Arc Testnet. Fund it, then watch any paid creator — nanopayments flow automatically per second.
        </p>
        <button
          onClick={onboard}
          disabled={loading}
          className="w-full rounded-xl bg-teal-400 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-teal-300 active:scale-[0.97] disabled:opacity-60"
        >
          {loading ? "Creating wallet…" : "Create My Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400/10">
            <Wallet className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Circle Wallet</p>
            <p className="text-xs text-zinc-500">Arc Testnet · USDC</p>
          </div>
        </div>
        <button
          onClick={() => refreshBalance(wallet.walletId)}
          className="rounded-lg p-1.5 text-zinc-500 transition hover:text-zinc-300"
          title="Refresh balance"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Balance */}
      <div className="rounded-xl bg-teal-400/[0.07] border border-teal-400/20 px-4 py-3">
        <p className="text-xs text-zinc-500">USDC Balance</p>
        <p className="font-mono text-3xl font-semibold text-teal-300">{usd(wallet.balance, 2)}</p>
      </div>

      {/* Address — send USDC here to fund */}
      <div>
        <p className="mb-1.5 text-xs text-zinc-500">Send USDC to this address to fund your wallet</p>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2">
          <p className="flex-1 truncate font-mono text-xs text-zinc-300">{wallet.address || "generating…"}</p>
          <button
            onClick={() => wallet.address && copy(wallet.address)}
            className="shrink-0 text-zinc-500 transition hover:text-teal-400"
          >
            {copied ? <CheckCheck className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-zinc-600">
          Arc Testnet USDC — gas is included (USDC is the native token)
        </p>
      </div>
    </div>
  );
}
