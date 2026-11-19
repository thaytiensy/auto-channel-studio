import { promises as fs } from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { getStorageDir } from "./paths";

// In-memory fallback cache for Serverless/read-only container environments
const memoryCache = new Map<string, unknown>();

async function ensureDataDir(): Promise<string> {
  const dir = getStorageDir();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.warn(`[storage] Could not mkdir ${dir}, using in-memory mode:`, err);
  }
  return dir;
}

export async function readJsonStore<T>(
  fileName: string,
  schema: z.ZodType<T>,
  fallbackValue: T
): Promise<T> {
  if (memoryCache.has(fileName)) {
    try {
      return schema.parse(memoryCache.get(fileName));
    } catch {
      // ignore parse error and proceed to disk read
    }
  }

  try {
    const dir = await ensureDataDir();
    const filePath = path.join(dir, fileName);
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    const validated = schema.parse(parsed);
    memoryCache.set(fileName, validated);
    return validated;
  } catch {
    memoryCache.set(fileName, fallbackValue);
    return fallbackValue;
  }
}

export async function writeJsonStore<T>(
  fileName: string,
  data: T,
  schema: z.ZodType<T>
): Promise<void> {
  const validated = schema.parse(data);
  memoryCache.set(fileName, validated);

  try {
    const dir = await ensureDataDir();
    const filePath = path.join(dir, fileName);
    const jsonContent = JSON.stringify(validated, null, 2);

    const tmpPath = path.join(
      dir,
      `${fileName}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`
    );

    await fs.writeFile(tmpPath, jsonContent, "utf-8");
    try {
      await fs.rename(tmpPath, filePath);
    } catch {
      await fs.copyFile(tmpPath, filePath);
      await fs.unlink(tmpPath).catch(() => null);
    }
  } catch (err) {
    console.warn(`[storage] Disk write failed for ${fileName}, saved in memory:`, err);
  }
}
