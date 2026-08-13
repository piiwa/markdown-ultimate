export interface MatchRange {
  start: number;
  end: number;
}

/**
 * Finds all non-overlapping, literal occurrences of `query` in `text` and
 * returns their `[start, end)` offsets. Case-insensitive unless `caseSensitive`
 * is true. The query is matched literally (never as a regex).
 *
 * Pure and DOM-free so it can be unit-tested; the webview find bar maps these
 * offsets onto text nodes to build Ranges for the CSS Custom Highlight API.
 */
export function findMatchRanges(text: string, query: string, caseSensitive = false): MatchRange[] {
  if (!query) return [];

  const haystack = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  const ranges: MatchRange[] = [];

  let from = 0;
  for (;;) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) break;
    ranges.push({ start: idx, end: idx + needle.length });
    from = idx + needle.length; // non-overlapping
  }
  return ranges;
}
