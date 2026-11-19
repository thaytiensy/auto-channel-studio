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
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Tv className="w-6 h-6 text-emerald-600" />
            Quản Lý Kênh (Channel Memory)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Lưu trữ phong cách thương hiệu, ngách nội dung và danh sách từ cấm
            riêng biệt của từng kênh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/projects/new"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Tạo Video Mới
          </Link>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
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
        <div className="my-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="text-center py-12 text-xs text-zinc-500">
            Đang tải danh sách kênh...
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-8">
            <Tv className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Chưa có kênh nào được khởi tạo
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Nhấn nút &ldquo;Thêm Kênh Mới&rdquo; ở góc trên để tạo kênh đầu
              tiên kèm danh sách từ cấm bảo vệ an toàn nội dung.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {channel.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full font-mono">
                      {channel.niche}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      Giọng điệu:
                    </span>{" "}
                    {channel.brandVoice}
                  </p>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {channel.bannedWords.length} từ cấm
                    </span>
                    <span>{channel.pastTopics.length} video cũ</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={`/projects/new?channelId=${channel.id}`}
                    className="flex items-center justify-between text-xs font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
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
