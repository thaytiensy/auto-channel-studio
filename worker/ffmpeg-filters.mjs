/**
 * Escapes Windows/POSIX file path for use in FFmpeg filter string (ass=...).
 *
 * @param {string} filePath
 * @returns {string} filter argument ready for -vf
 */
export function escapeAssFilterPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").replace(/:/g, "\\:");
  return `ass='${normalized}'`;
}

/**
 * Builds a Ken Burns zoompan filter chain with safe-zone ASS subtitles.
 *
 * @param {object} options
 * @param {number} options.durationSec
 * @param {string} options.assPath
 * @param {number} [options.fps=30]
 * @returns {string}
 */
export function buildKenBurnsFilter({
  durationSec,
  assPath,
  fps = 30,
}) {
  const totalFrames = Math.max(30, Math.round(durationSec * fps));
  const escapedAss = assPath.replace(/\\/g, "/").replace(/:/g, "\\:");
  return (
    `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,` +
    `zoompan=z='min(zoom+0.0007,1.08)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps},` +
    `ass='${escapedAss}'`
  );
}
