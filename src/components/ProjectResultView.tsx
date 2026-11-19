"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Film,
  Download,
  Loader2,
  Play,
} from "lucide-react";
import { SceneBlock } from "@/components/SceneBlock";
import { SafeZonePreview } from "@/components/SafeZonePreview";
import type { ProjectManifest, Scene } from "@/schemas";

interface ProjectResultViewProps {
  project: ProjectManifest;
  policyWarnings: string[];
}

export function ProjectResultView({
  project,
  policyWarnings,
}: ProjectResultViewProps) {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(
    project.scenes[0] || null
  );
  const [renderedVideos, setRenderedVideos] = useState<Record<string, string>>({});
  const [renderingFull, setRenderingFull] = useState(false);
  const [renderFullError, setRenderFullError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleRenderSuccess = (sceneId: string, videoPath: string) => {
    setRenderedVideos((prev) => ({ ...prev, [sceneId]: videoPath }));
  };

  const handleRenderFull = async () => {
    setRenderingFull(true);
    setRenderFullError(null);
    try {
      const res = await fetch("/api/projects/render-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.projectId,
          scenes: project.scenes,
        }),
      });

      const data = (await res.json()) as {
        status?: string;
        downloadUrl?: string;
        error?: string;
      };

      if (!res.ok || data.status !== "ok" || !data.downloadUrl) {
        throw new Error(data.error || "Ghép video dự án thất bại");
      }

      setDownloadUrl(data.downloadUrl);
    } catch (err: unknown) {
      setRenderFullError(
        err instanceof Error ? err.message : "Lỗi không xác định khi xuất video"
      );
    } finally {
      setRenderingFull(false);
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      {policyWarnings.length > 0 && (
        <div className="p-4 bg-red-600 text-white rounded-xl shadow-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-200" />
          <div className="text-xs space-y-1">
            <p className="font-bold uppercase tracking-wider text-amber-100">
              Cảnh báo vi phạm chính sách nội dung (Policy Auditor Alert)
            </p>
            <p>
              Phát hiện từ cấm:{" "}
              <strong className="underline decoration-amber-300 underline-offset-2">
                {policyWarnings.join(", ")}
              </strong>
              . Xem xét trước khi xuất video chính thức!
            </p>
          </div>
        </div>
      )}

      {/* Global Action Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Studio Thành Phẩm (MVP Concat Pipeline)
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tự động render phôi các cảnh thiếu và nối ghép thành 1 file MP4 dọc duy nhất.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`${project.projectId}_final.mp4`}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Tải Video MP4 Hoàn Chỉnh
            </a>
          )}

          <button
            type="button"
            onClick={handleRenderFull}
            disabled={renderingFull}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-colors disabled:opacity-50"
          >
            {renderingFull ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang nối các cảnh bằng FFmpeg...
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5" />
                Xuất Video Hoàn Chỉnh (Nối Tất Cả Cảnh)
              </>
            )}
          </button>
        </div>
      </div>

      {renderFullError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400">
          {renderFullError}
        </div>
      )}

      {/* 2-Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          {project.scenes.map((scene) => (
            <SceneBlock
              key={scene.sceneId}
              scene={scene}
              isSelected={selectedScene?.sceneId === scene.sceneId}
              renderedVideoPath={renderedVideos[scene.sceneId] || null}
              onSelect={(sc) => setSelectedScene(sc)}
              onRenderSuccess={handleRenderSuccess}
            />
          ))}
        </div>

        <div className="lg:col-span-5 sticky top-6 space-y-4">
          {downloadUrl && (
            <div className="bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                <Play className="w-3.5 h-3.5" />
                Trình Phát Video Hoàn Chỉnh (1080x1920)
              </span>
              <video
                controls
                src={downloadUrl}
                className="w-full rounded-xl border border-zinc-700 bg-black aspect-[9/16] max-h-96 object-contain"
              />
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex justify-center">
            <SafeZonePreview
              selectedScene={selectedScene}
              renderedVideoPath={
                selectedScene
                  ? renderedVideos[selectedScene.sceneId] || null
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
