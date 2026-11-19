import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type Scene,
} from "@/schemas";
import { getRepository } from "@/lib/storage";
import { scanScriptForBannedWords } from "@/lib/auditor/policy-scanner";
import { generateChannelScript } from "@/lib/ai/gemini-script";
import { generateSceneVisual } from "@/lib/ai/gemini-visual";
import {
  generateSceneSpeech,
  getAudioDurationMs,
} from "@/lib/audio/audio-processor";

const GenerateScriptInputSchema = z.object({
  channelId: z.string().min(1),
  topic: z.string().min(1),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const { channelId, topic } = GenerateScriptInputSchema.parse(rawBody);

    const repo = getRepository();
    const channel = await repo.channels.get(channelId);

    if (!channel) {
      return NextResponse.json(
        { error: `Không tìm thấy kênh với ID: ${channelId}` },
        { status: 404 }
      );
    }

    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Generate real script via Gemini API
    const baseScenes = await generateChannelScript({
      projectId,
      channel,
      topic,
      aspectRatio: "9:16",
    });

    // 2. Generate real audio and real visuals per scene
    const completedScenes: Scene[] = await Promise.all(
      baseScenes.map(async (scene) => {
        const audioPath = await generateSceneSpeech({
          text: scene.spokenText,
          sceneId: scene.sceneId,
        });
        const actualDurationMs = await getAudioDurationMs(audioPath);

        const visualPrompt = scene.visualLayer?.visualPrompt || "";
        const assetPath = await generateSceneVisual({
          visualPrompt,
          sceneId: scene.sceneId,
          aspectRatio: "9:16",
        });

        const completedScene: Scene = {
          ...scene,
          audioPath,
          actualDurationMs,
          visualLayer: {
            sourceType: "ai_image_ken_burns",
            assetId: scene.visualLayer?.assetId,
            motionPreset: scene.visualLayer?.motionPreset,
            promptHash: scene.visualLayer?.promptHash,
            visualPrompt,
            assetPath,
          },
        };
        return completedScene;
      })
    );

    const rawProject = {
      schemaVersion: "2.0.0" as const,
      projectId,
      channelId: channel.id,
      title: topic,
      mode: "faceless_hybrid" as const,
      aspectRatio: "9:16" as const,
      status: "script_ready" as const,
      budgetGuard: {
        maxCostCents: 35,
        spentCents: 0,
      },
      scenes: completedScenes,
      createdAt: now,
      updatedAt: now,
    };

    const project: ProjectManifest = ProjectManifestSchema.parse(rawProject);
    await repo.projects.create(project);

    // 3. Audit script for banned words
    const fullScript = project.scenes.map((s) => s.spokenText).join(" ");
    const policyWarnings = scanScriptForBannedWords(
      fullScript,
      channel.bannedWords
    );

    return NextResponse.json(
      { project, policyWarnings },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to generate script";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
