"use client";

import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface BannedWordsInputProps {
  words: string[];
  onChange: (words: string[]) => void;
  disabled?: boolean;
}

export function BannedWordsInput({
  words,
  onChange,
  disabled = false,
}: BannedWordsInputProps) {
  const [inputVal, setInputVal] = useState("");

  const addWord = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    const exists = words.some(
      (w) => w.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      onChange([...words, trimmed]);
    }
    setInputVal("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addWord();
    }
  };

  const removeWord = (indexToRemove: number) => {
    onChange(words.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Nhập từ cấm rồi nhấn Enter hoặc Thêm..."
          className="flex-1 px-3.5 py-2.5 text-xs border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 transition-all"
        />
        <button
          type="button"
          onClick={addWord}
          disabled={disabled || !inputVal.trim()}
          className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
        {words.length === 0 ? (
          <span className="text-xs text-zinc-500 italic p-1">
            Chưa có từ cấm nào được thêm.
          </span>
        ) : (
          words.map((word, idx) => (
            <span
              key={`${word}-${idx}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-lg"
            >
              <span>{word}</span>
              <button
                type="button"
                onClick={() => removeWord(idx)}
                disabled={disabled}
                className="hover:text-rose-100 rounded-full p-0.5 transition-colors"
                aria-label={`Xóa từ cấm ${word}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
