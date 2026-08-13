/**
 * Serialises `text` into a JavaScript string literal that is safe to embed in
 * an inline `<script>` element.
 *
 * `JSON.stringify` alone does NOT escape `<`, so a document containing the
 * literal `</script>` closes the inline script element (the HTML parser doesn't
 * care that it's inside a JS string), leaving the bootstrap broken and the
 * editor empty — the first keystroke then overwrites the file. Escaping `<` as
 * the `<` unicode escape neutralises both `</script>` and `<!--` while
 * round-tripping back to the original string when evaluated.
 */
export function escapeInlineScript(text: string): string {
  return JSON.stringify(text).replace(/</g, "\\u003c");
}
