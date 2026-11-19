import Link from "next/link";
import { Tv, Sparkles, FolderOpen, Flame, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { SystemHealthCard } from "@/components/SystemHealthCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-14 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center space-y-6 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Studio Sản Xuất Video AI Tự Động Toàn Trình</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Biến Ý Tưởng Thành Video{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Triệu View
          </span>{" "}
          Trong Vài Giây
        </h1>

        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-400 leading-relaxed">
          Tạo video dọc chuẩn 9:16 (TikTok, Reels, Shorts) với kịch bản Gemini AI, giọng đọc Neural tiếng Việt tự nhiên và phụ đề Safe Zone chống tràn màn hình.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/auto"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Flame className="w-4 h-4 fill-current" />
            Tạo Video Auto MXH (Link Cố Định)
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/channels"
            className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-2xl transition-all"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            Quản Lý Kênh
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-2xl transition-all"
          >
            <FolderOpen className="w-4 h-4 text-zinc-400" />
            Kho Dự Án
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Zap className="w-3.5 h-3.5" /> 1-Click Pipeline
            </div>
            <p className="text-xs text-zinc-400">Từ chủ đề tới video MP4 hoàn chỉnh tự động trong 1 click.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Safe Zone TikTok
            </div>
            <p className="text-xs text-zinc-400">Phụ đề canh lề chuẩn không bị che bởi nút Like/Share.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" /> Neural AI Voice
            </div>
            <p className="text-xs text-zinc-400">Giọng đọc tiếng Việt Hoài My truyền cảm, ngắt nghỉ tự nhiên.</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <SystemHealthCard />
      </div>
    </main>
  );
}
