"use client";

import { useEffect, useState, Suspense, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { ProjectResultView } from "@/components/ProjectResultView";
import type { ChannelProfile, ProjectManifest } from "@/schemas";

function NewProjectForm() {
  const searchParams = useSearchParams();
  const preselectedChannelId = searchParams.get("channelId") || "";

  const [channels, setChannels] = useState<ChannelProfile[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState(preselectedChannelId);
  const [topic, setTopic] = useState("");
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<ProjectManifest | null>(null);
  const [policyWarnings, setPolicyWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const res = await fetch("/api/channels");
        const data = (await res.json()) as { channels?: ChannelProfile[] };
        if (data.channels) {
          setChannels(data.channels);
          if (!selectedChannelId && data.channels.length > 0) {
            setSelectedChannelId(data.channels[0].id);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Lỗi tải kênh");
      } finally {
        setLoadingChannels(false);
      }
    }
    fetchChannels();
  }, [selectedChannelId]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedChannelId || !topic.trim()) return;

    setGenerating(true);
    setError(null);
    setGeneratedProject(null);
    setPolicyWarnings([]);

    try {
      const res = await fetch("/api/projects/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          topic: topic.trim(),
        }),
      });

      const data = (await res.json()) as {
        project?: ProjectManifest;
        policyWarnings?: string[];
        error?: string;
      };

      if (!res.ok || !data.project) {
        throw new Error(data.error || "Không thể sinh kịch bản");
      }

      setGeneratedProject(data.project);
      setPolicyWarnings(data.policyWarnings ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleGenerate}
        className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4"
      >
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Thông Tin Đề Tài & Kênh Sở Hữu
        </h2>

        {error && (
          <div className="p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Chọn kênh mục tiêu *
            </label>
            <select
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              disabled={loadingChannels || generating || channels.length === 0}
              className="w-full px-3.5 py-2.5 text-xs border border-zinc-800 rounded-xl bg-zinc-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            >
              {channels.length === 0 ? (
                <option value="">(Chưa có kênh nào - hãy tạo kênh trước)</option>
              ) : (
                channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.niche})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Chủ đề kịch bản (Topic) *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generating}
              placeholder="Ví dụ: 3 công cụ AI tự động hóa video năm 2026..."
              className="w-full px-3.5 py-2.5 text-xs border border-zinc-800 rounded-xl bg-zinc-950 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={generating || !selectedChannelId || !topic.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Sinh Kịch Bản & Tạo Audio
          </button>
        </div>
      </form>

      {generatedProject && (
        <ProjectResultView
          project={generatedProject}
          policyWarnings={policyWarnings}
        />
      )}
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-12 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/channels"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Về Quản lý Kênh
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Khởi Tạo Dự Án & Sinh Kịch Bản (Script Engine)
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Hệ thống sẽ dựa vào phong cách kênh và tự động kiểm tra vi phạm chính sách
          từ cấm với Policy Auditor.
        </p>
      </div>

      <Suspense fallback={<div className="text-xs text-zinc-500">Đang tải biểu mẫu...</div>}>
        <NewProjectForm />
      </Suspense>
    </main>
  );
}
