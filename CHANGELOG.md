# Changelog

## [0.1.0] - 2026-03-19

### Added

- In-place markdown source/preview toggle in the same editor tab
- CodeMirror 6 editor with syntax highlighting and line numbers
- Markdown rendering with markdown-it and plugins:
  - Emoji (`:smile:`, `:rocket:`, etc.)
  - Task lists (`- [x]` / `- [ ]`)
  - KaTeX math (`$inline$` and `$$block$$`)
  - Mermaid diagrams
  - Table of Contents (`${toc}`)
  - Anchored headings
- Export to HTML, PDF (via browser or Chrome), and PNG
- Keyboard shortcuts: bold, italic, strikethrough, heading up/down, checkbox toggle
- Scroll position sync between source and preview modes
- VS Code theme integration (light/dark)
