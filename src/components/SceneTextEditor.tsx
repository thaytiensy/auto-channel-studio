"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

interface SceneTextEditorProps {
  text: string;
  projectId: string;
  sceneId: string;
  allScenesJson: string;
  onSaved: (newText: string) => void;
  onCancel: () => void;
}

export function SceneTextEditor({
  text,
  projectId,
  sceneId,
  allScenesJson,
  onSaved,
  onCancel,
}: SceneTextEditorProps) {
  const [editText, setEditText] = useState(text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Parse scenes, update the matching one
      const scenes = JSON.parse(allScenesJson) as Array<{ sceneId: string; spokenText: string }>;
      const updated = scenes.map((s) =>
        s.sceneId === sceneId ? { ...s, spokenText: editText } : s
      );
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: updated }),
      });
      if (!res.ok) throw new Error("Lưu cảnh thất bại");
      onSaved(editText);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        rows={3}
        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-emerald-400 rounded-lg text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none"
      />
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Lưu Cảnh
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
        >
          Huỷ
        </button>
      </div>
    </div>
  );
}
