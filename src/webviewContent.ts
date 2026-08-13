import * as vscode from "vscode";
import { randomBytes } from "crypto";
import { escapeInlineScript } from "./webviewBootstrap";

export function getWebviewHtml(
  webview: vscode.Webview,
  initialText: string,
  editorJsUri: vscode.Uri,
  cssUri: vscode.Uri,
  katexCssUri: vscode.Uri,
  initialMode: "source" | "preview" = "source"
): string {
  const nonce = getNonce();
  const escapedText = escapeInlineScript(initialText);

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src ${webview.cspSource} 'unsafe-inline';
             img-src ${webview.cspSource} https: data:;
             script-src 'nonce-${nonce}';
             font-src ${webview.cspSource} data:;">
  <link rel="stylesheet" href="${katexCssUri}">
  <link rel="stylesheet" href="${cssUri}">
  <style>
    #find-bar {
      position: fixed;
      top: 8px;
      right: 16px;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px;
      background: var(--vscode-editorWidget-background, #252526);
      color: var(--vscode-editorWidget-foreground, inherit);
      border: 1px solid var(--vscode-editorWidget-border, #454545);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      font-size: 12px;
    }
    #find-input {
      width: 180px;
      padding: 3px 6px;
      color: var(--vscode-input-foreground, inherit);
      background: var(--vscode-input-background, #3c3c3c);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 2px;
      outline: none;
    }
    #find-input:focus {
      border-color: var(--vscode-focusBorder, #007fd4);
    }
    #find-count {
      min-width: 44px;
      text-align: center;
      opacity: 0.8;
      font-variant-numeric: tabular-nums;
    }
    #find-bar button {
      padding: 2px 6px;
      color: inherit;
      background: transparent;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      line-height: 1;
    }
    #find-bar button:hover {
      background: var(--vscode-toolbar-hoverBackground, rgba(255, 255, 255, 0.1));
    }
    #preview::highlight(md-search) {
      background-color: var(--vscode-editor-findMatchHighlightBackground, rgba(234, 92, 0, 0.33));
    }
    #preview::highlight(md-search-current) {
      background-color: var(--vscode-editor-findMatchBackground, rgba(234, 92, 0, 0.66));
    }
  </style>
  <title>Markdown Editor</title>
</head>
<body>
  <div id="breadcrumb-bar">
    <div id="toggle-group" role="tablist" aria-label="Editor mode">
      <button id="btn-preview" class="toggle-tab${initialMode === "preview" ? " active" : ""}" role="tab" aria-selected="${initialMode === "preview" ? "true" : "false"}">Preview</button>
      <button id="btn-markdown" class="toggle-tab${initialMode === "source" ? " active" : ""}" role="tab" aria-selected="${initialMode === "source" ? "true" : "false"}">Markdown</button>
      <span class="toggle-separator"></span>
      <button id="btn-export" class="toggle-tab toggle-icon" title="Export" aria-label="Export">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1L8 10M8 10L5 7M8 10L11 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3 12L3 14L13 14L13 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      </button>
    </div>
  </div>
  <div id="find-bar" style="display:none;">
    <input id="find-input" type="text" placeholder="Find in preview" aria-label="Find in preview" />
    <span id="find-count"></span>
    <button id="find-prev" title="Previous match (Shift+Enter)" aria-label="Previous match">&#8593;</button>
    <button id="find-next" title="Next match (Enter)" aria-label="Next match">&#8595;</button>
    <button id="find-close" title="Close (Esc)" aria-label="Close find">&#10005;</button>
  </div>
  <div id="content-area">
    <div id="source"></div>
    <div id="preview" class="markdown-body" style="display:none;"></div>
  </div>

  <script nonce="${nonce}">
    window.__initialText = ${escapedText};
    window.__initialMode = ${JSON.stringify(initialMode)};
  </script>
  <script nonce="${nonce}" src="${editorJsUri}"></script>
</body>
</html>`;
}

function getNonce(): string {
  // Cryptographically strong nonce — a predictable nonce would weaken the CSP.
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(32);
  let text = "";
  for (let i = 0; i < bytes.length; i++) {
    text += possible.charAt(bytes[i] % possible.length);
  }
  return text;
}
