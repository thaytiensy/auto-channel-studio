import { NextResponse } from "next/server";
import { getRepository } from "@/lib/storage";

interface WorkerHealthData {
  status: "ok" | "degraded";
  ffmpeg: string;
  ffprobe: string;
  libx264: boolean;
  assFilter: boolean;
  timestamp: string;
}

export interface SystemHealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  repository: {
    driver: string;
    status: "connected" | "error";
    channelCount: number;
    error?: string;
  };
  worker: {
    status: "online" | "offline" | "degraded";
    url: string;
    details: WorkerHealthData | null;
    error?: string;
  };
  schemaVersion: "2.0.0";
  timestamp: string;
}

export async function GET(): Promise<NextResponse<SystemHealthResponse>> {
  const driver = process.env.STORAGE_DRIVER || "local";
  let repoStatus: "connected" | "error" = "connected";
  let channelCount = 0;
  let repoError: string | undefined;

  try {
    const repo = getRepository();
    const channels = await repo.listChannels();
    channelCount = channels.length;
  } catch (err: unknown) {
    repoStatus = "error";
    repoError = err instanceof Error ? err.message : "Unknown repo error";
  }

  const workerUrl = process.env.WORKER_URL || "http://127.0.0.1:4001";
  let workerStatus: "online" | "offline" | "degraded" = "offline";
  let workerDetails: WorkerHealthData | null = null;
  let workerError: string | undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${workerUrl}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as WorkerHealthData;
      workerDetails = data;
      workerStatus = data.status === "ok" ? "online" : "degraded";
    } else {
      workerStatus = "degraded";
      workerError = `Worker returned HTTP ${res.status}`;
    }
  } catch (err: unknown) {
    workerStatus = "offline";
    workerError =
      err instanceof Error ? err.message : "Worker connection timed out";
  }

  const overallStatus: "healthy" | "degraded" | "unhealthy" =
    repoStatus === "connected" && workerStatus === "online"
      ? "healthy"
      : repoStatus === "connected"
      ? "degraded"
      : "unhealthy";

  const responseBody: SystemHealthResponse = {
    status: overallStatus,
    repository: {
      driver,
      status: repoStatus,
      channelCount,
      ...(repoError ? { error: repoError } : {}),
    },
    worker: {
      status: workerStatus,
      url: workerUrl,
      details: workerDetails,
      ...(workerError ? { error: workerError } : {}),
    },
    schemaVersion: "2.0.0",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(responseBody, {
    status: overallStatus === "unhealthy" ? 503 : 200,
  });
}
