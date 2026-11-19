import { spawn } from "node:child_process";
import http from "node:http";

const WORKER_PORT = process.env.WORKER_PORT || "4001";
const APP_PORT = process.env.PORT || "3000";

console.log("==================================================");
console.log("  Auto Channel Studio — Đang khởi động ứng dụng");
console.log("==================================================");

// 1. Start Worker
const worker = spawn("node", ["worker/server.mjs"], { stdio: "inherit", shell: true });

// 2. Start Next.js App
const app = spawn("npx", ["next", "start", "-p", APP_PORT], { stdio: "inherit", shell: true });

function openBrowser(url) {
  const startCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(startCmd, [url], { shell: true });
}

// Poll until app is up, then open browser
const pollTimer = setInterval(() => {
  const req = http.get(`http://127.0.0.1:${APP_PORT}`, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 307) {
      clearInterval(pollTimer);
      console.log(`\n[Ready] Ứng dụng đã sẵn sàng tại: http://localhost:${APP_PORT}/auto`);
      openBrowser(`http://localhost:${APP_PORT}/auto`);
    }
  });
  req.on("error", () => {});
}, 1500);

function shutdown() {
  console.log("\n[Shutdown] Đang dừng các tiến trình...");
  clearInterval(pollTimer);
  worker.kill();
  app.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
