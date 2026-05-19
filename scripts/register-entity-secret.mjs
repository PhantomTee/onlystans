/**
 * Registers the CIRCLE_ENTITY_SECRET with Circle by encrypting it with
 * Circle's RSA public key and POSTing the ciphertext.
 * Run once: node scripts/register-entity-secret.mjs
 */

import { createPublicKey, publicEncrypt, constants } from "node:crypto";
import fs from "node:fs";

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
const BASE          = "https://api.circle.com";

if (!API_KEY || !ENTITY_SECRET) {
  console.error("CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not set in .env.local");
  process.exit(1);
}

console.log("Fetching Circle public key...");
const pkResp = await fetch(`${BASE}/v1/w3s/config/entity/publicKey`, {
  headers: { Authorization: `Bearer ${API_KEY}` },
});

if (!pkResp.ok) {
  const text = await pkResp.text();
  console.error("Failed to fetch public key:", pkResp.status, text);
  process.exit(1);
}

const pkJson      = await pkResp.json();
const publicKeyPem = pkJson.data?.publicKey ?? pkJson.publicKey;
if (!publicKeyPem) {
  console.error("Unexpected public key response:", JSON.stringify(pkJson, null, 2));
  process.exit(1);
}
console.log("Got Circle public key.");

// Encrypt entity secret with RSA-OAEP-SHA256
const pubKey    = createPublicKey(publicKeyPem);
const encrypted = publicEncrypt(
  { key: pubKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
  Buffer.from(ENTITY_SECRET, "hex"),
);
const ciphertext = encrypted.toString("base64");
console.log("Ciphertext computed, registering with Circle...");

const regResp = await fetch(`${BASE}/v1/w3s/config/entity/secretciphertext`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ entitySecretCiphertext: ciphertext }),
});

const regJson = await regResp.json();

if (!regResp.ok) {
  console.error("Registration failed:", regResp.status, JSON.stringify(regJson, null, 2));
  process.exit(1);
}

console.log("\n✅ Entity secret registered successfully with Circle.");
console.log("Response:", JSON.stringify(regJson, null, 2));

// Save a local recovery file
fs.mkdirSync("circle-recovery", { recursive: true });
fs.writeFileSync(
  "circle-recovery/recovery.json",
  JSON.stringify({ entitySecret: ENTITY_SECRET, registeredAt: new Date().toISOString() }, null, 2),
);
console.log("\nRecovery file saved to circle-recovery/recovery.json — store this securely.");
