import path from "node:path";
import os from "node:os";

export function getStorageDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "auto-channel-data");
  }
  return path.join(process.cwd(), ".local-data");
}

export function getWorkerTmpDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "auto-channel-worker-tmp");
  }
  return path.join(process.cwd(), "worker", "tmp");
}
