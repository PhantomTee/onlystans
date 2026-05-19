import { z } from "zod";
import { cctpDomains } from "@/lib/cctp";

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Expected EVM address");
const safeId = z.string().min(1).max(128).regex(/^[a-zA-Z0-9_:-]+$/);
const amount = z.coerce.number().positive().max(10_000);
const rate = z.coerce.number().positive().max(0.01);

export const startStreamSchema = z.object({
  sessionId: safeId.optional(),
  videoId: safeId,
  viewerWalletId: z.string().min(1).max(128),
  creatorWalletId: address,
  ratePerSecond: rate,
  balance: z.coerce.number().nonnegative().optional(),
});

export const sessionSchema = z.object({
  sessionId: safeId,
});

export const heartbeatSchema = z.object({
  sessionId: safeId,
  idempotencyKey: z.string().min(8).max(160).optional(),
});

export const tipSchema = z.object({
  videoId: safeId,
  creatorWalletId: address,
  amount,
});

export const withdrawSchema = z.object({
  amount,
  destinationChain: z.enum(Object.keys(cctpDomains) as [keyof typeof cctpDomains, ...Array<keyof typeof cctpDomains>]),
  destinationAddress: z.string().min(1).max(128),
});

export const tagSchema = z.object({
  filename: z.string().min(1).max(180),
  notes: z.string().max(500).optional(),
});

export const videoCreateSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(200),
  tags: z.array(z.string().min(1).max(32)).min(1).max(5),
  ratePerSecond: rate,
  videoCid: z.string().min(1).max(140),
  thumbnailCid: z.string().min(1).max(140),
  src: z.string().url(),
});
