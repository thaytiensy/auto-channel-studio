import { SystemHealthCard } from "@/components/SystemHealthCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8 text-center md:text-left">
        <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-medium mb-3">
          Sprint 1.1: Core Skeleton & Data Contracts
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Auto Channel Studio — Core Engine
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Next.js App Router + Per-Scene Audio-First v2.0.0 Architecture +
          FFmpeg Render Worker
        </p>
      </div>

      <SystemHealthCard />
    </main>
  );
}
