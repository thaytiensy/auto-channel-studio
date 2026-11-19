"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Home, FolderOpen, Loader2, AlertCircle } from "lucide-react";
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
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải dự án...
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
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
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Trang Chủ
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Dự Án
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            Chi tiết
          </span>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
            </div>
          }
        >
          <ProjectDetailContent />
        </Suspense>
      </div>
    </main>
  );
}
