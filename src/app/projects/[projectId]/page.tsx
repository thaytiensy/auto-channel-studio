"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import type { ProjectManifest } from "@/schemas";
import { ProjectResultView } from "@/components/ProjectResultView";

interface ApiResponse {
  project?: ProjectManifest;
  error?: string;
}

function ProjectDetailContent() {
  const params = useParams();
  const projectId =
    typeof params?.projectId === "string" ? params.projectId : "";

  const [project, setProject] = useState<ProjectManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = (await res.json()) as ApiResponse;
        if (!res.ok || !data.project)
          throw new Error(data.error ?? "Không tìm thấy dự án");
        if (!ignore) setProject(data.project);
      } catch (e) {
        if (!ignore)
          setError(e instanceof Error ? e.message : "Lỗi không xác định");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [projectId]);

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-20 gap-2 text-zinc-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Đang tải thông tin dự án...
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {project && (
        <ProjectResultView project={project} policyWarnings={[]} />
      )}
    </>
  );
}

export default function ProjectDetailPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kho Dự Án
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs font-semibold text-emerald-400">
            Chi Tiết Dự Án
          </span>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 gap-2 text-zinc-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Đang tải...
            </div>
          }
        >
          <ProjectDetailContent />
        </Suspense>
      </div>
    </main>
  );
}
