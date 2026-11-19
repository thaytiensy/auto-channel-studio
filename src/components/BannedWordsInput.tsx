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
          className="flex-1 px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={addWord}
          disabled={disabled || !inputVal.trim()}
          className="px-3 py-2 text-xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        {words.length === 0 ? (
          <span className="text-xs text-zinc-400 italic">
            Chưa có từ cấm nào được thêm.
          </span>
        ) : (
          words.map((word, idx) => (
            <span
              key={`${word}-${idx}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-full"
            >
              <span>{word}</span>
              <button
                type="button"
                onClick={() => removeWord(idx)}
                disabled={disabled}
                className="hover:text-red-900 dark:hover:text-red-100 rounded-full p-0.5"
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
