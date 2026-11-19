"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
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
  const [renderedVideos, setRenderedVideos] = useState<Record<string, string>>(
    {}
  );

  const handleRenderSuccess = (sceneId: string, videoPath: string) => {
    setRenderedVideos((prev) => ({ ...prev, [sceneId]: videoPath }));
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
              Phát hiện từ cấm của kênh trong kịch bản vừa sinh:{" "}
              <strong className="underline decoration-amber-300 underline-offset-2">
                {policyWarnings.join(", ")}
              </strong>
              . Vui lòng xem xét điều chỉnh kịch bản trước khi sang bước thu âm!
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Kịch Bản Phân Cảnh & Render Studio (Audio-First v2.0.0)
        </h3>
        <span className="text-xs text-zinc-500 font-mono">
          Project ID: {project.projectId.slice(0, 8)}...
        </span>
      </div>

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

        <div className="lg:col-span-5 sticky top-6 flex justify-center">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm w-full flex justify-center">
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
