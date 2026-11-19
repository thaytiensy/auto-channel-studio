"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, FolderOpen, Loader2 } from "lucide-react";
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
        if (!ignore) {
          setError(e instanceof Error ? e.message : "Lỗi không xác định");
        }
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
    <main className="min-h-screen bg-zinc-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs font-semibold text-emerald-400">
            Kho Dự Án
          </span>
        </div>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-emerald-400" />
              Kho Dự Án Video Đã Lưu
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Quản lý toàn bộ kịch bản, bản ghi âm và file video thành phẩm.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sinh Kịch Bản Mới
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-zinc-500 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Đang tải danh sách...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
            <FolderOpen className="w-12 h-12 text-zinc-600" />
            <p className="text-xs font-medium text-zinc-400">Chưa có dự án nào được tạo.</p>
            <Link
              href="/projects/new"
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold"
            >
              Sinh kịch bản đầu tiên ngay &rarr;
            </Link>
          </div>
        )}

        <div className="grid gap-3.5">
          {projects.map((p) => (
            <Link
              key={p.projectId}
              href={`/projects/${p.projectId}`}
              className="block p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors truncate">
                  {p.title}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 bg-zinc-800 rounded-full font-mono text-zinc-300 border border-zinc-700">
                  {p.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {p.scenes.length} cảnh · Khung hình {p.aspectRatio} · Tạo ngày:{" "}
                {new Date(p.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
