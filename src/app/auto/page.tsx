"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Video, Loader2, Link as LinkIcon, AlertCircle, ArrowLeft, Flame
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
      setStage("1/3: AI đang tạo kịch bản & tạo hình ảnh...");
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
    <main className="min-h-screen bg-zinc-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-emerald-400 fill-emerald-400/20" />
            Auto Video MXH (Link Cố Định)
          </h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-400">
            Hệ thống tự động toàn trình: Nhập chủ đề hoặc link bài viết &rarr; Kịch bản AI &rarr; Giọng đọc Neural &rarr; Render 9:16 Safe Zone &rarr; Xuất link cố định.
          </p>
        </div>

        <form
          onSubmit={handleGenerate}
          className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Chủ Đề Video Cần Tạo
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: 3 bí quyết quản lý tài chính thông minh cho Gen Z"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-900 px-3 text-[11px] text-zinc-500 uppercase font-mono absolute">
              hoặc dùng link cố định
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Link Bài Viết / Trang Nguồn
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://vnexpress.net/bai-viet-hay-moi-nhat"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs md:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!topic.trim() && !sourceUrl.trim())}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
            {loading ? stage : "Tự Động Tạo Video MXH Ngay"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {result && <AutoVideoResultCard result={result} />}
      </div>
    </main>
  );
}
