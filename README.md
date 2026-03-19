# Markdown Ultimate

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/pierre.markdown-ultimate)](https://marketplace.visualstudio.com/items?itemName=pierre.markdown-ultimate)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/pierre.markdown-ultimate)](https://marketplace.visualstudio.com/items?itemName=pierre.markdown-ultimate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**All-in-one markdown editor for VS Code** — toggle between source and rendered preview in the same tab, no split panes needed. Inspired by Cursor's inline preview.

## Features

- **In-place toggle** — Switch between source editing and rich preview without opening a new tab
- **CodeMirror 6 editor** — Full-featured source editor with syntax highlighting and line numbers
- **KaTeX math** — Render LaTeX math expressions (`$inline$` and `$$block$$`)
- **Mermaid diagrams** — Flowcharts, sequence diagrams, Gantt charts, and more
- **Emoji** — Full emoji support with `:shortcodes:` (e.g., `:rocket:` → 🚀)
- **Task lists** — Interactive checkboxes with `- [x]` syntax
- **Table of Contents** — Auto-generated TOC with `${toc}`
- **Keyboard shortcuts** — Bold, italic, strikethrough, headings, checkboxes
- **Export** — HTML, PDF (via browser or Chrome), PNG
- **Scroll sync** — Preserves scroll position when toggling between modes
- **Theme-aware** — Adapts to your VS Code light/dark theme

## Installation

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for **"Markdown Ultimate"**
4. Click **Install**

Or install from the command line:

```bash
code --install-extension pierre.markdown-ultimate
```

## Usage

Simply open any `.md` or `.markdown` file — the extension automatically activates as the default editor.

Use the **Preview** / **Markdown** buttons in the top-right corner of the editor to switch between modes.

> **Note:** This extension registers as the default editor for markdown files. To use the standard VS Code text editor instead, right-click the editor tab and select **"Reopen Editor With..."**.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+B` / `Ctrl+B` | Toggle **bold** |
| `Cmd+I` / `Ctrl+I` | Toggle *italic* |
| `Alt+S` | Toggle ~~strikethrough~~ |
| `Cmd+Shift+]` / `Ctrl+Shift+]` | Increase heading level |
| `Cmd+Shift+[` / `Ctrl+Shift+[` | Decrease heading level |
| `Alt+C` | Toggle checkbox |

Shortcuts are only active in source editing mode.

## Export

Click the export icon (↓) next to the Preview/Markdown buttons to export your document:

| Format | Description |
|--------|-------------|
| **HTML (standalone)** | Complete HTML file with embedded styles, viewable in any browser |
| **PDF (via browser)** | Opens rendered HTML in your browser — use `Cmd+P` → "Save as PDF" |
| **PDF (direct)** | Generates PDF directly using Chrome/Chromium (requires Chrome installed) |
| **PNG (capture)** | Full-page screenshot of the rendered document (requires Chrome installed) |

### Chrome for PDF/PNG Export

Direct PDF and PNG export require Google Chrome or Chromium installed on your system. The extension auto-detects common installation paths. You can also set a custom path:

```json
{
  "markdownToggle.chromePath": "/path/to/chrome"
}
```

## Supported Markdown Features

- **Standard Markdown** — Headings, paragraphs, links, images, code blocks, blockquotes, lists, tables, horizontal rules
- **KaTeX Math** — `$E = mc^2$` for inline, `$$\sum_{i=1}^n x_i$$` for block
- **Mermaid Diagrams** — Use ` ```mermaid ` code blocks
- **Emoji** — `:smile:`, `:rocket:`, `:tada:`, and [all standard shortcodes](https://www.webfx.com/tools/emoji-cheat-sheet/)
- **Task Lists** — `- [x] Done` / `- [ ] Todo`
- **Table of Contents** — Insert `${toc}` anywhere in your document
- **Anchored Headings** — All headings get automatic anchor links

## Requirements

- VS Code 1.80.0 or later
- Chrome/Chromium (optional, for direct PDF/PNG export only)

## License

[MIT](LICENSE)
