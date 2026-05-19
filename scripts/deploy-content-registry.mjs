import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const rpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";
const chainId = Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || "5042002");
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!privateKey) {
  console.error("Missing DEPLOYER_PRIVATE_KEY. Fund the generated test wallet, then set DEPLOYER_PRIVATE_KEY before running.");
  process.exit(1);
}

const contractPath = path.resolve("contracts/ContentRegistry.sol");
const source = fs.readFileSync(contractPath, "utf8");
const input = {
  language: "Solidity",
  sources: {
    "ContentRegistry.sol": { content: source },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors?.filter((item) => item.severity === "error") || [];
if (errors.length > 0) {
  console.error(errors.map((item) => item.formattedMessage).join("\n"));
  process.exit(1);
}

const compiled = output.contracts["ContentRegistry.sol"].ContentRegistry;
const abi = compiled.abi;
const bytecode = `0x${compiled.evm.bytecode.object}`;
const account = privateKeyToAccount(privateKey);
const chain = {
  id: chainId,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [rpcUrl] } },
};

const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });

try {
  const remoteChainId = await publicClient.getChainId();
  if (remoteChainId !== chainId) {
    throw new Error(`RPC returned chain ID ${remoteChainId}, expected ${chainId}.`);
  }
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Deploying ContentRegistry from ${account.address} to Arc Testnet (${chainId}). Balance: ${balance.toString()} wei.`);
  const hash = await walletClient.deployContract({ abi, bytecode, account });
  console.log(`Transaction hash: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  fs.mkdirSync(path.resolve("contracts/abi"), { recursive: true });
  fs.writeFileSync(path.resolve("contracts/abi/ContentRegistry.json"), JSON.stringify(abi, null, 2));

  console.log(`ContentRegistry deployed: ${receipt.contractAddress}`);
  console.log(`Set NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS=${receipt.contractAddress}`);
} catch (error) {
  console.error(`Contract deployment failed: ${error.shortMessage || error.message}`);
  if (error.cause?.cause?.code) console.error(`Cause: ${error.cause.cause.code}`);
  process.exit(1);
}
