import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { renderSceneMp4 } from "./render-scene.mjs";
import { concatProjectMp4 } from "./concat-project.mjs";
import { cleanupTmpFiles } from "./cleanup.mjs";

const execFileAsync = promisify(execFile);
const HOST = "127.0.0.1";
const PORT = Number(process.env.WORKER_PORT) || 4001;

// Windows fallback for fresh WinGet installations before terminal restart
if (process.platform === "win32") {
  const localApp = process.env.LOCALAPPDATA || "";
  const gyanBin = `${localApp}\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin`;
  if (localApp && !(process.env.PATH || "").includes(gyanBin)) {
    process.env.PATH = `${gyanBin};${process.env.PATH || ""}`;
  }
}

/** In-flight lock set: holds sceneId or projectId while FFmpeg is running */
const activeLocks = new Set();

async function checkTool(cmd, args) {
  try {
    const { stdout } = await execFileAsync(cmd, args, { timeout: 3000 });
    return { ok: true, output: stdout };
  } catch (err) {
    return { ok: false, error: err?.message || "Execution failed" };
  }
}

async function getHealthStatus() {
  const [verFfmpeg, verFfprobe, encFfmpeg, fltFfmpeg] = await Promise.all([
    checkTool("ffmpeg", ["-version"]),
    checkTool("ffprobe", ["-version"]),
    checkTool("ffmpeg", ["-hide_banner", "-encoders"]),
    checkTool("ffmpeg", ["-hide_banner", "-filters"]),
  ]);
  const ffmpegLine = verFfmpeg.ok ? verFfmpeg.output.split("\n")[0].trim() : "NOT_FOUND";
  const ffprobeLine = verFfprobe.ok ? verFfprobe.output.split("\n")[0].trim() : "NOT_FOUND";
  const hasLibx264 = encFfmpeg.ok && encFfmpeg.output.includes("libx264");
  const hasAssFilter = fltFfmpeg.ok && /\bass\b/.test(fltFfmpeg.output);
  return {
    status: verFfmpeg.ok && verFfprobe.ok && hasLibx264 && hasAssFilter ? "ok" : "degraded",
    ffmpeg: ffmpegLine, ffprobe: ffprobeLine,
    libx264: hasLibx264, assFilter: hasAssFilter,
    timestamp: new Date().toISOString(),
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2e6) { req.destroy(); reject(new Error("Payload too large")); }
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function sendJson(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data));
}

function busyResponse(res) {
  sendJson(res, 409, { status: "busy", message: "Tiến trình render cho mục này đang chạy, vui lòng đợi xong." });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

  if (url.pathname === "/health" && req.method === "GET") {
    try {
      const health = await getHealthStatus();
      sendJson(res, health.status === "ok" ? 200 : 503, health);
    } catch (err) {
      sendJson(res, 500, { status: "error", error: String(err) });
    }
    return;
  }

  if (url.pathname === "/render-scene" && req.method === "POST") {
    let lockKey = null;
    try {
      const { sceneId, durationMs, audioPath, spokenText, textHook } =
        await readJsonBody(req);
      if (!sceneId || typeof sceneId !== "string") {
        sendJson(res, 400, { status: "error", message: "sceneId is required" });
        return;
      }
      lockKey = `scene:${sceneId}`;
      if (activeLocks.has(lockKey)) { busyResponse(res); return; }
      activeLocks.add(lockKey);

      const outputDir = path.join(process.cwd(), "worker", "tmp");
      const result = await renderSceneMp4({
        sceneId,
        durationMs: Number(durationMs) || 3500,
        audioPath: audioPath || "",
        spokenText: spokenText || "",
        textHook: textHook || "",
        outputDir,
      });
      sendJson(res, 200, { status: "ok", ...result });
    } catch (err) {
      sendJson(res, 500, { status: "error", message: err?.message || "Render failed" });
    } finally {
      if (lockKey) activeLocks.delete(lockKey);
    }
    return;
  }

  if (url.pathname === "/render-project" && req.method === "POST") {
    let lockKey = null;
    try {
      const { projectId, scenes } = await readJsonBody(req);
      if (!projectId || !Array.isArray(scenes) || scenes.length === 0) {
        sendJson(res, 400, { status: "error", message: "projectId and non-empty scenes array are required" });
        return;
      }
      lockKey = `project:${projectId}`;
      if (activeLocks.has(lockKey)) { busyResponse(res); return; }
      activeLocks.add(lockKey);

      const outputDir = path.join(process.cwd(), "worker", "tmp");
      const result = await concatProjectMp4({ projectId, scenes, outputDir });
      sendJson(res, 200, { status: "ok", ...result });
    } catch (err) {
      sendJson(res, 500, { status: "error", message: err?.message || "Project concat failed" });
    } finally {
      if (lockKey) activeLocks.delete(lockKey);
    }
    return;
  }

  if (url.pathname === "/cleanup" && req.method === "POST") {
    try {
      const tmpDir = path.join(process.cwd(), "worker", "tmp");
      const result = cleanupTmpFiles(tmpDir);
      sendJson(res, 200, { status: "ok", ...result });
    } catch (err) {
      sendJson(res, 500, { status: "error", message: err?.message || "Cleanup failed" });
    }
    return;
  }

  sendJson(res, 404, { error: "Not Found" });
});

server.listen(PORT, HOST, () => {
  console.log(`[FFmpeg Worker] Listening on http://${HOST}:${PORT}`);
});
