// Abbreviations that stay upper case in race control messages.
const KEEP = new Set(["DRS", "VSC", "SC", "FIA", "ERS", "PU", "FP1", "FP2", "FP3", "Q1", "Q2", "Q3", "SQ1", "SQ2", "SQ3", "DSQ", "DNF", "DNS"]);

/** Converts shouty race control text to sentence case, keeping abbreviations and driver codes. */
export function sentenceCase(text: string): string {
  if (!text || text !== text.toUpperCase()) return text;
  const lowered = text
    .split(/(\s+)/)
    .map((word) => {
      const bare = word.replace(/[^A-Z0-9]/g, "");
      if (KEEP.has(bare)) return word;
      if (/^\([A-Z]{3}\)$/.test(word)) return word; // driver code, e.g. (VER)
      return word.toLowerCase();
    })
    .join("");
  const i = lowered.search(/[a-zA-Z]/);
  return i < 0 ? lowered : lowered.slice(0, i) + lowered[i].toUpperCase() + lowered.slice(i + 1);
}
