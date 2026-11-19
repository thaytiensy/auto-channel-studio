import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { renderSceneMp4 } from "./render-scene.mjs";

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
 * Concatenates all project scenes sequentially into a final 1080x1920 MP4 file.
 * Automatically renders missing or incomplete scene MP4s before concat.
 */
export async function concatProjectMp4({ projectId, scenes, outputDir }) {
  if (!projectId || !Array.isArray(scenes) || scenes.length === 0) {
    throw new Error("projectId and non-empty scenes array are required");
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const sortedScenes = [...scenes].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  const scenePaths = [];

  // Guarantee each scene MP4 exists and is valid (> 1024 bytes)
  for (const scene of sortedScenes) {
    const scenePath = path.join(outputDir, `${scene.sceneId}.mp4`);
    let needsRender = true;

    if (fs.existsSync(scenePath)) {
      try {
        const stat = fs.statSync(scenePath);
        if (stat.size > 1024) {
          needsRender = false;
        }
      } catch {
        needsRender = true;
      }
    }

    if (needsRender) {
      await renderSceneMp4({
        sceneId: scene.sceneId,
        durationMs: scene.actualDurationMs || 3500,
        audioPath: scene.audioPath || "",
        visualPath: scene.visualLayer?.assetPath || "",
        spokenText: scene.spokenText || "",
        textHook: scene.textHook || "",
        outputDir,
      });
    }

    scenePaths.push(scenePath);
  }

  // Create temporary concat demuxer text file
  const concatListPath = path.join(outputDir, `${projectId}_concat.txt`);
  const listContent = scenePaths
    .map((sp) => {
      const normalizedPosixPath = sp.replace(/\\/g, "/");
      return `file '${normalizedPosixPath}'`;
    })
    .join("\n");

  fs.writeFileSync(concatListPath, listContent, "utf-8");

  const finalOutputPath = path.join(outputDir, `${projectId}_final.mp4`);

  const ffmpegArgs = [
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    "-y",
    finalOutputPath,
  ];

  try {
    await execFileAsync("ffmpeg", ffmpegArgs, { timeout: 60000 });
  } finally {
    try {
      if (fs.existsSync(concatListPath)) {
        fs.unlinkSync(concatListPath);
      }
    } catch {
      // Ignore temporary file cleanup errors
    }
  }

  if (!fs.existsSync(finalOutputPath)) {
    throw new Error(`Concat completed but output not found: ${finalOutputPath}`);
  }

  return {
    finalVideoPath: finalOutputPath,
    totalScenes: sortedScenes.length,
  };
}
