"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Copy, Check, Download, CheckCircle2 } from "lucide-react";

export interface AutoVideoResult {
  projectId: string;
  title: string;
  videoUrl: string;
  downloadUrl: string;
  durationMs: number;
  scenesCount: number;
}

export function AutoVideoResultCard({ result }: { result: AutoVideoResult }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${result.videoUrl}`;
    void navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl p-6 shadow-md space-y-4">
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
        <CheckCircle2 className="w-5 h-5" /> Video Hoàn Thành với Link Cố Định!
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="aspect-[9/16] max-h-[360px] bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center mx-auto w-full max-w-[220px]">
          <video src={result.videoUrl} controls playsInline className="w-full h-full object-contain" />
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">{result.title}</h3>
          <p className="text-xs text-zinc-500">{result.scenesCount} cảnh · {Math.round(result.durationMs / 1000)}s · TikTok 9:16</p>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Link Cố Định (Permalink)</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}${result.videoUrl}` : result.videoUrl}
                className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Đã chép" : "Chép"}
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <a
              href={result.downloadUrl}
              download={`${result.projectId}_final.mp4`}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Tải MP4
            </a>
            <Link
              href={`/projects/${result.projectId}`}
              className="py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Chi Tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
