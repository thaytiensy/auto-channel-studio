"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { SceneBlock } from "@/components/SceneBlock";
import type { ProjectManifest } from "@/schemas";

interface ProjectResultViewProps {
  project: ProjectManifest;
  policyWarnings: string[];
}

export function ProjectResultView({
  project,
  policyWarnings,
}: ProjectResultViewProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
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
          Kịch Bản Phân Cảnh (Per-Scene Audio-First v2.0.0)
        </h3>
        <span className="text-xs text-zinc-500 font-mono">
          Project ID: {project.projectId.slice(0, 8)}...
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {project.scenes.map((scene) => (
          <SceneBlock key={scene.sceneId} scene={scene} />
        ))}
      </div>
    </div>
  );
}
