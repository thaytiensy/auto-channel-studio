import http from "node:http";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { renderSceneMp4 } from "./render-scene.mjs";

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

  const ffmpegFirstLine = verFfmpeg.ok
    ? verFfmpeg.output.split("\n")[0].trim()
    : "NOT_FOUND";
  const ffprobeFirstLine = verFfprobe.ok
    ? verFfprobe.output.split("\n")[0].trim()
    : "NOT_FOUND";

  const hasLibx264 = encFfmpeg.ok && encFfmpeg.output.includes("libx264");
  const hasAssFilter = fltFfmpeg.ok && /\bass\b/.test(fltFfmpeg.output);

  const isHealthy =
    verFfmpeg.ok && verFfprobe.ok && hasLibx264 && hasAssFilter;

  return {
    status: isHealthy ? "ok" : "degraded",
    ffmpeg: ffmpegFirstLine,
    ffprobe: ffprobeFirstLine,
    libx264: hasLibx264,
    assFilter: hasAssFilter,
    timestamp: new Date().toISOString(),
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(
    req.url || "/",
    `http://${req.headers.host || "127.0.0.1"}`
  );

  // Health check endpoint
  if (url.pathname === "/health" && req.method === "GET") {
    try {
      const health = await getHealthStatus();
      const code = health.status === "ok" ? 200 : 503;
      res.writeHead(code, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify(health, null, 2));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "error", error: String(err) }));
    }
    return;
  }

  // Render scene endpoint
  if (url.pathname === "/render-scene" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const { sceneId, durationMs, audioPath } = body;

      if (!sceneId || typeof sceneId !== "string") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ status: "error", message: "sceneId is required" })
        );
        return;
      }

      const outputDir = path.join(process.cwd(), "worker", "tmp");
      const result = await renderSceneMp4({
        sceneId,
        durationMs: Number(durationMs) || 3500,
        audioPath: audioPath || "",
        outputDir,
      });

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ status: "ok", ...result }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "error",
          message: err?.message || "Render failed",
        })
      );
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, HOST, () => {
  console.log(`[FFmpeg Worker] Listening on http://${HOST}:${PORT}`);
});
