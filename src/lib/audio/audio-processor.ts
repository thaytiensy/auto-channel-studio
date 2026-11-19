import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Windows fallback for fresh WinGet installations before terminal restart
if (process.platform === "win32") {
  const localApp = process.env.LOCALAPPDATA || "";
  const gyanBin = `${localApp}\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin`;
  if (localApp && !(process.env.PATH || "").includes(gyanBin)) {
    process.env.PATH = `${gyanBin};${process.env.PATH || ""}`;
  }
}

/**
 * Generates mock audio file for a given scene and returns its absolute path.
 */
export async function mockGenerateTTS(
  text: string,
  sceneId: string
): Promise<string> {
  const tmpDir = path.join(process.cwd(), "worker", "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });

  const fileName = `scene_${sceneId}.mp3`;
  const filePath = path.join(tmpDir, fileName);

  const mockPayload = `[MOCK_AUDIO_DATA_FOR_SCENE_${sceneId}]\nTimestamp: ${new Date().toISOString()}\nText: ${text}`;
  fs.writeFileSync(filePath, mockPayload, "utf-8");

  return filePath;
}

/**
 * Probes audio duration in milliseconds using ffprobe.
 * Catches errors on invalid media headers (e.g. mock files) and falls back safely to 3500ms.
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
      `[ffprobe] Expected non-media fallback for mock audio "${fileName}":`,
      err instanceof Error ? err.message : String(err)
    );
    return 3500;
  }
}
