// Ambient declarations for markdown-it plugins that ship no TypeScript types.
// Kept minimal (the plugins are used only as `md.use(...)`), which is enough to
// satisfy `tsc --noEmit` without pulling in `any` across the codebase.

declare module "markdown-it-emoji" {
  import type MarkdownIt from "markdown-it";
  export const full: MarkdownIt.PluginSimple;
  export const bare: MarkdownIt.PluginSimple;
  const light: MarkdownIt.PluginSimple;
  export default light;
}

declare module "markdown-it-task-lists" {
  import type MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginWithOptions<{
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }>;
  export default plugin;
}

declare module "markdown-it-texmath" {
  import type MarkdownIt from "markdown-it";
  const plugin: MarkdownIt.PluginWithOptions<{ engine: unknown; delimiters?: string }>;
  export default plugin;
}
