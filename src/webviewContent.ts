import * as vscode from "vscode";

export function getWebviewHtml(
  webview: vscode.Webview,
  initialText: string,
  editorJsUri: vscode.Uri,
  cssUri: vscode.Uri,
  katexCssUri: vscode.Uri
): string {
  const nonce = getNonce();
  const escapedText = JSON.stringify(initialText);

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
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
