import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type Scene,
} from "@/schemas";
import { getRepository } from "@/lib/storage";
import { scanScriptForBannedWords } from "@/lib/auditor/policy-scanner";
import {
  mockGenerateTTS,
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

    // Select a banned word to inject into scene 2 for policy scanner verification
    const injectedBannedWord =
      channel.bannedWords.length > 0 ? channel.bannedWords[0] : "lừa đảo";

    const baseScenes: Scene[] = [
      {
        sceneId: crypto.randomUUID(),
        projectId,
        orderIndex: 0,
        lockStatus: "draft",
        spokenText: `Chào mừng bạn đến với kênh ${channel.name}. Hôm nay chúng ta sẽ tìm hiểu về: ${topic}.`,
        actualDurationMs: 0,
        wordTimestamps: [],
        safeZoneProfile: "tiktok_reels_9_16",
        textHook: `Khám phá ${topic}`,
        visualLayer: {
          sourceType: "ai_image_ken_burns",
          motionPreset: "zoom_in",
          promptHash: "prompt_scene_0",
        },
      },
      {
        sceneId: crypto.randomUUID(),
        projectId,
        orderIndex: 1,
        lockStatus: "draft",
        spokenText: `Nhiều chuyên gia cảnh báo rằng đây có thể là một chiêu trò ${injectedBannedWord} rất tinh vi mà bạn cần hết sức cảnh giác.`,
        actualDurationMs: 0,
        wordTimestamps: [],
        safeZoneProfile: "tiktok_reels_9_16",
        textHook: "Cảnh báo quan trọng",
        visualLayer: {
          sourceType: "ai_image_ken_burns",
          motionPreset: "pan_left",
          promptHash: "prompt_scene_1",
        },
      },
      {
        sceneId: crypto.randomUUID(),
        projectId,
        orderIndex: 2,
        lockStatus: "draft",
        spokenText: `Hãy nhấn theo dõi để cập nhật thêm các phân tích chuyên sâu tiếp theo từ ${channel.name}!`,
        actualDurationMs: 0,
        wordTimestamps: [],
        safeZoneProfile: "tiktok_reels_9_16",
        textHook: "Đăng ký ngay",
        visualLayer: {
          sourceType: "ai_image_ken_burns",
          motionPreset: "zoom_out",
          promptHash: "prompt_scene_2",
        },
      },
    ];

    // Generate per-scene mock audio and probe duration via ffprobe
    const scenesWithAudio: Scene[] = await Promise.all(
      baseScenes.map(async (scene) => {
        const audioPath = await mockGenerateTTS(
          scene.spokenText,
          scene.sceneId
        );
        const actualDurationMs = await getAudioDurationMs(audioPath);
        return {
          ...scene,
          audioPath,
          actualDurationMs,
        };
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
      scenes: scenesWithAudio,
      createdAt: now,
      updatedAt: now,
    };

    const project: ProjectManifest = ProjectManifestSchema.parse(rawProject);
    await repo.projects.create(project);

    // Scan all spoken text for banned words
    const fullScript = project.scenes.map((s) => s.spokenText).join(" ");
    const policyWarnings = scanScriptForBannedWords(
      fullScript,
      channel.bannedWords.length > 0
        ? channel.bannedWords
        : [injectedBannedWord]
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
