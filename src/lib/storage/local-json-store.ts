import { promises as fs } from "node:fs";
import path from "node:path";
import type { z } from "zod";

const DATA_DIR = path.join(process.cwd(), ".local-data");

async function ensureDataDir(): Promise<string> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  return DATA_DIR;
}

export async function readJsonStore<T>(
  fileName: string,
  schema: z.ZodType<T>,
  fallbackValue: T
): Promise<T> {
  const dir = await ensureDataDir();
  const filePath = path.join(dir, fileName);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    return schema.parse(parsed);
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ENOENT"
    ) {
      await writeJsonStore(fileName, fallbackValue, schema);
      return fallbackValue;
    }
    throw err;
  }
}

export async function writeJsonStore<T>(
  fileName: string,
  data: T,
  schema: z.ZodType<T>
): Promise<void> {
  const dir = await ensureDataDir();
  const filePath = path.join(dir, fileName);
  const validated = schema.parse(data);
  const jsonContent = JSON.stringify(validated, null, 2);

  const tmpPath = path.join(
    dir,
    `${fileName}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`
  );

  await fs.writeFile(tmpPath, jsonContent, "utf-8");

  try {
    await fs.rename(tmpPath, filePath);
  } catch {
    // Fallback for Windows cross-lock or atomic replace
    await fs.copyFile(tmpPath, filePath);
    await fs.unlink(tmpPath);
  }
}
