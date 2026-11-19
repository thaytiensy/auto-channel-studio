import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { getWorkerTmpDir } from "@/lib/storage/paths";

export interface GenerateVisualParams {
  visualPrompt: string;
  sceneId: string;
  aspectRatio?: "9:16" | "16:9";
}

/**
 * Generates a cinematic image for a scene using Gemini Image Model (Imagen 3).
 * Includes automatic quota fallback: catches 400/403/429 or missing key errors
 * and gracefully returns an empty string so the worker uses elegant fallback visuals.
 */
export async function generateSceneVisual({
  visualPrompt,
  sceneId,
  aspectRatio = "9:16",
}: GenerateVisualParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim() || !visualPrompt || !visualPrompt.trim()) {
    return "";
  }

  const tmpDir = getWorkerTmpDir();
  fs.mkdirSync(tmpDir, { recursive: true });
  const outPath = path.join(tmpDir, `${sceneId}.png`);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model =
      process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-002";

    const response = await ai.models.generateImages({
      model,
      prompt: visualPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio === "16:9" ? "16:9" : "9:16",
        outputMimeType: "image/png",
      },
    });

    const generated = response.generatedImages?.[0];
    const imageBytes = generated?.image?.imageBytes;

    if (!imageBytes) {
      console.warn(
        `[gemini-visual] No image bytes returned for scene ${sceneId}`
      );
      return "";
    }

    const buffer = Buffer.from(imageBytes, "base64");
    if (buffer.length <= 1024) {
      console.warn(
        `[gemini-visual] Image output too small (${buffer.length} bytes)`
      );
      return "";
    }

    fs.writeFileSync(outPath, buffer);
    return outPath;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[gemini-visual] Image generation fallback for scene ${sceneId}: ${msg}`
    );
    return "";
  }
}
