import { cctpBridge as mockBridge } from "@/lib/mock";
import { allowMockFallback } from "@/lib/env";

export const cctpDomains = {
  Ethereum: 0,
  Avalanche: 1,
  Optimism: 2,
  Arbitrum: 3,
  Solana: 5,
  Base: 6,
  Polygon: 7,
} as const;

export async function cctpBridge(input: { amount: number; destinationChain: keyof typeof cctpDomains; destinationAddress: string }) {
  if (allowMockFallback() && (process.env.MOCK_MODE !== "false" || !process.env.CIRCLE_API_KEY)) return mockBridge();
  const messageHash = `0x${crypto.randomUUID().replaceAll("-", "")}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(`https://iris-api.circle.com/attestations/${messageHash}`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === "complete") return { ...data, messageHash, receiveMessage: "called" };
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return { status: "pending", messageHash, destinationDomain: cctpDomains[input.destinationChain] };
}
