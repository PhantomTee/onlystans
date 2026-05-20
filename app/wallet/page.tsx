import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { listTransactionsRepo } from "@/lib/repository";
import { WalletOnboarding } from "@/components/WalletOnboarding";
import { usd } from "@/lib/utils";

export default async function WalletPage() {
  const transactions = await listTransactionsRepo(20);

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400">Circle Nanopayments</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Your Wallet</h1>
        <p className="mt-1 text-zinc-500">Fund your Circle wallet — nanopayments flow automatically as you watch.</p>
      </div>

      <WalletOnboarding />

      <div className="glass rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-zinc-300">How nanopayments work</p>
        <div className="space-y-2 text-sm text-zinc-500">
          {[
            ["01", "Create your wallet — no sign-up, no email. One click."],
            ["02", "Copy your wallet address and send USDC to it on Arc Testnet."],
            ["03", "Watch any video — every 10 seconds, a tiny USDC transfer goes from your wallet to the creator via Circle. No pop-ups."],
            ["04", "For paid creators, subscribe once (flat USDC/month) — then watch unlimited."],
          ].map(([n, t]) => (
            <div key={n} className="flex gap-3">
              <span className="font-mono text-teal-400 shrink-0">{n}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {transactions.length > 0 && (
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
                        {tx.kind === "withdraw" ? "-" : "+"}{usd(tx.amount, 6)}
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
      )}
    </div>
  );
}
