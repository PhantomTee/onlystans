/**
 * Seeds demo videos into Supabase.
 * Run: node scripts/seed-videos.mjs
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";

// Load .env.local
const env = readFileSync(".env.local", "utf8");
for (const line of env.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#") || !t.includes("=")) continue;
  const eq = t.indexOf("=");
  process.env[t.slice(0, eq)] ||= t.slice(eq + 1).replace(/\s+#.*$/, "").trim();
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

await sql`
  insert into public.videos (
    id, creator_id, title, description, tags,
    video_cid, thumbnail_cid, video_src, thumbnail_src,
    rate_per_second, total_earned, total_watch_seconds, live_viewers
  ) values
    ('vid_arcflow_001','00000000-0000-0000-0000-000000000001','Arc Flow Warmup','A crisp movement study with pay-per-second creator support.',array['movement','studio','arc'],'bafybeimockarcflow','bafybeimockthumb1','https://www.w3schools.com/html/mov_bbb.mp4','data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3EArc Flow Warmup%3C/text%3E%3C/svg%3E',0.000001,12.431202,18420,7),
    ('vid_noads_002','00000000-0000-0000-0000-000000000002','No Ads Cut','A creator-first clip about direct USDC attention streams.',array['essay','creator','usdc'],'bafybeimocknoads','bafybeimockthumb2','https://www.w3schools.com/html/mov_bbb.mp4','data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3ENo Ads Cut%3C/text%3E%3C/svg%3E',0.000010,42.100040,32110,12),
    ('vid_micro_003','00000000-0000-0000-0000-000000000003','Micro Price Test','A premium workflow demo priced by the second.',array['tutorial','wallet','payments'],'bafybeimockmicro','bafybeimockthumb3','https://www.w3schools.com/html/mov_bbb.mp4','data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3EMicro Price Test%3C/text%3E%3C/svg%3E',0.000100,103.987654,55120,3),
    ('vid_cctp_004','00000000-0000-0000-0000-000000000004','CCTP Studio Payout','A behind-the-scenes look at cross-chain creator withdrawal flows.',array['cctp','withdraw','infra'],'bafybeimockcctp','bafybeimockthumb4','https://www.w3schools.com/html/mov_bbb.mp4','data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3ECCTP Studio Payout%3C/text%3E%3C/svg%3E',0.001000,331.442001,8450,1),
    ('vid_pinata_005','00000000-0000-0000-0000-000000000005','Pinata Clip Drop','A tiny video release stored on IPFS and monetized live.',array['ipfs','publishing','clip'],'bafybeimockpinata','bafybeimockthumb5','https://www.w3schools.com/html/mov_bbb.mp4','data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%2307110f%22/%3E%3Ctext x=%2288%22 y=%22525%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2264%22 font-weight=%22700%22%3EPinata Clip Drop%3C/text%3E%3C/svg%3E',0.000010,76.220091,44990,9)
  on conflict (id) do nothing
`;

console.log("✅ Videos seeded.");
await sql.end();
