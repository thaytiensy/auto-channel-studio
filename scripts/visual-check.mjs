/**
 * Visual regression snapshot script.
 * Usage: node scripts/visual-check.mjs
 * Requires Next.js dev server running on http://localhost:3000
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.PREVIEW_URL || "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), ".preview");

const ROUTES = ["/", "/channels", "/projects"];
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 667 },
  { name: "desktop", width: 1440, height: 900 },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

async function launchBrowser() {
  // Try system Edge first (no extra download needed on Windows)
  try {
    const browser = await chromium.launch({ channel: "msedge", headless: true });
    console.log("[visual-check] Using Microsoft Edge");
    return browser;
  } catch {
    console.log("[visual-check] Edge not found, falling back to bundled Chromium");
  }
  // Fallback: bundled Chromium (requires `npx playwright install chromium`)
  return chromium.launch({ headless: true });
}

async function captureAll() {
  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `${BASE_URL}${route}`;
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        const slug = route === "/" ? "home" : route.replace(/\//g, "_").slice(1);
        const filename = `${slug}_${vp.name}.png`;
        const outPath = path.join(OUT_DIR, filename);
        await page.screenshot({ path: outPath, fullPage: false });
        console.log(`[visual-check] ✓ ${filename}`);
      }
    }

    await context.close();
    console.log(`[visual-check] Done. Screenshots saved to .preview/`);
  } catch (err) {
    console.error("[visual-check] Error:", err?.message || err);
    process.exit(1);
  } finally {
    if (browser) await browser.close().catch(() => null);
  }
}

await captureAll();
