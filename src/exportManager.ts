import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import MarkdownIt from "markdown-it";
import { full as markdownItEmoji } from "markdown-it-emoji";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItAnchor from "markdown-it-anchor";
import markdownItTocDoneRight from "markdown-it-toc-done-right";
import texmath from "markdown-it-texmath";
import katex from "katex";

// Server-side markdown renderer (same plugins as webview)
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
  .use(markdownItEmoji)
  .use(markdownItTaskLists, { label: true, labelAfter: true })
  .use(markdownItAnchor, { permalink: false })
  .use(markdownItTocDoneRight)
  .use(texmath, { engine: katex, delimiters: "dollars" });

// Custom mermaid fence — renders as static div (mermaid.js not available server-side)
const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules);
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim() === "mermaid") {
    return `<div class="mermaid">${md.utils.escapeHtml(token.content)}</div>`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

export async function showExportMenu(document: vscode.TextDocument, extensionUri?: vscode.Uri) {
  const options: vscode.QuickPickItem[] = [
    {
      label: "$(file-code) HTML (standalone)",
      description: "Fichier HTML complet avec styles intégrés",
      detail: "Ouvrable dans n'importe quel navigateur",
    },
    {
      label: "$(browser) PDF (via navigateur)",
      description: "Ouvre le HTML dans votre navigateur",
      detail: 'Utilisez Cmd+P / Ctrl+P → "Save as PDF"',
    },
  ];

  // Check if Chrome is available for direct PDF/PNG
  const chromePath = findChrome();
  if (chromePath) {
    options.push(
      {
        label: "$(file-pdf) PDF (direct)",
        description: "Génère un PDF directement",
        detail: `Via Chrome détecté: ${path.basename(chromePath)}`,
      },
      {
        label: "$(file-media) PNG (capture)",
        description: "Capture une image du document rendu",
        detail: `Via Chrome détecté: ${path.basename(chromePath)}`,
      }
    );
  } else {
    options.push({
      label: "$(file-pdf) PDF (direct) — Chrome requis",
      description: "Chrome/Chromium non détecté",
      detail: "Installez Chrome ou configurez markdownToggle.chromePath",
    });
  }

  const selected = await vscode.window.showQuickPick(options, {
    placeHolder: "Choisir le format d'export",
  });

  if (!selected) return;

  const label = selected.label;

  if (label.includes("HTML")) {
    await exportHtml(document, extensionUri);
  } else if (label.includes("PDF (via navigateur)")) {
    await exportPdfViaBrowser(document, extensionUri);
  } else if (label.includes("PDF (direct)") && chromePath) {
    await exportPdfDirect(document, chromePath, extensionUri);
  } else if (label.includes("PNG") && chromePath) {
    await exportPng(document, chromePath, extensionUri);
  } else if (label.includes("Chrome requis")) {
    vscode.window.showWarningMessage(
      "Chrome/Chromium n'est pas détecté. Installez Chrome ou configurez le setting markdownToggle.chromePath."
    );
  }
}

function buildHtml(markdownText: string, extensionUri?: vscode.Uri): string {
  const rendered = md.render(markdownText);

  // Read KaTeX CSS for inline inclusion
  let katexCss = "";
  if (extensionUri) {
    const katexPath = vscode.Uri.joinPath(extensionUri, "media", "katex.min.css").fsPath;
    try {
      katexCss = fs.readFileSync(katexPath, "utf-8");
    } catch {}
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>${katexCss}</style>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #24292e;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .markdown-body {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 32px;
      word-wrap: break-word;
    }
    /* Headings */
    .markdown-body h1, .markdown-body h2, .markdown-body h3,
    .markdown-body h4, .markdown-body h5, .markdown-body h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      color: #24292e;
    }
    .markdown-body h1 {
      font-size: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #eaecef;
    }
    .markdown-body h2 {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid #eaecef;
    }
    .markdown-body h3 { font-size: 1.25em; }
    .markdown-body h4 { font-size: 1em; }
    .markdown-body h5 { font-size: 0.875em; }
    .markdown-body h6 { font-size: 0.85em; opacity: 0.8; }
    /* Paragraphs & text */
    .markdown-body p { margin-top: 0; margin-bottom: 16px; }
    .markdown-body a { color: #0366d6; text-decoration: none; }
    .markdown-body a:hover { text-decoration: underline; }
    .markdown-body strong { font-weight: 600; }
    /* Code */
    .markdown-body code {
      font-family: "SF Mono", Monaco, Menlo, Consolas, monospace;
      font-size: 0.9em;
      padding: 0.2em 0.4em;
      background: rgba(27, 31, 35, 0.05);
      border-radius: 4px;
    }
    .markdown-body pre {
      margin-top: 0;
      margin-bottom: 16px;
      padding: 16px;
      overflow: auto;
      background: #f6f8fa;
      border-radius: 6px;
      line-height: 1.45;
    }
    .markdown-body pre code {
      padding: 0;
      background: transparent;
      border-radius: 0;
      font-size: 0.9em;
    }
    /* Lists */
    .markdown-body ul, .markdown-body ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
    }
    .markdown-body li { margin-bottom: 4px; }
    .markdown-body li + li { margin-top: 4px; }
    /* Blockquotes */
    .markdown-body blockquote {
      margin: 0 0 16px 0;
      padding: 0 1em;
      border-left: 4px solid #dfe2e5;
      color: #6a737d;
    }
    /* Tables */
    .markdown-body table {
      margin-bottom: 16px;
      border-collapse: collapse;
      border-spacing: 0;
      width: auto;
      overflow: auto;
    }
    .markdown-body table th, .markdown-body table td {
      padding: 8px 16px;
      border: 1px solid #dfe2e5;
    }
    .markdown-body table th {
      font-weight: 600;
      background: #f6f8fa;
    }
    .markdown-body table tr:nth-child(2n) {
      background: #f6f8fa;
    }
    /* Horizontal rule */
    .markdown-body hr {
      height: 1px;
      margin: 24px 0;
      padding: 0;
      background-color: #e1e4e8;
      border: 0;
    }
    /* Images */
    .markdown-body img { max-width: 100%; border-radius: 4px; }
    /* Task lists */
    .markdown-body input[type="checkbox"] {
      margin-right: 0.5em;
      vertical-align: middle;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad: true, theme: 'default'});</script>
</head>
<body>
  <article class="markdown-body">
    ${rendered}
  </article>
</body>
</html>`;
}

async function exportHtml(document: vscode.TextDocument, extensionUri?: vscode.Uri) {
  const html = buildHtml(document.getText(), extensionUri);
  const mdPath = document.uri.fsPath;
  const htmlPath = mdPath.replace(/\.md$/i, ".html");

  fs.writeFileSync(htmlPath, html, "utf-8");
  const htmlDoc = await vscode.workspace.openTextDocument(htmlPath);
  await vscode.window.showTextDocument(htmlDoc);
  vscode.window.showInformationMessage(`Exported to ${path.basename(htmlPath)}`);
}

async function exportPdfViaBrowser(document: vscode.TextDocument, extensionUri?: vscode.Uri) {
  const html = buildHtml(document.getText(), extensionUri);
  const mdPath = document.uri.fsPath;
  const tmpHtmlPath = mdPath.replace(/\.md$/i, "_preview.html");

  fs.writeFileSync(tmpHtmlPath, html, "utf-8");
  await vscode.env.openExternal(vscode.Uri.file(tmpHtmlPath));
  vscode.window.showInformationMessage(
    'Le fichier s\'ouvre dans votre navigateur. Utilisez Cmd+P / Ctrl+P → "Save as PDF".'
  );
}

async function exportPdfDirect(
  document: vscode.TextDocument,
  chromePath: string,
  extensionUri?: vscode.Uri
) {
  try {
    const puppeteer = await import("puppeteer-core");
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const html = buildHtml(document.getText(), extensionUri);
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfPath = document.uri.fsPath.replace(/\.md$/i, ".pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
      printBackground: true,
    });

    await browser.close();
    vscode.window.showInformationMessage(`PDF exported to ${path.basename(pdfPath)}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`PDF export failed: ${message}`);
  }
}

async function exportPng(
  document: vscode.TextDocument,
  chromePath: string,
  extensionUri?: vscode.Uri
) {
  try {
    const puppeteer = await import("puppeteer-core");
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const html = buildHtml(document.getText(), extensionUri);
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pngPath = document.uri.fsPath.replace(/\.md$/i, ".png");
    await page.screenshot({ path: pngPath, fullPage: true });

    await browser.close();
    vscode.window.showInformationMessage(`PNG exported to ${path.basename(pngPath)}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`PNG export failed: ${message}`);
  }
}

function findChrome(): string | undefined {
  // Check user config first
  const configPath = vscode.workspace.getConfiguration("markdownToggle").get<string>("chromePath");
  if (configPath && fs.existsSync(configPath)) return configPath;

  const candidates =
    process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
          "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
      : process.platform === "win32"
        ? [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          ]
        : [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
          ];

  return candidates.find((p) => fs.existsSync(p));
}
