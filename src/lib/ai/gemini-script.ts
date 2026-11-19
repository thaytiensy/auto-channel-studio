import crypto from "node:crypto";
import { GoogleGenAI, Type } from "@google/genai";
import type { ChannelProfile, Scene } from "@/schemas";

export interface GenerateScriptParams {
  projectId: string;
  channel: ChannelProfile;
  topic: string;
  aspectRatio?: "9:16" | "16:9";
}

interface RawGeneratedScene {
  spokenText: string;
  textHook: string;
  visualPrompt: string;
  motionPreset: "zoom_in" | "pan_right";
}

interface RawResponse {
  scenes: RawGeneratedScene[];
}

export async function generateChannelScript({
  projectId,
  channel,
  topic,
  aspectRatio = "9:16",
}: GenerateScriptParams): Promise<Scene[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Chưa cấu hình GEMINI_API_KEY trong file .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_SCRIPT_MODEL || "gemini-2.5-flash";

  const bannedList =
    channel.bannedWords.length > 0
      ? channel.bannedWords.join(", ")
      : "không có";

  const systemInstruction = `Bạn là biên kịch video ngắn chuyên nghiệp cho kênh "${channel.name}".
Chủ đề kênh: ${channel.niche}.
Giọng văn/Phong cách: ${channel.brandVoice}.
Nhiệm vụ: Tạo kịch bản video ngắn (4-5 phân cảnh) bằng tiếng Việt thật tự nhiên, hấp dẫn, giữ chân người xem.
Mỗi phân cảnh bắt buộc gồm:
1. spokenText: Lời thoại tiếng Việt tự nhiên, ngắt nghỉ hợp lý để đọc lồng tiếng (20-35 từ mỗi cảnh).
2. textHook: Tiêu đề hoặc hook ngắn gọn trên màn hình (tối đa 7 từ).
3. visualPrompt: Mô tả chi tiết phong cách điện ảnh bằng tiếng Anh (cinematic, high quality, photorealistic, 8k) để tạo ảnh nền tương ứng.
4. motionPreset: Chọn "zoom_in" hoặc "pan_right".
QUY TẮC BẮT BUỘC: TUYỆT ĐỐI KHÔNG chứa bất kỳ từ nào trong danh sách từ cấm sau: [${bannedList}].`;

  const prompt = `Chủ đề video cần viết: "${topic}". Hãy tạo kịch bản 4-5 cảnh hoàn chỉnh.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                spokenText: { type: Type.STRING },
                textHook: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                motionPreset: {
                  type: Type.STRING,
                  enum: ["zoom_in", "pan_right"],
                },
              },
              required: [
                "spokenText",
                "textHook",
                "visualPrompt",
                "motionPreset",
              ],
            },
          },
        },
        required: ["scenes"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini không trả về nội dung kịch bản");
  }

  const parsed = JSON.parse(text) as RawResponse;
  if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
    throw new Error("Kịch bản tạo ra rỗng hoặc sai định dạng");
  }

  const safeZoneProfile =
    aspectRatio === "9:16" ? "tiktok_reels_9_16" : "youtube_16_9";

  return parsed.scenes.map((rawScene, index) => {
    const sceneId = crypto.randomUUID();
    const assetId = crypto.randomUUID();
    const promptHash = crypto
      .createHash("sha256")
      .update(rawScene.visualPrompt)
      .digest("hex");

    const scene: Scene = {
      sceneId,
      projectId,
      orderIndex: index,
      lockStatus: "draft",
      spokenText: rawScene.spokenText,
      audioPath: null,
      actualDurationMs: 0,
      wordTimestamps: [],
      textHook: rawScene.textHook,
      safeZoneProfile,
      visualLayer: {
        sourceType: "ai_image_ken_burns",
        assetId,
        motionPreset: rawScene.motionPreset,
        visualPrompt: rawScene.visualPrompt,
        promptHash,
      },
    };
    return scene;
  });
}
