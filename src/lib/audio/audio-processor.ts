import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const execFileAsync = promisify(execFile);

// Windows fallback for fresh WinGet installations before terminal restart
if (process.platform === "win32") {
  const localApp = process.env.LOCALAPPDATA || "";
  const gyanBin = `${localApp}\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin`;
  if (localApp && !(process.env.PATH || "").includes(gyanBin)) {
    process.env.PATH = `${gyanBin};${process.env.PATH || ""}`;
  }
}

export interface GenerateSpeechOptions {
  text: string;
  sceneId: string;
  voice?: string;
}

async function synthesizeToFile(
  text: string,
  outputPath: string,
  voice: string
): Promise<void> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(
    voice,
    OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
  );
  const { audioStream } = tts.toStream(text);

  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(outputPath);
    audioStream.pipe(fileStream);
    fileStream.on("finish", () => {
      fileStream.close();
      resolve();
    });
    audioStream.on("error", (err) => {
      fileStream.close();
      reject(err);
    });
    fileStream.on("error", reject);
  });
}

/**
 * Generates real Vietnamese neural speech using MsEdgeTTS with 1 retry.
 */
export async function generateSceneSpeech({
  text,
  sceneId,
  voice = "vi-VN-HoaiMyNeural",
}: GenerateSpeechOptions): Promise<string> {
  const tmpDir = path.join(process.cwd(), "worker", "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });

  const fileName = `${sceneId}.mp3`;
  const filePath = path.join(tmpDir, fileName);

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await synthesizeToFile(text, filePath, voice);
      const stat = fs.statSync(filePath);
      if (stat.size > 256) {
        return filePath;
      }
      throw new Error(`File âm thanh tạo ra quá nhỏ (${stat.size} bytes)`);
    } catch (err: unknown) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((res) => setTimeout(res, 600));
      }
    }
  }

  const detail =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Tạo giọng đọc thất bại cho cảnh ${sceneId}: ${detail}`);
}

/**
 * Legacy mock TTS generator preserved for compatibility.
 */
export async function mockGenerateTTS(
  text: string,
  sceneId: string
): Promise<string> {
  const tmpDir = path.join(process.cwd(), "worker", "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const filePath = path.join(tmpDir, `scene_${sceneId}.mp3`);
  const mockPayload = `[MOCK_AUDIO_FOR_SCENE_${sceneId}]\n${text}`;
  fs.writeFileSync(filePath, mockPayload, "utf-8");
  return filePath;
}

/**
 * Probes audio duration in milliseconds using ffprobe.
 */
export async function getAudioDurationMs(filePath: string): Promise<number> {
  try {
    const { stdout } = await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      { timeout: 4000 }
    );

    const seconds = parseFloat(stdout.trim());
    if (isNaN(seconds) || seconds <= 0) {
      return 3500;
    }
    return Math.round(seconds * 1000);
  } catch (err: unknown) {
    const fileName = path.basename(filePath);
    console.warn(
      `[ffprobe] Fallback for audio "${fileName}":`,
      err instanceof Error ? err.message : String(err)
    );
    return 3500;
  }
}
