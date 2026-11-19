/**
 * Escapes Windows/POSIX file path for use in FFmpeg filter string (ass=...).
 * Rules for FFmpeg filter on Windows:
 * 1. Replace all backslashes with forward slashes: \ -> /
 * 2. Escape colons (drive letters e.g. C: -> C\:)
 * 3. Wrap in single quotes: ass='C\:/path/to/file.ass'
 *
 * @param {string} filePath
 * @returns {string} filter argument ready for -vf
 */
export function escapeAssFilterPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").replace(/:/g, "\\:");
  return `ass='${normalized}'`;
}
