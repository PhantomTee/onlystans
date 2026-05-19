# OnlyStans Assumptions

- Build date: 2026-05-17.
- Arc Testnet is the primary chain in Wagmi/RainbowKit: RPC `https://rpc.testnet.arc.network`, chain ID `5042002`, network name `Arc Testnet`, gas token `USDC`.
- `MOCK_MODE=true` is the default and enables a complete no-key demo for Circle Wallets, Circle Nanopayments, Pinata IPFS uploads, CCTP withdrawals, and OpenRouter tagging.
- Live mode is scaffolded behind the same service functions. Missing live credentials automatically fall back to mock responses instead of blocking the demo.
- Videos are limited to 100 MB on the upload screen.
- Demo session state is kept in browser memory/local state and API mock responses, not a durable database. Production would persist stream sessions, ledger entries, uploaded videos, and wallet mappings.
- Thumbnail generation uses a browser-side first-frame canvas capture when possible, with a generated placeholder fallback.
- Package versions are pinned by `pnpm-lock.yaml`; the generated app currently uses Next.js 16.2.6 with App Router while preserving the requested Next.js 14-style app directory architecture.
- The ContentRegistry Solidity contract records content metadata and aggregate earnings; in mock mode, publishing simulates registration and returns a fake transaction hash.
- Payment rates are denominated in USDC dollars per second and rendered to six decimal places for nanopayment accuracy.
- Paymaster behavior is represented in Circle transfer payloads with `fee.type = "sponsored"` so no ETH is required.
- API mutations use same-origin checks, schema validation, and in-memory rate limits. Production should replace the in-memory limiter with shared Redis or equivalent.
- Stream heartbeat amounts are calculated server-side from session timestamps and rate, not trusted from the browser.
- Current persistence is process-local for demo/development. A deployment that must survive cold starts or multiple instances needs `DATABASE_URL` wired to a durable database before `MOCK_MODE=false`.
- Production readiness check requires `MOCK_MODE=false`, live service credentials, `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_APP_URL`.
- Supabase schema lives in `supabase.sql`; RLS is enabled for public reads, and server-side writes should use the private database connection string from Vercel.
- Fresh Arc Testnet deployer address is `0x240E9bF2a0BF9Ee3453EeE462316DF4D421789a5`. It is a hot testnet key only.
