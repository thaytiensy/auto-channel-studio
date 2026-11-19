"use client";

import { useState } from "react";
import {
  Clock, Lock, Volume2, Video, Loader2, Eye,
  AlertCircle, CheckCircle2, Pencil, Image as ImageIcon,
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
  const [displayPrompt, setDisplayPrompt] = useState(scene.visualLayer?.visualPrompt ?? "");

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
          spokenText: displayText || scene.spokenText || "",
          textHook: scene.textHook || "",
          visualPath: scene.visualLayer?.assetPath || "",
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
    <div className={`bg-zinc-900/90 backdrop-blur-md border rounded-2xl p-5 shadow-xl space-y-3.5 transition-all ${isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-800"}`}>
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono border border-emerald-500/30">
            {scene.orderIndex + 1}
          </span>
          <span className="text-xs font-bold text-white">Phân Cảnh #{scene.orderIndex + 1}</span>
          {scene.textHook && (
            <span className="text-[11px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">Hook: {scene.textHook}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" />{scene.actualDurationMs / 1000}s</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded text-[10px] uppercase font-mono text-zinc-300">
            <Lock className="w-2.5 h-2.5 text-zinc-400" />{scene.lockStatus}
          </span>
        </div>
      </div>

      {editing && projectId ? (
        <SceneTextEditor
          spokenText={displayText}
          visualPrompt={displayPrompt}
          projectId={projectId}
          sceneId={scene.sceneId}
          allScenesJson={allScenesJson}
          onSaved={(t, p) => { setDisplayText(t); setDisplayPrompt(p); setEditing(false); onSceneUpdated?.(scene.sceneId, t); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-2">
          <p className="p-3.5 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs leading-relaxed text-zinc-200">{displayText}</p>
          {displayPrompt && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/60 border border-zinc-800/50 rounded-xl text-[11px] text-zinc-400 truncate" title={displayPrompt}>
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate italic">{displayPrompt}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5 truncate mr-2" title={scene.audioPath ?? undefined}>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-zinc-400">Audio:</span>
          <span className="font-mono text-[11px] text-zinc-300 truncate">{audioFileName}</span>
        </span>
        <span className="text-[11px] font-mono text-zinc-400 flex-shrink-0">{scene.actualDurationMs / 1000}s</span>
      </div>

      {videoFileName && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate font-mono">{videoFileName}</span>
        </div>
      )}

      {renderError && (
        <div className="flex items-center gap-1.5 p-2 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
          <span>{renderError}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {projectId && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors"
            >
              <Pencil className="w-3 h-3" /> Sửa Lời
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelect?.(scene)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors"
          >
            <Eye className="w-3 h-3 text-emerald-400" /> Xem Safe Zone
          </button>
        </div>

        <button
          type="button"
          onClick={handleRender}
          disabled={rendering}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
        >
          {rendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
          Render Cảnh Này
        </button>
      </div>
    </div>
  );
}
