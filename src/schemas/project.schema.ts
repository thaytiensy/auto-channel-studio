import { z } from "zod";
import { SceneSchema } from "./scene.schema";

export const BudgetGuardSchema = z.object({
  maxCostCents: z.number().int().nonnegative(),
  spentCents: z.number().int().nonnegative().default(0),
});

export type BudgetGuard = z.infer<typeof BudgetGuardSchema>;

export const ProjectManifestSchema = z.object({
  schemaVersion: z.literal("2.0.0"),
  projectId: z.string().min(1),
  channelId: z.string().min(1),
  title: z.string().min(1),
  mode: z.enum(["faceless_hybrid", "talking_head"]),
  aspectRatio: z.enum(["9:16", "16:9"]),
  status: z.enum([
    "draft",
    "script_ready",
    "audio_ready",
    "rendering",
    "done",
    "failed",
  ]),
  budgetGuard: BudgetGuardSchema,
  scenes: z.array(SceneSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
