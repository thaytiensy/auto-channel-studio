"use client";

import { useState, type FormEvent } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { BannedWordsInput } from "@/components/BannedWordsInput";
import type { ChannelProfile } from "@/schemas";

interface ChannelFormProps {
  onSuccess: (channel: ChannelProfile) => void;
  onCancel?: () => void;
}

export function ChannelForm({ onSuccess, onCancel }: ChannelFormProps) {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          niche: niche.trim(),
          brandVoice: brandVoice.trim(),
          bannedWords,
          pastTopics: [],
        }),
      });

      const data = (await res.json()) as {
        channel?: ChannelProfile;
        error?: string;
      };

      if (!res.ok || !data.channel) {
        throw new Error(data.error || "Không thể tạo kênh mới");
      }

      setName("");
      setNiche("");
      setBrandVoice("");
      setBannedWords([]);
      onSuccess(data.channel);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tạo kênh"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Tạo Hồ Sơ Kênh Mới (Channel Memory)
        </h3>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Tên kênh *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: AI Khám Phá, Tài Chính 3 Phút..."
          className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Ngách nội dung (Niche) *
          </label>
          <input
            type="text"
            required
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ví dụ: Công nghệ AI, Tin tức tài chính..."
            className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Giọng điệu thương hiệu (Brand Voice) *
          </label>
          <input
            type="text"
            required
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Ví dụ: Hài hước, Chuyên gia, Kịch tính..."
            className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Danh sách từ cấm / Nhạy cảm (Policy Banned Words)
        </label>
        <BannedWordsInput
          words={bannedWords}
          onChange={setBannedWords}
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-3 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim() || !niche.trim()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <PlusCircle className="w-3.5 h-3.5" />
          )}
          Lưu Kênh
        </button>
      </div>
    </form>
  );
}
