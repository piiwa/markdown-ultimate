# Changelog

## [0.3.0] - 2026-03-26

### Added

- **Editor: search & replace** — Cmd+F / Ctrl+F now opens CodeMirror's built-in search panel (VS Code's native search cannot reach custom editor webviews)
- **Editor: fold/unfold** — fold gutter + Cmd+Shift+[ / ] to collapse/expand sections
- **Editor: multi-cursor** — rectangular selection via Alt+click drag
- **Editor: bracket matching & auto-close** — highlights matching brackets, auto-closes `(`, `[`, `{`, etc.
- **Editor: active line highlight** — current line and its gutter are visually highlighted
- **Editor: indent with Tab** — Tab / Shift+Tab for indentation
- **Pre-commit hooks** — Husky + lint-staged ensures ESLint and Prettier run on every commit

### Fixed

- **PDF export: double margins** — removed redundant CSS padding on `.markdown-body` that stacked with Puppeteer margins, causing ~28mm effective margins instead of 15mm
- **PDF export: content cut across pages** — added `@media print` rules with `page-break-inside: avoid` on code blocks, tables, images, blockquotes, and Mermaid diagrams; `page-break-after: avoid` on headings; `orphans: 3` / `widows: 3` on paragraphs
- **PDF/PNG export: local images not loading** — inject `<base href>` tag pointing to the markdown file's directory so relative image paths resolve
- **PDF/PNG export: Mermaid diagrams not rendered** — replaced `startOnLoad` with explicit `mermaid.run()` + `waitForFunction` to ensure SVG rendering completes before capture
- **PDF/PNG export: inconsistent layout** — set `page.setViewport({ width: 1200 })` instead of relying on Puppeteer's 800x600 default
- **Mermaid CDN: fragile SRI hash** — pinned version to `mermaid@11.4.1` and removed integrity hash that broke on CDN updates
- **Custom editor not activating from extensions** — markdown files opened programmatically by other extensions (Claude Code, GitLens, etc.) via `showTextDocument()` now automatically reopen with Markdown Ultimate

### Changed

- PDF margins reduced from 20mm to 15mm for better content-to-page ratio
- First heading no longer has unnecessary top margin in exports
- External links in PDF now show their URL in parentheses after the link text

## [0.2.0] - 2026-03-22

### Added

- `configurationDefaults` to ensure Markdown Ultimate is the default editor for `.md` files everywhere (including files outside workspace)
- `markdownToggle.openWith` command to manually open any file with Markdown Ultimate
- Explicit `onCustomEditor` activation event for better compatibility

### Improved

- SEO: expanded keywords from 5 to 10 for better marketplace discoverability
- Updated CHANGELOG with all previous versions
- Fixed VS Code version requirement in README (1.80 → 1.85)
- CI workflow: aligned pnpm version with local environment

## [0.1.3] - 2026-03-20

### Improved

- Marketplace discoverability: badges, README, description
- Open VSX Registry support
- CI/CD workflow for automated publishing

## [0.1.2] - 2026-03-20

### Fixed

- Export styles: standalone CSS with GitHub-like colors instead of broken VSCode CSS variables
- Export now properly includes KaTeX CSS (extensionUri was not passed to buildHtml)

### Changed

- Export button changed from text to small SVG icon

## [0.1.1] - 2026-03-19

### Fixed

- Publisher ID corrected to `piwa`

### Security

- Mermaid `securityLevel` set to `"strict"`
- Added SRI integrity hash on CDN mermaid.js in export HTML

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
