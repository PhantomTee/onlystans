# OnlyStans

OnlyStans is a pay-per-second decentralized creator monetization demo. Viewers connect a wallet on Arc Network, load a mocked Circle embedded wallet with USDC, and pay creators in tiny sponsored USDC transfers while video playback is active.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment

`.env.local` is scaffolded with empty credentials and `MOCK_MODE=true`. Add real keys before live mode:

- `OPENROUTER_API_KEY` for the auto-tagging agent.
- `CIRCLE_API_KEY` and `CIRCLE_ENTITY_SECRET` for Wallets, Nanopayments, Paymaster transfers, and CCTP.
- `PINATA_JWT` for IPFS uploads.
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`, `NEXT_PUBLIC_ARC_RPC_URL`, and `NEXT_PUBLIC_ARC_CHAIN_ID` for wallet connection on Arc Testnet. Defaults are RPC `https://rpc.testnet.arc.network`, chain ID `5042002`, and gas token `USDC`.
- `NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS` and `NEXT_PUBLIC_PAYMASTER_ADDRESS` after contract deployment.
- `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_APP_URL` before production deployment.
- `DEPLOYER_PRIVATE_KEY` only for `pnpm deploy:contract`; never set it as a public variable.

When a key is absent, service wrappers fall back to mock responses so the full product flow remains demoable.

## Demo Payment Flow

1. Visit the feed and open any video.
2. Connect a wallet with RainbowKit. The app is configured for Arc Testnet.
3. Press play. `/api/payments/stream/start` creates a stream session.
4. Every 10 seconds of playback, the player posts `/api/payments/stream/heartbeat` with `elapsed * ratePerSecond`.
5. The ticker updates after each heartbeat. Pausing the video or hiding the tab pauses settlement. Ending the video closes the stream and sends a final fractional heartbeat.
6. Use the tip button for one-time sponsored USDC nanopayments.

## Creator Flow

- Upload accepts MP4 files up to 100 MB.
- `/api/agent/tag` uses OpenRouter in live mode or filename-derived tags in mock mode.
- `/api/upload` sends files to Pinata in live mode or returns a mock CID and Big Buck Bunny demo source in mock mode.
- Publishing simulates ContentRegistry registration and returns a mock transaction hash unless live contract details are configured.
- The creator dashboard shows lifetime, 24h, 7d, per-video earnings, live viewer counts, and a CCTP withdrawal modal.

## Contracts

`contracts/ContentRegistry.sol` contains the requested registry contract.

Fresh Arc Testnet deployer generated for this build:

- Address: `0x240E9bF2a0BF9Ee3453EeE462316DF4D421789a5`
- Private key: `0xe6aea4c9f8bcdd4382108e4aedd774d1e09305c064ac1eb59e20ba714198dd35`

Use it only for testnet deployment. After funding the address from the Arc faucet, run:

```bash
$env:DEPLOYER_PRIVATE_KEY="0xe6aea4c9f8bcdd4382108e4aedd774d1e09305c064ac1eb59e20ba714198dd35"
pnpm deploy:contract
```

Then copy the printed address into `NEXT_PUBLIC_CONTENT_REGISTRY_ADDRESS`.

## Supabase

Paste [supabase.sql](./supabase.sql) into Supabase SQL Editor and run it once. Then set `DATABASE_URL` to the Supabase pooled connection string. The app uses Postgres when `DATABASE_URL` exists and falls back to local mock state otherwise.

## Checks

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test
pnpm build
pnpm check
pnpm check:production-env
pnpm dev
```

The app is intentionally self-contained in `MOCK_MODE=true`; no API keys are required to browse, watch, stream mock payments, upload, auto-tag, or withdraw.

## Production Hardening Included

- Request payload validation with Zod.
- Same-origin checks for mutating API routes.
- In-memory rate limits for high-risk routes.
- Server-side stream accounting. The client sends a session ID; the server calculates owed USDC from trusted timestamps.
- Idempotency keys for heartbeats to prevent duplicate billing.
- Balance caps on stream settlement.
- Fractional settlement on pause and stop.
- Production environment check script that blocks missing credentials or accidental `MOCK_MODE=true`.
- Unit tests for stream accounting, idempotency, pause behavior, and balance caps.

## Still Requires Your Live Infrastructure

These are intentionally scaffolded but cannot be completed without credentials or deployed resources:

- Real database provisioning and migration behind `DATABASE_URL`.
- Live Circle Wallet/Nanopayment/CCTP credentials and webhook reconciliation.
- Pinata JWT and production gateway configuration.
- OpenRouter API key.
- WalletConnect project ID.
- Deployed `ContentRegistry` address and Paymaster address on Arc Testnet.
- Production auth provider or signed wallet-login policy tied to `SESSION_SECRET`.
