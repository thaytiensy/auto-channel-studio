import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { buildSceneAssFile } from "./subtitle-builder.mjs";
import {
  escapeAssFilterPath,
  buildKenBurnsFilter,
} from "./ffmpeg-filters.mjs";

const execFileAsync = promisify(execFile);

if (process.platform === "win32") {
  const localApp = process.env.LOCALAPPDATA || "";
  const gyanBin = `${localApp}\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin`;
  if (localApp && !(process.env.PATH || "").includes(gyanBin)) {
    process.env.PATH = `${gyanBin};${process.env.PATH || ""}`;
  }
}

export async function hasValidMediaHeader(filePath) {
  if (!filePath || typeof filePath !== "string" || !fs.existsSync(filePath)) {
    return false;
  }
  try {
    const stat = fs.statSync(filePath);
    if (stat.size <= 512) return false;

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
      { timeout: 3000 }
    );
    const sec = parseFloat(stdout.trim());
    return !isNaN(sec) && sec > 0;
  } catch {
    return false;
  }
}

function hasValidImage(filePath) {
  if (!filePath || typeof filePath !== "string" || !fs.existsSync(filePath)) {
    return false;
  }
  try {
    return fs.statSync(filePath).size > 1024;
  } catch {
    return false;
  }
}

export async function renderSceneMp4({
  sceneId,
  durationMs = 3500,
  audioPath = "",
  visualPath = "",
  outputDir,
  spokenText = "",
  textHook = "",
}) {
  if (!sceneId) {
    throw new Error("sceneId is required for renderSceneMp4");
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const durationSec = Math.max(1, Number((durationMs / 1000).toFixed(3)));
  const outputPath = path.join(outputDir, `${sceneId}.mp4`);

  const validAudio = await hasValidMediaHeader(audioPath);
  const audioArgs = validAudio
    ? ["-i", audioPath]
    : ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"];

  const assPath = buildSceneAssFile({
    sceneId,
    spokenText,
    textHook,
    durationMs,
    outputDir,
  });

  const validImage = hasValidImage(visualPath);
  let visualArgs;
  let videoFilter;

  if (validImage) {
    visualArgs = ["-loop", "1", "-i", visualPath];
    videoFilter = buildKenBurnsFilter({ durationSec, assPath });
  } else {
    visualArgs = [
      "-f",
      "lavfi",
      "-i",
      `color=c=#0f172a:s=1080x1920:r=30:d=${durationSec}`,
    ];
    videoFilter = escapeAssFilterPath(assPath);
  }

  const ffmpegArgs = [
    ...visualArgs,
    ...audioArgs,
    "-t",
    String(durationSec),
    "-vf",
    videoFilter,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    "-y",
    outputPath,
  ];

  await execFileAsync("ffmpeg", ffmpegArgs, { timeout: 45000 });

  if (!fs.existsSync(outputPath)) {
    throw new Error(`Output file not generated: ${outputPath}`);
  }

  return {
    videoPath: outputPath,
    assPath,
    hasImage: validImage,
    usedSilentFallback: !validAudio,
  };
}
