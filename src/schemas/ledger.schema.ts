import { z } from "zod";

export const AssetRecordSchema = z.object({
  assetId: z.string().min(1),
  promptHash: z.string().optional(),
  kind: z.enum(["image", "audio", "video", "subtitle"]),
  localPath: z.string(),
  remoteUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type AssetRecord = z.infer<typeof AssetRecordSchema>;

export const JobRecordSchema = z.object({
  jobId: z.string().min(1),
  idempotencyKey: z.string().min(1),
  projectId: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  attempts: z.number().int().nonnegative().default(0),
  lastError: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type JobRecord = z.infer<typeof JobRecordSchema>;

export const CreditLedgerEntrySchema = z.object({
  entryId: z.string().min(1),
  projectId: z.string().min(1),
  jobId: z.string().nullable().optional(),
  costCents: z.number().int().nonnegative(),
  provider: z.string().min(1),
  reason: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type CreditLedgerEntry = z.infer<typeof CreditLedgerEntrySchema>;
