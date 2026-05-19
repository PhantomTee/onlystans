export function isMockMode() {
  return process.env.MOCK_MODE !== "false";
}

export function assertProductionReady() {
  if (process.env.NODE_ENV !== "production") return;
  const missing = [
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
  ].filter((key) => !process.env[key]);

  if (isMockMode()) {
    throw new Error("Production deploy blocked: MOCK_MODE must be false.");
  }

  if (missing.length > 0) {
    throw new Error(`Production deploy blocked: missing ${missing.join(", ")}.`);
  }
}

export function allowMockFallback() {
  return isMockMode() || process.env.NODE_ENV !== "production";
}
