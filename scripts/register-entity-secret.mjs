/**
 * Registers your CIRCLE_ENTITY_SECRET with Circle using the official SDK.
 * Run once: node scripts/register-entity-secret.mjs
 */

import { registerEntitySecretCiphertext } from "@circle-fin/developer-controlled-wallets";
import fs from "node:fs";
import path from "node:path";

// Load .env.local manually
const env = fs.readFileSync(".env.local", "utf8");
for (const line of env.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const eq = t.indexOf("=");
  const key = t.slice(0, eq);
  const val = t.slice(eq + 1).replace(/\s+#.*$/, "").trim();
  process.env[key] ||= val;
}

const API_KEY       = process.env.CIRCLE_API_KEY;
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET;

if (!API_KEY || !ENTITY_SECRET) {
  console.error("❌  CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not set in .env.local");
  process.exit(1);
}

const recoveryDir = path.resolve("circle-recovery");
fs.mkdirSync(recoveryDir, { recursive: true });

console.log("Registering entity secret with Circle...");

try {
  const result = await registerEntitySecretCiphertext({
    apiKey: API_KEY,
    entitySecret: ENTITY_SECRET,
    recoveryFileDownloadPath: recoveryDir,
  });

  console.log("\n✅  Entity secret registered successfully!");
  console.log("Response:", JSON.stringify(result, null, 2));
  console.log(`\nRecovery file saved to: ${recoveryDir}`);
  console.log("Store it securely — Circle cannot recover a lost entity secret.\n");
} catch (err) {
  const msg = err?.message ?? String(err);
  const body = JSON.stringify(err?.response?.data ?? err?.data ?? {});

  if (msg.includes("409") || msg.includes("already") || body.includes("already")) {
    console.log("\n✅  Entity secret is already registered — nothing to do.");
  } else {
    console.error("\n❌  Registration failed:", msg);
    if (body !== "{}") console.error("Details:", body);
    process.exit(1);
  }
}
