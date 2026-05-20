"use client";

import { useEffect, useState } from "react";
import { Crown, Loader2, CheckCircle2 } from "lucide-react";
import { getStoredWallet } from "@/lib/viewerWallet";
import { usd } from "@/lib/utils";

type Props = {
  creatorHandle: string;
  subscriptionPrice: number;
  className?: string;
};

export function SubscribeButton({ creatorHandle, subscriptionPrice, className = "" }: Props) {
  const [status,     setStatus]     = useState<"idle" | "loading" | "subscribed" | "error">("idle");
  const [subscribed, setSubscribed] = useState(false);
  const [expiresAt,  setExpiresAt]  = useState<string | null>(null);
  const [noWallet,   setNoWallet]   = useState(false);

  useEffect(() => {
    const wallet = getStoredWallet();
    if (!wallet) { setNoWallet(true); return; }
    fetch(`/api/subscriptions?viewerId=${wallet.walletId}&creatorHandle=${creatorHandle}`)
      .then((r) => r.json())
      .then((d) => {
        setSubscribed(d.subscribed);
        setExpiresAt(d.expiresAt ?? null);
      })
      .catch(() => {});
  }, [creatorHandle]);

  async function subscribe() {
    const wallet = getStoredWallet();
    if (!wallet) { setNoWallet(true); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewerWalletId: wallet.walletId, creatorHandle, durationDays: 30 }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setExpiresAt(data.expiresAt);
        setStatus("subscribed");
      } else {
        console.error(data.error);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  if (noWallet) {
    return (
      <p className={`text-xs text-zinc-500 ${className}`}>
        <a href="/wallet" className="underline text-teal-400">Create a wallet</a> to subscribe
      </p>
    );
  }

  if (subscribed) {
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-2 ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-teal-400" />
        <div>
          <p className="text-sm font-semibold text-teal-300">Subscribed</p>
          {expiresAt && (
            <p className="text-xs text-zinc-500">
              Renews {new Date(expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={status === "loading"}
      className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-400 hover:to-violet-500 active:scale-[0.97] disabled:opacity-60 ${className}`}
    >
      {status === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Crown className="h-4 w-4" />
      )}
      {status === "loading" ? "Processing…" : status === "error" ? "Failed — retry" : `Subscribe · ${usd(subscriptionPrice, 0)}/mo`}
    </button>
  );
}
