"use client";

import { useState } from "react";
import {
  Smartphone,
  Shield,
  Heart,
  MessageCircle,
  Share2,
  Video,
} from "lucide-react";
import type { Scene } from "@/schemas";

interface SafeZonePreviewProps {
  selectedScene: Scene | null;
  renderedVideoPath: string | null;
}

export function SafeZonePreview({
  selectedScene,
  renderedVideoPath,
}: SafeZonePreviewProps) {
  const [showSafeZone, setShowSafeZone] = useState(true);

  const videoFileName = renderedVideoPath
    ? renderedVideoPath.split(/[/\\]/).pop()
    : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-72">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          Preview Safe Zone (9:16)
        </span>
        <button
          type="button"
          onClick={() => setShowSafeZone((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
            showSafeZone
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}
        >
          <Shield className="w-3 h-3" />
          Safe Zone
        </button>
      </div>

      <div className="relative w-72 aspect-[9/16] bg-zinc-950 rounded-3xl border-4 border-zinc-800 shadow-2xl overflow-hidden flex flex-col justify-between p-4 text-white select-none">
        {/* Top Header info */}
        <div className="z-10 flex items-center justify-between text-[11px] text-zinc-400">
          <span>
            {selectedScene
              ? `Cảnh #${selectedScene.orderIndex + 1}`
              : "Chưa chọn cảnh"}
          </span>
          <span>
            {selectedScene ? `${selectedScene.actualDurationMs / 1000}s` : ""}
          </span>
        </div>

        {/* Center content */}
        <div className="z-10 my-auto text-center px-2">
          {selectedScene ? (
            <div className="space-y-2">
              {selectedScene.textHook && (
                <div className="inline-block px-2.5 py-1 bg-amber-400 text-zinc-950 text-[10px] font-extrabold uppercase rounded-md shadow-md">
                  {selectedScene.textHook}
                </div>
              )}
              <p className="text-xs font-semibold leading-relaxed drop-shadow-md text-white">
                {selectedScene.spokenText}
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              Chọn một cảnh từ danh sách bên trái để xem bố cục.
            </p>
          )}
        </div>

        {/* Bottom Footer status */}
        <div className="z-10 text-[10px] text-zinc-400">
          {videoFileName ? (
            <div className="flex items-center gap-1 text-emerald-400 font-mono">
              <Video className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{videoFileName}</span>
            </div>
          ) : (
            <span className="text-zinc-500">Chưa render MP4</span>
          )}
        </div>

        {/* Safe Zone Overlay */}
        {showSafeZone && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Right interaction column */}
            <div className="absolute right-1 top-24 bottom-24 w-12 bg-red-500/20 border-l border-red-500/40 flex flex-col items-center justify-around py-4 text-[9px] text-red-200">
              <div className="flex flex-col items-center">
                <Heart className="w-3.5 h-3.5" />
                <span>Thích</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat</span>
              </div>
              <div className="flex flex-col items-center">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </div>
            </div>

            {/* Bottom metadata area */}
            <div className="absolute bottom-2 left-2 right-14 h-16 bg-amber-500/20 border-t border-amber-500/40 p-1.5 flex flex-col justify-end text-[9px] text-amber-200">
              <span className="font-semibold">@ten_kenh • 1 giờ trước</span>
              <span className="truncate">#khampha #aivideo #autochannel</span>
            </div>

            {/* Center safe area */}
            <div className="absolute top-14 bottom-20 left-3 right-14 border border-dashed border-emerald-400/60 rounded-lg flex items-center justify-center p-2 text-center">
              <span className="bg-black/70 px-2 py-0.5 text-[9px] text-emerald-300 font-mono tracking-wider uppercase rounded">
                VÙNG AN TOÀN HIỂN THỊ CHỮ
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
