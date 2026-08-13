// Matches a GFM task-list item: an optional indent, a list marker (-, *, +, or
// an ordered "1." / "1)"), then a `[ ]` / `[x]` / `[X]` checkbox.
const TASK_RE = /^(\s*(?:[-*+]|\d+[.)])\s+\[)([ xX])(\])/;
const FENCE_RE = /^\s*(```|~~~)/;

/**
 * Toggles the checkbox of the task-list item at `index` (0-based, in document
 * order) and returns the new markdown. Checkboxes inside fenced code blocks are
 * ignored so the index matches what the preview actually renders. Out-of-range
 * indexes return the input unchanged.
 *
 * Pure and DOM-free so it can be unit-tested; the webview calls it when a
 * preview checkbox is clicked and feeds the result back into the editor.
 */
export function toggleTaskCheckbox(markdown: string, index: number): string {
  const lines = markdown.split("\n");
  let inFence = false;
  let seen = -1;

  for (let i = 0; i < lines.length; i++) {
    if (FENCE_RE.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = lines[i].match(TASK_RE);
    if (!m) continue;

    seen++;
    if (seen === index) {
      const toggled = m[2] === " " ? "x" : " ";
      lines[i] = m[1] + toggled + lines[i].slice(m[1].length + 1);
      return lines.join("\n");
    }
  }
  return markdown;
}
