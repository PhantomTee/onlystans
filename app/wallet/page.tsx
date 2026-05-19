import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { listTransactionsRepo } from "@/lib/repository";
import { usd } from "@/lib/utils";

export default async function WalletPage() {
  const balance      = 42.742103;
  const sampleRate   = 0.0001;
  const transactions = await listTransactionsRepo(20);

  const watchMinutes = balance / sampleRate / 60;

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400">Circle Embedded Wallet</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Your Wallet</h1>
        <p className="mt-1 text-zinc-500">USDC balance, estimated watch time, and transaction history.</p>
      </div>

      {/* Balance + top-up */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Balance card */}
        <div className="glass rounded-2xl p-5 col-span-2 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl" />
          <p className="text-xs text-zinc-500">USDC Balance</p>
          <p className="mt-1 font-mono text-4xl font-semibold text-white">
            {usd(balance, 2)}
          </p>
          <p className="mt-1 text-xs text-zinc-600">≈ {watchMinutes.toFixed(0)} min at standard rate</p>
        </div>

        {/* Top-up */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs text-zinc-500">Add funds</p>
            <p className="mt-1 text-sm text-zinc-400">Top up with fiat or bridge from another chain.</p>
          </div>
          <button className="mt-4 w-full rounded-xl bg-teal-400 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-teal-300 active:scale-[0.97]">
            Top-up via Circle
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-400">Recent activity</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                {["Type", "Amount", "Tx hash", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-white/[0.05] transition hover:bg-white/[0.025]">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 capitalize text-zinc-300">
                      {tx.kind === "tip" || tx.kind === "topup"
                        ? <ArrowDownLeft className="h-3.5 w-3.5 text-teal-400" />
                        : <ArrowUpRight  className="h-3.5 w-3.5 text-violet-400" />}
                      {tx.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    <span className={tx.kind === "withdraw" ? "text-violet-300" : "text-teal-300"}>
                      {tx.kind === "withdraw" ? "−" : "+"}{usd(tx.amount, 6)}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[160px] truncate font-mono text-xs text-zinc-600">{tx.txHash}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
