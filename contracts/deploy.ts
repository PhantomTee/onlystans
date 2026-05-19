import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcNetwork } from "@/lib/chains";

const abi = parseAbi([
  "function registerVideo(bytes32 videoId,string ipfsCid,string thumbnailCid,uint256 ratePerSecond)",
  "function recordEarning(bytes32 videoId,uint256 amount)",
  "function getCreatorVideos(address creator) view returns (bytes32[])",
]);

export async function getContentRegistryClient() {
  if (!process.env.DEPLOYER_PRIVATE_KEY || !process.env.NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS) {
    return { mode: "MOCK_MODE", address: process.env.NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS || "ADD AFTER DEPLOY", abi };
  }
  const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`);
  return createWalletClient({ account, chain: arcNetwork, transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL) });
}
