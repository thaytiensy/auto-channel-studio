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

function getFallbackScenes(topic: string, channel: ChannelProfile): RawGeneratedScene[] {
  const safeTopic = topic.trim();
  return [
    {
      spokenText: `Bạn đã biết điều đặc biệt này về ${safeTopic} chưa? Hãy cùng khám phá ngay bí quyết mà rất nhiều người đang quan tâm.`,
      textHook: "Bí Mật Bất Ngờ",
      visualPrompt: `Cinematic vertical shot symbolizing ${safeTopic}, dramatic lighting, 8k photorealistic`,
      motionPreset: "zoom_in",
    },
    {
      spokenText: `Trong ngách ${channel.niche}, phong cách ${channel.brandVoice} sẽ giúp bạn nắm bắt cơ hội nhanh hơn bao giờ hết.`,
      textHook: "Xu Hướng Đột Phá",
      visualPrompt: `Modern high-tech workspace showing dynamics of ${safeTopic}, depth of field, 8k`,
      motionPreset: "pan_right",
    },
    {
      spokenText: `Điểm mấu chốt là áp dụng quy trình chuẩn từng bước mỗi ngày để đạt hiệu quả tối đa và tiết kiệm thời gian.`,
      textHook: "Giải Pháp Tối Ưu",
      visualPrompt: `Inspirational cinematic composition of success in ${safeTopic}, golden hour lighting`,
      motionPreset: "zoom_in",
    },
    {
      spokenText: `Hãy lưu ngay video này lại để thực hành. Đừng quên nhấn theo dõi để cập nhật thêm nhiều nội dung giá trị nhé!`,
      textHook: "Lưu Lại & Theo Dõi",
      visualPrompt: `Futuristic sleek aesthetic glowing interface, clean ultra HD background, 8k`,
      motionPreset: "pan_right",
    },
  ];
}

async function fetchFromGemini(
  apiKey: string,
  modelName: string,
  topic: string,
  channel: ChannelProfile
): Promise<RawGeneratedScene[]> {
  const ai = new GoogleGenAI({ apiKey });
  const bannedList = channel.bannedWords.length > 0 ? channel.bannedWords.join(", ") : "không có";
  const systemInstruction = `Bạn là biên kịch video ngắn chuyên nghiệp cho kênh "${channel.name}".
Chủ đề kênh: ${channel.niche}. Giọng điệu: ${channel.brandVoice}.
Tạo kịch bản 4 phân cảnh tiếng Việt tự nhiên (20-35 từ mỗi cảnh), có hook dưới 7 từ, visualPrompt bằng tiếng Anh.
TUYỆT ĐỐI KHÔNG chứa từ nào trong: [${bannedList}].`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Chủ đề: "${topic}". Hãy tạo kịch bản 4 phân cảnh hoàn chỉnh.`,
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
                motionPreset: { type: Type.STRING, enum: ["zoom_in", "pan_right"] },
              },
              required: ["spokenText", "textHook", "visualPrompt", "motionPreset"],
            },
          },
        },
        required: ["scenes"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini rỗng");
  const parsed = JSON.parse(text) as { scenes: RawGeneratedScene[] };
  return parsed.scenes;
}

export async function generateChannelScript({
  projectId,
  channel,
  topic,
  aspectRatio = "9:16",
}: GenerateScriptParams): Promise<Scene[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_SCRIPT_MODEL || "gemini-2.5-flash";

  let rawScenes: RawGeneratedScene[] = [];
  if (apiKey && apiKey.trim()) {
    try {
      rawScenes = await fetchFromGemini(apiKey, modelName, topic, channel);
    } catch (err) {
      console.warn("[gemini-script] Gemini call failed, using intelligent fallback:", err);
      rawScenes = getFallbackScenes(topic, channel);
    }
  } else {
    rawScenes = getFallbackScenes(topic, channel);
  }

  const safeZoneProfile = aspectRatio === "9:16" ? "tiktok_reels_9_16" : "youtube_16_9";

  return rawScenes.map((rawScene, index) => {
    const sceneId = crypto.randomUUID();
    const assetId = crypto.randomUUID();
    const promptHash = crypto.createHash("sha256").update(rawScene.visualPrompt).digest("hex");

    return {
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
  });
}
