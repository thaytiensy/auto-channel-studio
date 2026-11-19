import { z } from "zod";

export const WordTimestampSchema = z.object({
  word: z.string(),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
});

export type WordTimestamp = z.infer<typeof WordTimestampSchema>;

export const VisualLayerSchema = z.object({
  sourceType: z.enum([
    "ai_image_ken_burns",
    "stock_video",
    "ai_video",
    "real_footage",
  ]),
  assetId: z.string().optional(),
  assetPath: z.string().optional(),
  visualPrompt: z.string().optional().default(""),
  motionPreset: z.string().optional(),
  promptHash: z.string().optional(),
});

export type VisualLayer = z.infer<typeof VisualLayerSchema>;

export const SceneSchema = z.object({
  sceneId: z.string().min(1),
  projectId: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  lockStatus: z.enum(["draft", "approved", "locked"]),
  spokenText: z.string(),
  audioPath: z.string().nullable().optional(),
  actualDurationMs: z.number().nonnegative().default(0),
  wordTimestamps: z.array(WordTimestampSchema).default([]),
  visualLayer: VisualLayerSchema.optional(),
  textHook: z.string().optional(),
  safeZoneProfile: z.enum(["tiktok_reels_9_16", "youtube_16_9"]),
});

export type Scene = z.infer<typeof SceneSchema>;
