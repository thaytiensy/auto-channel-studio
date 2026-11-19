#!/usr/bin/env node

/**
 * CLI Tool for Auto MXH Video Generation.
 * Usage:
 *   node scripts/auto-cli.mjs "3 mẹo tiết kiệm tiền"
 *   node scripts/auto-cli.mjs --url "https://example.com/news"
 */
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Cách dùng: node scripts/auto-cli.mjs <chủ_đề> hoặc --url <link_bài_viết>");
  process.exit(1);
}

let topic = "";
let sourceUrl = "";

if (args[0] === "--url" && args[1]) {
  sourceUrl = args[1];
} else {
  topic = args.join(" ");
}

const API_URL = process.env.APP_URL || "http://localhost:3000";

async function run() {
  console.log(`[Auto Video CLI] Đang gửi yêu cầu tạo video: ${topic || sourceUrl}`);
  try {
    const res = await fetch(`${API_URL}/api/auto-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic || undefined, sourceUrl: sourceUrl || undefined }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.error(`[-] Thất bại: ${data.error || res.statusText}`);
      process.exit(1);
    }

    console.log("==================================================");
    console.log("  TỰ ĐỘNG TẠO VIDEO THÀNH CÔNG (AUTO MXH)");
    console.log("==================================================");
    console.log(`Tiêu đề:       ${data.title}`);
    console.log(`Thời lượng:    ${Math.round(data.durationMs / 1000)}s (${data.scenesCount} cảnh)`);
    console.log(`Link Cố Định:  ${API_URL}${data.videoUrl}`);
    console.log(`Tải Video:     ${API_URL}${data.downloadUrl}`);
    console.log("==================================================");
  } catch (err) {
    console.error("[-] Lỗi kết nối tới server:", err?.message || err);
    console.log("[!] Hãy đảm bảo server đang chạy: npm run app:start");
    process.exit(1);
  }
}

void run();
