import fs from "node:fs";
import path from "node:path";

function formatAssTime(ms) {
  const totalCs = Math.max(0, Math.floor(ms / 10));
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const min = totalMin % 60;
  const hour = Math.floor(totalMin / 60);
  return `${hour}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function chunkWords(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const remaining = words.length - i;
    let size = 7;
    if (remaining <= 9) {
      size = remaining;
    } else if (remaining - size < 5) {
      size = Math.ceil(remaining / 2);
    }
    chunks.push(words.slice(i, i + size).join(" "));
    i += size;
  }
  return chunks;
}

/**
 * Builds a TikTok/Reels Safe Zone compliant ASS subtitle file.
 */
export function buildSceneAssFile({
  sceneId,
  spokenText = "",
  textHook = "",
  durationMs = 3500,
  outputDir,
}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const assPath = path.join(outputDir, `${sceneId}.ass`);

  const chunks = chunkWords(spokenText || textHook || "Auto Channel Studio");
  const count = Math.max(1, chunks.length);
  const chunkDurationMs = durationMs / count;

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,58,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,60,150,380,1
Style: Hook,Arial,48,&H0000FFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,8,60,60,260,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = [];

  // If textHook is provided, show it at the top safe zone during the entire scene
  if (textHook && textHook.trim()) {
    const hookStart = formatAssTime(0);
    const hookEnd = formatAssTime(durationMs);
    const cleanHook = textHook.trim().replace(/[\r\n]+/g, " ");
    events.push(
      `Dialogue: 1,${hookStart},${hookEnd},Hook,,0,0,0,,${cleanHook}`
    );
  }

  // Spoken text chunks distributed along scene duration
  chunks.forEach((chunk, idx) => {
    const startMs = idx * chunkDurationMs;
    const endMs = Math.min(durationMs, (idx + 1) * chunkDurationMs);
    const startStr = formatAssTime(startMs);
    const endStr = formatAssTime(endMs);
    const cleanChunk = chunk.replace(/[\r\n]+/g, " ");
    events.push(
      `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${cleanChunk}`
    );
  });

  const fullContent = header + events.join("\n") + "\n";
  fs.writeFileSync(assPath, fullContent, "utf8");
  return assPath;
}
