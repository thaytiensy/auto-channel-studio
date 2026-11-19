import fs from "node:fs";
import path from "node:path";

/**
 * Delete tmp files older than maxAgeMs (default 24 h), skipping .gitkeep.
 * @param {string} tmpDir
 * @param {number} maxAgeMs
 * @returns {{ deletedCount: number }}
 */
export function cleanupTmpFiles(
  tmpDir,
  maxAgeMs = 24 * 60 * 60 * 1000
) {
  if (!fs.existsSync(tmpDir)) return { deletedCount: 0 };

  const entries = fs.readdirSync(tmpDir);
  const cutoff = Date.now() - maxAgeMs;
  let deletedCount = 0;

  for (const name of entries) {
    if (name === ".gitkeep") continue;
    const filePath = path.join(tmpDir, name);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        deletedCount += 1;
        console.log(`[cleanup] Deleted: ${name}`);
      }
    } catch (err) {
      console.error(`[cleanup] Could not remove ${name}:`, err?.message);
    }
  }

  return { deletedCount };
}
