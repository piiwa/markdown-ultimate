import * as vscode from "vscode";
import { randomBytes } from "crypto";
import { escapeInlineScript } from "./webviewBootstrap";

export function getWebviewHtml(
  webview: vscode.Webview,
  initialText: string,
  editorJsUri: vscode.Uri,
  cssUri: vscode.Uri,
  katexCssUri: vscode.Uri
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
  <title>Markdown Editor</title>
</head>
<body>
  <div id="breadcrumb-bar">
    <div id="toggle-group">
      <button id="btn-preview" class="toggle-tab">Preview</button>
      <button id="btn-markdown" class="toggle-tab active">Markdown</button>
      <span class="toggle-separator"></span>
      <button id="btn-export" class="toggle-tab toggle-icon" title="Export">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L8 10M8 10L5 7M8 10L11 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3 12L3 14L13 14L13 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      </button>
    </div>
  </div>
  <div id="content-area">
    <div id="source"></div>
    <div id="preview" class="markdown-body" style="display:none;"></div>
  </div>

  <script nonce="${nonce}">
    window.__initialText = ${escapedText};
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
