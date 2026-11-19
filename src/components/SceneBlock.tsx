"use client";

import { useState } from "react";
import {
  Film, Clock, Lock, Sparkles, Volume2, Video,
  Loader2, Eye, AlertCircle, CheckCircle2, Pencil,
} from "lucide-react";
import type { Scene } from "@/schemas";
import type { WorkerRenderResponse } from "@/app/api/projects/render-scene/route";
import { SceneTextEditor } from "./SceneTextEditor";

interface SceneBlockProps {
  scene: Scene;
  projectId?: string;
  allScenesJson?: string;
  isSelected?: boolean;
  renderedVideoPath?: string | null;
  onSelect?: (scene: Scene) => void;
  onRenderSuccess?: (sceneId: string, videoPath: string) => void;
  onSceneUpdated?: (sceneId: string, newText: string) => void;
}

export function SceneBlock({
  scene,
  projectId,
  allScenesJson = "[]",
  isSelected = false,
  renderedVideoPath,
  onSelect,
  onRenderSuccess,
  onSceneUpdated,
}: SceneBlockProps) {
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayText, setDisplayText] = useState(scene.spokenText);

  const audioFileName = scene.audioPath
    ? (scene.audioPath.split(/[/\\]/).pop() ?? scene.audioPath)
    : "Chưa tạo";
  const videoFileName = renderedVideoPath
    ? (renderedVideoPath.split(/[/\\]/).pop() ?? renderedVideoPath)
    : null;

  const handleRender = async () => {
    setRendering(true);
    setRenderError(null);
    try {
      const res = await fetch("/api/projects/render-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: scene.sceneId,
          durationMs: scene.actualDurationMs || 3500,
          audioPath: scene.audioPath || "",
        }),
      });
      const data = (await res.json()) as WorkerRenderResponse & { error?: string };
      if (!res.ok || data.status !== "ok" || !data.videoPath) {
        throw new Error(data.error ?? "Render cảnh thất bại");
      }
      onRenderSuccess?.(scene.sceneId, data.videoPath);
      onSelect?.(scene);
    } catch (err: unknown) {
      setRenderError(err instanceof Error ? err.message : "Lỗi khi render");
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 shadow-sm space-y-3 transition-colors ${isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-200 dark:border-zinc-800"}`}>
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono">
            {scene.orderIndex + 1}
          </span>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Phân Cảnh #{scene.orderIndex + 1}</span>
          {scene.textHook && (
            <span className="text-[11px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md">Hook: {scene.textHook}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" />{scene.actualDurationMs / 1000}s</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] uppercase font-mono">
            <Lock className="w-2.5 h-2.5 text-zinc-400" />{scene.lockStatus}
          </span>
        </div>
      </div>

      {editing && projectId ? (
        <SceneTextEditor
          text={displayText}
          projectId={projectId}
          sceneId={scene.sceneId}
          allScenesJson={allScenesJson}
          onSaved={(t) => { setDisplayText(t); setEditing(false); onSceneUpdated?.(scene.sceneId, t); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <p className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">{displayText}</p>
      )}

      <div className="p-2.5 bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5 truncate mr-2" title={scene.audioPath ?? undefined}>
          <Volume2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium text-zinc-500">Audio:</span>
          <span className="font-mono text-[11px] truncate">{audioFileName}</span>
        </span>
        <span className="text-[11px] font-mono text-zinc-500 flex-shrink-0">{scene.actualDurationMs / 1000}s</span>
      </div>

      {videoFileName && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-medium">Đã Render:</span>
          <span className="font-mono text-[11px] truncate">{videoFileName}</span>
        </div>
      )}

      {renderError && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>{renderError}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5 text-zinc-400" />{scene.visualLayer?.sourceType ?? "ai_image_ken_burns"}</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-500" />{scene.visualLayer?.motionPreset ?? "zoom_in"}</span>
        </div>
        <div className="flex items-center gap-2">
          {projectId && !editing && (
            <button type="button" onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Sửa
            </button>
          )}
          {onSelect && (
            <button type="button" onClick={() => onSelect(scene)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors">
              <Eye className="w-3.5 h-3.5" /> Xem Safe Zone
            </button>
          )}
          <button type="button" onClick={handleRender} disabled={rendering}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50">
            {rendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
            Render Cảnh Này
          </button>
        </div>
      </div>
    </div>
  );
}
