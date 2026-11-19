function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Scans a script or text segment for banned words using case-insensitive pattern matching.
 * Returns a deduplicated array of banned words found in the text.
 */
export function scanScriptForBannedWords(
  scriptText: string,
  bannedWords: string[]
): string[] {
  if (!scriptText || !Array.isArray(bannedWords) || bannedWords.length === 0) {
    return [];
  }

  const detected = new Set<string>();

  for (const rawWord of bannedWords) {
    const word = rawWord.trim();
    if (!word) continue;

    try {
      const pattern = new RegExp(escapeRegex(word), "i");
      if (pattern.test(scriptText)) {
        detected.add(word);
      }
    } catch {
      // Fallback to substring matching if regex compilation fails
      if (scriptText.toLowerCase().includes(word.toLowerCase())) {
        detected.add(word);
      }
    }
  }

  return Array.from(detected);
}
