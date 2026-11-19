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
    <div className="w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Trạng Thái Hệ Thống & Hợp Đồng Dữ Liệu
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cloud Serverless + Local Multi-Scene Pipeline
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {fetchError && (
        <div className="mt-4 p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
          Lỗi kết nối API: {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              Repository
            </span>
            {data?.repository.status === "connected" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            )}
          </div>
          <div className="text-xs font-bold text-white capitalize">
            {data ? `${data.repository.driver} Driver` : "Đang kiểm tra..."}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Kênh hiện có: {data?.repository.channelCount ?? 0}
          </p>
        </div>

        <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              Schema
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-white">
            {data?.schemaVersion ?? "2.0.0"} (Zod Strict)
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Budget Guard: 35¢/video
          </p>
        </div>

        <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              Render Worker
            </span>
            {data?.worker.status === "online" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className="text-xs font-bold text-white">
            {data?.worker.status === "online" ? "FFmpeg Online" : "Chế độ Cloud"}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {data?.worker.status === "online" ? "Port 4001 sẵn sàng" : "Worker cục bộ"}
          </p>
        </div>
      </div>
    </div>
  );
}
