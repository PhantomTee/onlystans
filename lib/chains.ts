import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

const configuredChainId = Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || "5042002");
const configuredRpc     = process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";

export const arcNetwork = defineChain({
  id: Number.isFinite(configuredChainId) && configuredChainId > 0 ? configuredChainId : 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: [configuredRpc] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.network" },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [arcNetwork],
  connectors: [injected()],
  transports: {
    [arcNetwork.id]: http(configuredRpc),
  },
  ssr: true,
});
