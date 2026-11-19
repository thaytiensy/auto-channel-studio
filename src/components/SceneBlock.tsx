"use client";

import { Film, Clock, Lock, Sparkles, Volume2 } from "lucide-react";
import type { Scene } from "@/schemas";

interface SceneBlockProps {
  scene: Scene;
}

export function SceneBlock({ scene }: SceneBlockProps) {
  const audioFileName = scene.audioPath
    ? scene.audioPath.split(/[/\\]/).pop() || scene.audioPath
    : "Chưa tạo";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
            {scene.orderIndex + 1}
          </span>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Phân Cảnh #{scene.orderIndex + 1}
          </span>
          {scene.textHook && (
            <span className="text-[11px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md">
              Hook: {scene.textHook}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Thời lượng: {scene.actualDurationMs / 1000}s
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] uppercase font-mono">
            <Lock className="w-2.5 h-2.5 text-zinc-400" />
            {scene.lockStatus}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Lời thoại (Spoken Text)
        </label>
        <p className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 font-sans">
          {scene.spokenText}
        </p>
      </div>

      <div className="p-2.5 bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 truncate mr-2"
          title={scene.audioPath || undefined}
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium text-zinc-500">Audio Path:</span>
          <span className="font-mono text-[11px] truncate">
            {audioFileName}
          </span>
        </span>
        <span className="text-[11px] font-mono text-zinc-500 flex-shrink-0">
          Thời lượng: {scene.actualDurationMs / 1000}s
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Film className="w-3.5 h-3.5 text-zinc-400" />
          Layer: {scene.visualLayer?.sourceType || "ai_image_ken_burns"}
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Motion: {scene.visualLayer?.motionPreset || "zoom_in"}
        </span>
        <span className="text-zinc-400 font-mono">
          SafeZone: {scene.safeZoneProfile}
        </span>
      </div>
    </div>
  );
}
