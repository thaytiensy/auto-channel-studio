import Link from "next/link";
import { Tv, Sparkles, FolderOpen } from "lucide-react";
import { SystemHealthCard } from "@/components/SystemHealthCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8 text-center md:text-left">
        <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-medium mb-3">
          Sprint 1.2: Channel Memory & Script Engine
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Auto Channel Studio — Core Engine
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Next.js App Router + Per-Scene Audio-First v2.0.0 Architecture + Policy
          Auditor
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Link
            href="/channels"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            <Tv className="w-3.5 h-3.5" />
            Quản Lý Kênh
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Sinh Kịch Bản Mới
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
            Dự Án Đã Lưu
          </Link>
        </div>
      </div>

      <SystemHealthCard />
    </main>
  );
}
