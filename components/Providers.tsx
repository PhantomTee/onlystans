"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";
import { wagmiConfig } from "@/lib/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-mono font-semibold transition"
        style={{ borderColor: "rgba(255,107,0,0.35)", background: "rgba(255,107,0,0.10)", color: "rgba(255,140,60,0.95)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FF6B00", boxShadow: "0 0 8px rgba(255,107,0,0.8)" }} />
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  const injector = connectors[0];
  return (
    <button
      onClick={() => connect({ connector: injector })}
      disabled={isPending}
      className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
      style={{ borderRadius: "12px", fontSize: "12px", padding: "7px 16px" }}
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
