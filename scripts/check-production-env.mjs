import fs from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1).replace(/\s+#.*$/, "");
    process.env[key] ||= value;
  }
}

const required = [
  "OPENROUTER_API_KEY",
  "CIRCLE_API_KEY",
  "CIRCLE_ENTITY_SECRET",
  "PINATA_JWT",
  "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
  "NEXT_PUBLIC_ARC_RPC_URL",
  "NEXT_PUBLIC_ARC_CHAIN_ID",
  "NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS",
  "NEXT_PUBLIC_PAYMASTER_ADDRESS",
  "DATABASE_URL",
  "SESSION_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

if (process.env.MOCK_MODE !== "false") {
  console.error("Production check failed: MOCK_MODE must be false.");
  process.exit(1);
}

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Production check failed: missing ${missing.join(", ")}.`);
  process.exit(1);
}

console.log("Production environment check passed.");
