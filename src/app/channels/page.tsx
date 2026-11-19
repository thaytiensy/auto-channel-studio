"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tv,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { ChannelForm } from "@/components/ChannelForm";
import type { ChannelProfile } from "@/schemas";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchChannels() {
      try {
        const res = await fetch("/api/channels");
        const data = (await res.json()) as {
          channels?: ChannelProfile[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Lỗi tải kênh");
        if (!ignore) {
          setChannels(data.channels ?? []);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Lỗi không xác định");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchChannels();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreated = (newChannel: ChannelProfile) => {
    setChannels((prev) => [newChannel, ...prev]);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-zinc-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-emerald-400" />
            Quản Lý Kênh (Channel Memory)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Lưu trữ phong cách thương hiệu, ngách nội dung và danh sách từ cấm riêng biệt của từng kênh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/auto"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Auto Video MXH
          </Link>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Đóng Form" : "Thêm Kênh Mới"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="my-6">
          <ChannelForm
            onSuccess={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {error && (
        <div className="my-4 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="text-center py-16 text-xs text-zinc-500">
            Đang tải danh sách kênh...
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8">
            <Tv className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200">
              Chưa có kênh nào được khởi tạo
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Nhấn nút &ldquo;Thêm Kênh Mới&rdquo; ở góc trên để tạo kênh đầu tiên kèm danh sách từ cấm bảo vệ an toàn nội dung.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-lg hover:shadow-zinc-900/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white">
                      {channel.name}
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-full font-mono border border-zinc-700">
                      {channel.niche}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2">
                    <span className="font-semibold text-zinc-300">
                      Giọng điệu:
                    </span>{" "}
                    {channel.brandVoice}
                  </p>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {channel.bannedWords.length} từ cấm
                    </span>
                    <span>{channel.pastTopics.length} video</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800">
                  <Link
                    href={`/projects/new?channelId=${channel.id}`}
                    className="flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Tạo video cho kênh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
