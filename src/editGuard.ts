/**
 * Guard for webview → document sync.
 *
 * VS Code marks a TextDocument dirty whenever an edit is applied to it — even
 * a full-document replace whose text is identical to the current content. Once
 * dirty, VS Code stops auto-reloading the document when the file changes on
 * disk, so external edits silently stop showing up in the editor.
 *
 * The webview echoes applied disk-reload text back as `edit` messages
 * (CodeMirror's updateListener), so those echoes must never reach applyEdit.
 */
export function shouldApplyWebviewEdit(webviewText: string, documentText: string): boolean {
  return webviewText !== documentText;
}
