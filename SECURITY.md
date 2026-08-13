# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately via GitHub's ["Report a vulnerability"](https://github.com/piiwa/markdown-ultimate/security/advisories/new)
(Security → Advisories) so a fix can ship before details are public. Include the
extension version, VS Code version, OS, and steps to reproduce. Expect an
acknowledgement within a few days.

## Threat model

Markdown Ultimate renders and exports markdown that may come from an untrusted
workspace (VS Code's Workspace Trust model). The design assumptions:

- **Webview** — scripts run under a strict Content Security Policy (a
  per-webview cryptographic nonce; no `unsafe-eval`; `default-src 'none'`), with
  `localResourceRoots` restricted to the extension's own `dist/` and `media/`.
  Mermaid runs with `securityLevel: "strict"`.
- **Export** — the direct PDF/PNG path launches a browser binary. The
  `markdownToggle.chromePath` setting is machine-scoped and listed under
  `capabilities.untrustedWorkspaces.restrictedConfigurations`, so a workspace
  cannot point it at an arbitrary executable.

## Known hardening in progress

- The exported HTML is not yet sanitized and has no embedded CSP; treat exported
  files from untrusted documents with the same caution as the source. Sanitizing
  export output is tracked for a future release.
- Dependency advisories are reviewed with `pnpm audit` before releases; the
  webview-facing libraries (markdown-it, mermaid) are prioritized over
  transitive tooling dependencies.
