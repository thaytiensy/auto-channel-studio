"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home, Sparkles, Video, Loader2, Link as LinkIcon, AlertCircle
} from "lucide-react";
import { AutoVideoResultCard, type AutoVideoResult } from "@/components/AutoVideoResultCard";

export default function AutoVideoPage() {
  const [topic, setTopic] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<AutoVideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !sourceUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStage("Đang khởi tạo pipeline tự động...");

    try {
      setStage("1/3: AI đang viết kịch bản & tạo hình ảnh...");
      const res = await fetch("/api/auto-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });

      setStage("2/3: Đang ghép audio, render hiệu ứng & phụ đề Safe Zone...");
      const data = (await res.json()) as AutoVideoResult & { error?: string };

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Quá trình tự động tạo video thất bại");
      }

      setStage("3/3: Hoàn tất video với link cố định!");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            <Home className="w-3.5 h-3.5" /> Trang Chủ
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Auto Video MXH</span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-500" />
            Tự Động Tạo Video MXH (Link Cố Định)
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Hệ thống tự động: Nhập chủ đề hoặc link bài viết &rarr; Kịch bản Gemini &rarr; Giọng đọc Neural &rarr; Render 9:16 Safe Zone &rarr; Xuất link cố định.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Chủ Đề Video Cần Tạo
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: 3 bí quyết quản lý tài chính thông minh cho Gen Z"
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 uppercase font-mono absolute">hoặc dùng link cố định</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Link Bài Viết / Trang Nguồn
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://vnexpress.net/bai-viet-hay-moi-nhat"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!topic.trim() && !sourceUrl.trim())}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
            {loading ? stage : "Tự Động Tạo Video MXH Ngay"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && <AutoVideoResultCard result={result} />}
      </div>
    </main>
  );
}
