# Contributing to Markdown Ultimate

Thanks for helping out! This is a small, focused VS Code extension and
contributions are very welcome.

## Prerequisites

- Node.js 18+ (CI uses 20)
- [pnpm](https://pnpm.io/) 8 (`corepack enable` then `corepack use pnpm@8`)
- VS Code 1.85+
- Google Chrome / Chromium is optional — only needed to exercise direct PDF/PNG export

## Getting started

```bash
pnpm install          # install dependencies
pnpm watch            # rebuild extension + webview bundles on change
```

Then press **F5** in VS Code ("Run Extension") to launch an Extension
Development Host with the extension loaded. Open any `.md` file to try it.

## Everyday commands

| Command | What it does |
| --- | --- |
| `pnpm watch` | Rebuild on change (extension host + webview bundles) |
| `pnpm build` | One-off production build |
| `pnpm typecheck` | `tsc --noEmit` — **must pass** (esbuild does not type-check) |
| `pnpm test` | Run the vitest unit tests |
| `pnpm lint` | ESLint over `src/` |
| `pnpm format` | Prettier write |
| `pnpm package` | Produce a `.vsix` locally (does not publish) |

A Husky pre-commit hook runs ESLint + Prettier on staged files.

## Architecture (where things live)

- `src/extension.ts` — activation, command registration.
- `src/markdownEditorProvider.ts` — the `CustomTextEditorProvider`: wires the
  document to the webview and back.
- `src/webviewContent.ts` — builds the webview HTML (CSP, bootstrap).
- `src/webview/editor.ts` — the webview bundle: CodeMirror source editor,
  markdown-it preview, mode toggle, preview find.
- `src/exportManager.ts` — HTML / PDF / PNG export.
- Pure, unit-tested helpers: `exportPath.ts`, `webviewBootstrap.ts`, `mode.ts`,
  `findMatches.ts` (each has a `*.test.ts` next to it).

## Tests

Logic that can be isolated from the VS Code / DOM runtime lives in a pure module
with a `*.test.ts` beside it, run with vitest. **New behavior and bug fixes come
with a test.** Bugs that touch a user's files (export paths, escaping) are
exactly the ones a one-line test would have caught, so they must have one.

## Pull requests

1. Branch from `main` (`fix/…` or `feat/…`).
2. Keep the change focused; reference the issue it closes (`Closes #NN`).
3. Make sure `pnpm typecheck`, `pnpm test`, `pnpm lint`, and `pnpm build` pass —
   CI runs all four.
4. Update `CHANGELOG.md` under a new version heading if the change is
   user-visible.

Maintainer handles versioning, tagging, and publishing to the Marketplace and
Open VSX.
