import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/storage";
import { generateChannelScript } from "@/lib/ai/gemini-script";
import { generateSceneVisual } from "@/lib/ai/gemini-visual";
import {
  generateSceneSpeech,
  getAudioDurationMs,
} from "@/lib/audio/audio-processor";
import { ProjectManifestSchema, type ProjectManifest, type Scene } from "@/schemas";

const AutoVideoInputSchema = z.object({
  topic: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  channelId: z.string().optional(),
});

async function extractTopicFromUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(6000) });
    const html = await res.text();
    const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim().slice(0, 100);
    }
  } catch (e) {
    console.warn("[auto-video] Could not scrape title from URL:", e);
  }
  return `Xu hướng từ liên kết ${new URL(url).hostname}`;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const rawBody: unknown = await req.json();
    const { topic: rawTopic, sourceUrl, channelId: rawChannelId } = AutoVideoInputSchema.parse(rawBody);

    let finalTopic = rawTopic?.trim() || "";
    if (!finalTopic && sourceUrl) {
      finalTopic = await extractTopicFromUrl(sourceUrl);
    }
    if (!finalTopic) {
      return NextResponse.json({ error: "Cần cung cấp chủ đề (topic) hoặc đường link (sourceUrl)" }, { status: 400 });
    }

    const repo = getRepository();
    const channels = await repo.channels.list();
    let channel = rawChannelId ? await repo.channels.get(rawChannelId) : null;
    if (!channel) {
      channel = channels[0] ?? (await repo.channels.create({
        name: "Auto MXH Channel",
        niche: "Xu hướng & Đời sống số",
        brandVoice: "Nhanh gọn, cuốn hút, truyền cảm hứng",
        bannedWords: [],
        pastTopics: [],
      }));
    }

    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Sinh kịch bản AI
    const baseScenes = await generateChannelScript({
      projectId,
      channel,
      topic: finalTopic,
      aspectRatio: "9:16",
    });

    // 2. Tạo Audio Neural TTS & Ảnh AI Imagen per scene
    const completedScenes: Scene[] = await Promise.all(
      baseScenes.map(async (scene) => {
        const audioPath = await generateSceneSpeech({ text: scene.spokenText, sceneId: scene.sceneId });
        const actualDurationMs = await getAudioDurationMs(audioPath);
        const visualPrompt = scene.visualLayer?.visualPrompt || "";
        const assetPath = await generateSceneVisual({ visualPrompt, sceneId: scene.sceneId, aspectRatio: "9:16" });

        const sc: Scene = {
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
        return sc;
      })
    );

    const project: ProjectManifest = ProjectManifestSchema.parse({
      schemaVersion: "2.0.0" as const,
      projectId,
      channelId: channel.id,
      title: finalTopic,
      mode: "faceless_hybrid" as const,
      aspectRatio: "9:16" as const,
      status: "rendering" as const,
      budgetGuard: { maxCostCents: 35, spentCents: 0 },
      scenes: completedScenes,
      createdAt: now,
      updatedAt: now,
    });
    await repo.projects.create(project);

    // 3. Gọi Worker render các cảnh và ghép video hoàn chỉnh
    const workerUrl = process.env.WORKER_URL || "http://127.0.0.1:4001";
    const workerRes = await fetch(`${workerUrl}/render-project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, scenes: completedScenes }),
      signal: AbortSignal.timeout(90000),
    });

    if (!workerRes.ok) {
      throw new Error("Render Worker gặp sự cố khi tạo video tự động");
    }

    await repo.projects.update({ ...project, status: "done", updatedAt: new Date().toISOString() });

    const totalDurationMs = completedScenes.reduce((acc, s) => acc + s.actualDurationMs, 0);
    const fixedLink = `/api/projects/download/${projectId}`;

    return NextResponse.json({
      status: "success",
      projectId,
      title: finalTopic,
      videoUrl: fixedLink,
      downloadUrl: fixedLink,
      durationMs: totalDurationMs,
      scenesCount: completedScenes.length,
      createdAt: now,
    }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Lỗi tự động tạo video";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
