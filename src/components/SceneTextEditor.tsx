"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { Scene } from "@/schemas";

interface SceneTextEditorProps {
  spokenText: string;
  visualPrompt: string;
  projectId: string;
  sceneId: string;
  allScenesJson: string;
  onSaved: (newSpokenText: string, newVisualPrompt: string) => void;
  onCancel: () => void;
}

export function SceneTextEditor({
  spokenText,
  visualPrompt,
  projectId,
  sceneId,
  allScenesJson,
  onSaved,
  onCancel,
}: SceneTextEditorProps) {
  const [editText, setEditText] = useState(spokenText);
  const [editPrompt, setEditPrompt] = useState(visualPrompt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const scenes = JSON.parse(allScenesJson) as Scene[];
      const updated = scenes.map((s) => {
        if (s.sceneId !== sceneId) return s;
        return {
          ...s,
          spokenText: editText,
          visualLayer: {
            ...s.visualLayer,
            sourceType: s.visualLayer?.sourceType ?? "ai_image_ken_burns",
            visualPrompt: editPrompt,
          },
        };
      });

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: updated }),
      });

      if (!res.ok) throw new Error("Lưu cảnh thất bại");
      onSaved(editText, editPrompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl">
      <div>
        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
          Lời thoại (Spoken Text):
        </label>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={2}
          className="w-full p-2.5 bg-zinc-900 border border-emerald-500/50 rounded-xl text-xs leading-relaxed text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
          Mô tả ảnh AI (Visual Prompt):
        </label>
        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          rows={2}
          placeholder="Mô tả phong cách ảnh bằng tiếng Anh..."
          className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs leading-relaxed text-zinc-300 resize-none focus:outline-none focus:border-zinc-700"
        />
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Lưu Cảnh
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
        >
          Huỷ
        </button>
      </div>
    </div>
  );
}
