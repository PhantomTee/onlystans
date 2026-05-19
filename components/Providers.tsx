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
        className="group flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-mono font-medium text-teal-300 transition hover:border-teal-500/50 hover:bg-teal-500/20"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_1px_rgba(45,212,191,0.6)]" />
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  const injector = connectors[0];
  return (
    <button
      onClick={() => connect({ connector: injector })}
      disabled={isPending}
      className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-300 disabled:opacity-50"
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
