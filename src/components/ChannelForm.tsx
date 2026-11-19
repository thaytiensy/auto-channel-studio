"use client";

import { useState, type FormEvent } from "react";
import { PlusCircle, Loader2, Sparkles } from "lucide-react";
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

      const data = (await res.json()) as { channel?: ChannelProfile; error?: string };

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
      className="space-y-4 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Tạo Hồ Sơ Kênh Mới (Channel Memory)
        </h3>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
          Tên kênh *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: AI Khám Phá, Tài Chính 3 Phút, Thời Trang Trẻ..."
          className="w-full px-3.5 py-2.5 text-xs border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Ngách nội dung (Niche) *
          </label>
          <input
            type="text"
            required
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ví dụ: Công nghệ AI, Tin tức thời trang, Đời sống..."
            className="w-full px-3.5 py-2.5 text-xs border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Giọng điệu thương hiệu (Brand Voice) *
          </label>
          <input
            type="text"
            required
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Ví dụ: Hài hước, Chuyên gia, Truyền cảm hứng..."
            className="w-full px-3.5 py-2.5 text-xs border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
          Danh sách từ cấm / Nhạy cảm (Policy Banned Words)
        </label>
        <BannedWordsInput
          words={bannedWords}
          onChange={setBannedWords}
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim() || !niche.trim()}
          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
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
