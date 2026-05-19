import type { Creator, Transaction, Video } from "@/types";
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
};

function rowToVideo(row: DbVideoRow): Video {
  const creator: Creator = {
    handle: row.handle,
    name: row.display_name,
    avatar: row.avatar_initials,
    walletId: row.circle_wallet_id || `creator_wallet_${row.handle}`,
    walletAddress: row.wallet_address || mockVideos[0].creator.walletAddress,
    bio: row.bio,
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
      select v.*, p.handle, p.display_name, p.avatar_initials, p.bio, p.circle_wallet_id, p.wallet_address
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
      select v.*, p.handle, p.display_name, p.avatar_initials, p.bio, p.circle_wallet_id, p.wallet_address
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
