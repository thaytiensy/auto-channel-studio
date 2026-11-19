import type { AppRepository } from "./repository.interface";
import { LocalJsonRepository } from "./local-json.repository";

export * from "./repository.interface";
export * from "./local-json-store";
export * from "./local-json.repository";

let repositoryInstance: AppRepository | null = null;

export function getRepository(): AppRepository {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const driver = process.env.STORAGE_DRIVER || "local";

  if (driver === "local") {
    repositoryInstance = new LocalJsonRepository();
    return repositoryInstance;
  }

  if (driver === "supabase") {
    throw new Error(
      "[StorageDriverError] Supabase driver is scheduled for Sprint 2. " +
        "Please set STORAGE_DRIVER=local in .env.local for Sprint 1."
    );
  }

  throw new Error(
    `[StorageDriverError] Unsupported STORAGE_DRIVER: '${driver}'. Valid options in Sprint 1: 'local'.`
  );
}
