import type { Creator, Subscription, Transaction, Video, ViewerWallet } from "@/types";
import { addTransaction, createVideo, getVideo, listTransactions, listVideos } from "@/lib/store";
import { getSql } from "@/lib/db";
import { mockVideos } from "@/lib/mock";

type DbVideoRow = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  video_cid: string;
  thumbnail_cid: string;
  video_src: string;
  thumbnail_src: string;
  rate_per_second: string;
  total_earned: string;
  total_watch_seconds: number;
  live_viewers: number;
  created_at: Date;
  handle: string;
  display_name: string;
  avatar_initials: string;
  bio: string;
  circle_wallet_id: string | null;
  wallet_address: string | null;
  is_paid_tier: boolean;
  subscription_price: string | null;
  creator_rate_per_second: string | null;
};

function rowToVideo(row: DbVideoRow): Video {
  const creator: Creator = {
    handle: row.handle,
    name: row.display_name,
    avatar: row.avatar_initials,
    walletId: row.circle_wallet_id || `creator_wallet_${row.handle}`,
    walletAddress: row.wallet_address || mockVideos[0].creator.walletAddress,
    bio: row.bio,
    isPaidTier: row.is_paid_tier ?? false,
    subscriptionPrice: row.subscription_price ? Number(row.subscription_price) : undefined,
    ratePerSecond: row.creator_rate_per_second ? Number(row.creator_rate_per_second) : undefined,
  };
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags: row.tags,
    videoCid: row.video_cid,
    thumbnailCid: row.thumbnail_cid,
    videoSrc: row.video_src,
    thumbnailSrc: row.thumbnail_src,
    ratePerSecond: Number(row.rate_per_second),
    totalEarned: Number(row.total_earned),
    totalWatchSeconds: row.total_watch_seconds,
    liveViewers: row.live_viewers,
    createdAt: row.created_at.toISOString(),
    creator,
  };
}

export async function listVideosRepo(sort = "trending") {
  const sql = getSql();
  if (!sql) return listVideos(sort);
  try {
    const order = sort === "cheapest" ? sql`v.rate_per_second asc` : sort === "new" ? sql`v.created_at desc` : sql`(v.live_viewers + (v.total_watch_seconds / 10000.0)) desc`;
    const rows = await sql<DbVideoRow[]>`
      select v.*, p.handle, p.display_name, p.avatar_initials, p.bio, p.circle_wallet_id,
             p.wallet_address, p.is_paid_tier, p.subscription_price,
             p.rate_per_second as creator_rate_per_second
      from videos v
      left join profiles p on p.id = v.creator_id
      where v.active = true
      order by ${order}
    `;
    return rows.length > 0 ? rows.map(rowToVideo) : listVideos(sort);
  } catch (error) {
    console.warn("Database video list failed, using mock fallback.", error);
    return listVideos(sort);
  }
}

export async function getVideoRepo(videoId: string) {
  const sql = getSql();
  if (!sql) return getVideo(videoId);
  try {
    const rows = await sql<DbVideoRow[]>`
      select v.*, p.handle, p.display_name, p.avatar_initials, p.bio, p.circle_wallet_id,
             p.wallet_address, p.is_paid_tier, p.subscription_price,
             p.rate_per_second as creator_rate_per_second
      from videos v
      left join profiles p on p.id = v.creator_id
      where v.id = ${videoId} and v.active = true
      limit 1
    `;
    return rows[0] ? rowToVideo(rows[0]) : getVideo(videoId);
  } catch (error) {
    console.warn("Database video read failed, using mock fallback.", error);
    return getVideo(videoId);
  }
}

export async function createVideoRepo(input: Parameters<typeof createVideo>[0]) {
  const sql = getSql();
  if (!sql) return createVideo(input);
  const video = createVideo(input);
  try {
    await sql`
      insert into videos (
        id, creator_id, title, description, tags, video_cid, thumbnail_cid, video_src, thumbnail_src, rate_per_second
      ) values (
        ${video.id},
        '00000000-0000-0000-0000-000000000001',
        ${video.title},
        ${video.description},
        ${video.tags},
        ${video.videoCid},
        ${video.thumbnailCid},
        ${video.videoSrc},
        ${video.thumbnailSrc},
        ${video.ratePerSecond}
      )
    `;
  } catch (error) {
    console.warn("Database video insert failed, kept in local fallback store.", error);
  }
  return video;
}

export async function addTransactionRepo(tx: Transaction) {
  const sql = getSql();
  if (!sql) return addTransaction(tx);
  try {
    await sql`
      insert into payment_events (idempotency_key, session_id, kind, amount, tx_hash, status)
      values (${tx.id}, ${tx.kind === "stream" ? tx.id.split(":")[0] : null}, ${tx.kind}, ${tx.amount}, ${tx.txHash}, 'settled')
      on conflict (idempotency_key) do nothing
    `;
  } catch (error) {
    console.warn("Database transaction insert failed, kept in local fallback store.", error);
  }
  return addTransaction(tx);
}

// ── Creator profile ───────────────────────────────────────────────────────────
export async function getCreatorByHandleRepo(handle: string) {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql<Array<{
      handle: string; display_name: string; avatar_initials: string; bio: string;
      circle_wallet_id: string | null; wallet_address: string | null;
      is_paid_tier: boolean; subscription_price: string | null; rate_per_second: string | null;
    }>>`
      select handle, display_name, avatar_initials, bio, circle_wallet_id, wallet_address,
             is_paid_tier, subscription_price, rate_per_second
      from profiles where handle = ${handle} limit 1
    `;
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      handle: r.handle, name: r.display_name, avatar: r.avatar_initials, bio: r.bio,
      walletId: r.circle_wallet_id || `creator_wallet_${r.handle}`,
      walletAddress: r.wallet_address || "",
      isPaidTier: r.is_paid_tier,
      subscriptionPrice: r.subscription_price ? Number(r.subscription_price) : undefined,
      ratePerSecond: r.rate_per_second ? Number(r.rate_per_second) : 0.0001,
    } as Creator;
  } catch { return null; }
}

export async function updateCreatorTierRepo(handle: string, isPaidTier: boolean, subscriptionPrice: number | null, ratePerSecond: number) {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`
      update profiles set
        is_paid_tier       = ${isPaidTier},
        subscription_price = ${subscriptionPrice ?? null},
        rate_per_second    = ${ratePerSecond}
      where handle = ${handle}
    `;
  } catch (e) { console.warn("updateCreatorTierRepo failed", e); }
}

// ── Subscriptions ─────────────────────────────────────────────────────────────
export async function createSubscriptionRepo(input: {
  viewerId: string; creatorHandle: string; amountPaid: number; txHash: string; durationDays: number;
}) {
  const sql = getSql();
  const expiresAt = new Date(Date.now() + input.durationDays * 86_400_000).toISOString();
  if (!sql) return { id: crypto.randomUUID(), ...input, expiresAt };
  try {
    const rows = await sql<Array<{ id: string; expires_at: Date }>>`
      insert into subscriptions (viewer_id, creator_handle, amount_paid, tx_hash, expires_at)
      values (${input.viewerId}, ${input.creatorHandle}, ${input.amountPaid}, ${input.txHash}, ${expiresAt})
      on conflict do nothing
      returning id, expires_at
    `;
    return { id: rows[0]?.id ?? crypto.randomUUID(), expiresAt: rows[0]?.expires_at?.toISOString() ?? expiresAt };
  } catch (e) { console.warn("createSubscriptionRepo failed", e); return { id: crypto.randomUUID(), expiresAt }; }
}

export async function checkSubscriptionRepo(viewerId: string, creatorHandle: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    const rows = await sql<Array<{ id: string }>>`
      select id from subscriptions
      where viewer_id = ${viewerId} and creator_handle = ${creatorHandle} and expires_at > now()
      limit 1
    `;
    return rows.length > 0;
  } catch { return false; }
}

export async function listSubscriptionsRepo(viewerId: string): Promise<Subscription[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    const rows = await sql<Array<{ id: string; creator_handle: string; amount_paid: string; tx_hash: string; starts_at: Date; expires_at: Date }>>`
      select id, creator_handle, amount_paid, tx_hash, starts_at, expires_at
      from subscriptions where viewer_id = ${viewerId} and expires_at > now()
      order by expires_at asc
    `;
    return rows.map((r) => ({
      id: r.id, viewerId, creatorHandle: r.creator_handle,
      amountPaid: Number(r.amount_paid), txHash: r.tx_hash,
      startsAt: r.starts_at.toISOString(), expiresAt: r.expires_at.toISOString(),
    }));
  } catch { return []; }
}

// ── Follows ───────────────────────────────────────────────────────────────────
export async function toggleFollowRepo(viewerId: string, creatorHandle: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    const existing = await sql`
      select 1 from follows where viewer_id = ${viewerId} and creator_handle = ${creatorHandle}
    `;
    if (existing.length > 0) {
      await sql`delete from follows where viewer_id = ${viewerId} and creator_handle = ${creatorHandle}`;
      return false;
    } else {
      await sql`insert into follows (viewer_id, creator_handle) values (${viewerId}, ${creatorHandle}) on conflict do nothing`;
      return true;
    }
  } catch { return false; }
}

export async function checkFollowRepo(viewerId: string, creatorHandle: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    const rows = await sql`select 1 from follows where viewer_id = ${viewerId} and creator_handle = ${creatorHandle}`;
    return rows.length > 0;
  } catch { return false; }
}

export async function getFollowerCountRepo(creatorHandle: string): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;
  try {
    const rows = await sql<Array<{ count: string }>>`select count(*) as count from follows where creator_handle = ${creatorHandle}`;
    return Number(rows[0]?.count ?? 0);
  } catch { return 0; }
}

// ── Viewer balances ───────────────────────────────────────────────────────────
export async function getViewerBalanceRepo(walletId: string): Promise<ViewerWallet | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql<Array<{ viewer_wallet_id: string; circle_wallet_addr: string | null; balance: string; total_spent: string }>>`
      select * from viewer_balances where viewer_wallet_id = ${walletId} limit 1
    `;
    if (!rows[0]) return null;
    return { walletId, address: rows[0].circle_wallet_addr ?? "", balance: Number(rows[0].balance), totalSpent: Number(rows[0].total_spent) };
  } catch { return null; }
}

export async function upsertViewerBalanceRepo(walletId: string, address: string, balanceDelta: number) {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`
      insert into viewer_balances (viewer_wallet_id, circle_wallet_addr, balance)
      values (${walletId}, ${address}, ${balanceDelta})
      on conflict (viewer_wallet_id) do update
        set balance     = viewer_balances.balance + ${balanceDelta},
            total_spent = viewer_balances.total_spent + ${balanceDelta < 0 ? -balanceDelta : 0},
            updated_at  = now()
    `;
  } catch (e) { console.warn("upsertViewerBalanceRepo failed", e); }
}

export async function listTransactionsRepo(limit = 20) {
  const sql = getSql();
  if (!sql) return listTransactions(limit);
  try {
    const rows = await sql<Array<{ idempotency_key: string; kind: Transaction["kind"]; amount: string; tx_hash: string; created_at: Date }>>`
      select idempotency_key, kind, amount, tx_hash, created_at
      from payment_events
      order by created_at desc
      limit ${limit}
    `;
    return rows.map((row) => ({ id: row.idempotency_key, kind: row.kind, amount: Number(row.amount), txHash: row.tx_hash, createdAt: row.created_at.toISOString() }));
  } catch (error) {
    console.warn("Database transaction list failed, using mock fallback.", error);
    return listTransactions(limit);
  }
}
