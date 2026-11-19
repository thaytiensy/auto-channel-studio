"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Sparkles, FolderOpen, Loader2 } from "lucide-react";
import type { ProjectManifest } from "@/schemas";

interface ApiProject {
  projects: ProjectManifest[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Không thể tải danh sách dự án");
        const data = (await res.json()) as ApiProject;
        if (!ignore) setProjects(data.projects ?? []);
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
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Trang Chủ
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Dự Án
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Dự Án Đã Lưu
          </h1>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Sinh Kịch Bản Mới
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
            <FolderOpen className="w-10 h-10" />
            <p className="text-sm">Chưa có dự án nào. Hãy sinh kịch bản đầu tiên!</p>
          </div>
        )}

        <div className="grid gap-4">
          {projects.map((p) => (
            <Link
              key={p.projectId}
              href={`/projects/${p.projectId}`}
              className="block p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {p.title}
                </span>
                <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-zinc-500">
                  {p.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {p.scenes.length} cảnh · {p.aspectRatio} ·{" "}
                {new Date(p.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
