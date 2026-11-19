"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Copy, Check, Download, CheckCircle2, Film } from "lucide-react";

export interface AutoVideoResult {
  projectId: string;
  title: string;
  videoUrl: string;
  downloadUrl: string;
  isRendered?: boolean;
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
    <div className="bg-zinc-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        {result.isRendered !== false
          ? "Video Hoàn Thành với Link Cố Định!"
          : "Kịch Bản & Giọng Đọc Đã Sẵn Sàng!"}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="aspect-[9/16] max-h-[360px] bg-black rounded-xl overflow-hidden border border-zinc-800 shadow-inner flex items-center justify-center mx-auto w-full max-w-[220px]">
          {result.isRendered !== false ? (
            <video
              src={result.videoUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="p-4 text-center space-y-3">
              <Film className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-xs text-zinc-300 font-medium">
                Audio Neural & Kịch bản đã sinh xong
              </p>
              <p className="text-[11px] text-zinc-500">
                Để xuất video MP4 nối toàn bộ, hãy mở Worker FFmpeg cục bộ.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3.5">
          <div>
            <h3 className="font-bold text-white text-base leading-snug">
              {result.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {result.scenesCount} cảnh · {Math.round(result.durationMs / 1000)}s · Định dạng TikTok 9:16
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Link Cố Định (Permalink)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}${result.videoUrl}`
                    : result.videoUrl
                }
                className="w-full px-3 py-2 bg-zinc-950 rounded-xl text-xs font-mono text-zinc-300 border border-zinc-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Đã chép" : "Chép link"}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href={result.downloadUrl}
              download={`${result.projectId}_final.mp4`}
              className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Download className="w-3.5 h-3.5" /> Tải Video MP4
            </a>
            <Link
              href={`/projects/${result.projectId}`}
              className="py-2.5 px-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Chi Tiết Cảnh
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
