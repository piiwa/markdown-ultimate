# Changelog

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
