"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Cpu,
  Layers,
} from "lucide-react";
import type { SystemHealthResponse } from "@/app/api/health/route";

export function SystemHealthCard() {
  const [data, setData] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/health");
      const json = (await res.json()) as SystemHealthResponse;
      setData(json);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to fetch health status"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const res = await fetch("/api/health");
        const json = (await res.json()) as SystemHealthResponse;
        if (!ignore) {
          setData(json);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setFetchError(
            err instanceof Error ? err.message : "Failed to fetch health status"
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            System Diagnostics & Core Contracts
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Sprint 1.1 Verified</p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Kiểm tra lại kết nối
        </button>
      </div>

      {fetchError && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400">
          Lỗi kết nối API: {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-zinc-400" />
              Repository
            </span>
            {data?.repository.status === "connected" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">
            {data ? `${data.repository.driver} driver` : "Đang kiểm tra..."}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Channels: {data?.repository.channelCount ?? 0}
          </p>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-zinc-400" />
              Schema
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            v{data?.schemaVersion || "2.0.0"}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Per-Scene Audio-First</p>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-zinc-400" />
              FFmpeg Worker
            </span>
            {data?.worker.status === "online" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : data?.worker.status === "degraded" ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <XCircle className="w-4 h-4 text-zinc-400" />
            )}
          </div>
          <div className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">
            {data?.worker.status ?? "Đang kiểm tra..."}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {data?.worker.status === "online"
              ? "libx264 + ass OK"
              : data?.worker.error || "Port 4001"}
          </p>
        </div>
      </div>
    </div>
  );
}
