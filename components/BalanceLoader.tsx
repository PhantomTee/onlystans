"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { usd } from "@/lib/utils";

interface BalanceLoaderProps {
  ratePerSecond: number;
  onBalance?: (balance: number) => void;
}

export function BalanceLoader({ ratePerSecond, onBalance }: BalanceLoaderProps) {
  const [balance,  setBalance]  = useState<number | null>(null);
  const [walletId, setWalletId] = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const wallet = await fetch("/api/wallets/create", { method: "POST" }).then((r) => r.json());
        const balResp = await fetch(`/api/wallets/balance?walletId=${wallet.walletId}`).then((r) => r.json());
        if (!alive) return;
        setWalletId(wallet.walletId);
        setBalance(balResp.balance);
        onBalance?.(balResp.balance);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [onBalance]);

  const watchMinutes = ratePerSecond > 0 && balance !== null ? balance / ratePerSecond / 60 : 0;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
        <Wallet className="h-4 w-4 text-teal-400" />
        Viewer wallet
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-8 w-32 rounded" />
          <div className="skeleton h-3 w-48 rounded" />
        </div>
      ) : (
        <>
          <div className="font-mono text-3xl font-semibold text-white">
            {usd(balance ?? 0, 2)}
            <span className="ml-1.5 text-sm text-zinc-500">USDC</span>
          </div>
          <p className="mt-1 text-xs text-zinc-600">
            ≈ {watchMinutes.toFixed(1)} min at this rate
          </p>
          <p className="mt-2 truncate font-mono text-[10px] text-zinc-700">{walletId}</p>
        </>
      )}
    </div>
  );
}
