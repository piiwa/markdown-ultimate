import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
import MarkdownIt from "markdown-it";
import { full as markdownItEmoji } from "markdown-it-emoji";
import markdownItTaskLists from "markdown-it-task-lists";
import markdownItAnchor from "markdown-it-anchor";
import markdownItTocDoneRight from "markdown-it-toc-done-right";
import texmath from "markdown-it-texmath";
import katex from "katex";
import mermaid from "mermaid";
// KaTeX CSS is loaded via webviewContent.ts as a <link> tag

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

declare global {
  interface Window {
    __initialText: string;
  }
}

const vscode = acquireVsCodeApi();
// --- Mermaid setup ---
const isDark =
  document.body.classList.contains("vscode-dark") ||
  document.body.getAttribute("data-vscode-theme-kind") === "vscode-dark";
mermaid.initialize({
  startOnLoad: false,
  theme: isDark ? "dark" : "default",
  securityLevel: "loose",
});

// --- markdown-it with plugins ---
const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
  .use(markdownItEmoji)
  .use(markdownItTaskLists, { label: true, labelAfter: true })
  .use(markdownItAnchor, { permalink: false })
  .use(markdownItTocDoneRight)
  .use(texmath, { engine: katex, delimiters: "dollars" });

// Custom fence renderer for mermaid code blocks
const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules);
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim() === "mermaid") {
    return `<div class="mermaid">${md.utils.escapeHtml(token.content)}</div>`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

async function renderMermaidDiagrams() {
  await mermaid.run({ querySelector: ".mermaid" });
}

let mode: "source" | "preview" = "source";

// --- CodeMirror setup ---
const initialText = window.__initialText ?? "";

const state = EditorState.create({
  doc: initialText,
  extensions: [
    lineNumbers(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    history(),
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        vscode.postMessage({
          type: "edit",
          text: update.state.doc.toString(),
        });
      }
    }),
    EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "var(--vscode-editor-font-size, 14px)",
        backgroundColor: "var(--vscode-editor-background)",
        color: "var(--vscode-editor-foreground)",
      },
      ".cm-content": {
        fontFamily: "var(--vscode-editor-font-family, monospace)",
        caretColor: "var(--vscode-editorCursor-foreground)",
        padding: "8px 0",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--vscode-editorCursor-foreground)",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: "var(--vscode-editor-selectionBackground) !important",
      },
      ".cm-gutters": {
        backgroundColor: "var(--vscode-editorGutter-background, var(--vscode-editor-background))",
        color: "var(--vscode-editorLineNumber-foreground, #858585)",
        borderRight: "1px solid var(--vscode-editorWidget-border, transparent)",
      },
      ".cm-activeLineGutter": {
        color: "var(--vscode-editorLineNumber-activeForeground, var(--vscode-editor-foreground))",
      },
      ".cm-activeLine": {
        backgroundColor: "var(--vscode-editor-lineHighlightBackground, transparent)",
      },
    }),
    EditorView.lineWrapping,
  ],
});

const editorView = new EditorView({
  state,
  parent: document.getElementById("source")!,
});

// --- Toggle logic ---
const sourceEl = document.getElementById("source")!;
const previewEl = document.getElementById("preview")!;
const btnPreview = document.getElementById("btn-preview")!;
const btnMarkdown = document.getElementById("btn-markdown")!;

// --- Scroll sync ---
let scrollPercent = 0;

function saveScrollPosition() {
  if (mode === "source") {
    const scrollEl = sourceEl.querySelector(".cm-scroller") as HTMLElement | null;
    if (scrollEl) {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      scrollPercent = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
    }
  } else {
    const { scrollTop, scrollHeight, clientHeight } = previewEl;
    scrollPercent = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
  }
}

function restoreScrollPosition(target: "source" | "preview") {
  requestAnimationFrame(() => {
    if (target === "preview") {
      const { scrollHeight, clientHeight } = previewEl;
      previewEl.scrollTop = scrollPercent * (scrollHeight - clientHeight);
    } else {
      const scrollEl = sourceEl.querySelector(".cm-scroller") as HTMLElement | null;
      if (scrollEl) {
        const { scrollHeight, clientHeight } = scrollEl;
        scrollEl.scrollTop = scrollPercent * (scrollHeight - clientHeight);
      }
    }
  });
}

function switchToPreview() {
  if (mode === "preview") return;
  saveScrollPosition();
  const content = editorView.state.doc.toString();
  previewEl.innerHTML = md.render(content);
  sourceEl.style.display = "none";
  previewEl.style.display = "block";
  mode = "preview";
  btnPreview.classList.add("active");
  btnMarkdown.classList.remove("active");
  vscode.postMessage({ type: "modeChanged", mode: "preview" });
  renderMermaidDiagrams();
  restoreScrollPosition("preview");
}

function switchToSource() {
  if (mode === "source") return;
  saveScrollPosition();
  sourceEl.style.display = "block";
  previewEl.style.display = "none";
  mode = "source";
  btnMarkdown.classList.add("active");
  btnPreview.classList.remove("active");
  vscode.postMessage({ type: "modeChanged", mode: "source" });
  editorView.focus();
  restoreScrollPosition("source");
}

const btnExport = document.getElementById("btn-export")!;

btnPreview.addEventListener("click", switchToPreview);
btnMarkdown.addEventListener("click", switchToSource);
btnExport.addEventListener("click", () => {
  vscode.postMessage({ type: "export" });
});

// --- Editor actions (keyboard shortcuts) ---
function wrapSelection(marker: string) {
  const { from, to } = editorView.state.selection.main;
  const selected = editorView.state.sliceDoc(from, to);

  // Check if already wrapped — toggle off
  const markerLen = marker.length;
  const before = editorView.state.sliceDoc(from - markerLen, from);
  const after = editorView.state.sliceDoc(to, to + markerLen);
  if (before === marker && after === marker) {
    editorView.dispatch({
      changes: [
        { from: from - markerLen, to: from, insert: "" },
        { from: to, to: to + markerLen, insert: "" },
      ],
    });
    return;
  }

  if (
    selected.startsWith(marker) &&
    selected.endsWith(marker) &&
    selected.length >= markerLen * 2
  ) {
    editorView.dispatch({
      changes: { from, to, insert: selected.slice(markerLen, -markerLen) },
    });
  } else if (from === to) {
    // No selection — insert markers and place cursor between
    editorView.dispatch({
      changes: { from, to, insert: `${marker}${marker}` },
      selection: { anchor: from + markerLen },
    });
  } else {
    editorView.dispatch({
      changes: { from, to, insert: `${marker}${selected}${marker}` },
    });
  }
}

function handleHeading(direction: "up" | "down") {
  const { from } = editorView.state.selection.main;
  const line = editorView.state.doc.lineAt(from);
  const text = line.text;
  const match = text.match(/^(#{0,6})\s*/);
  const currentLevel = match ? match[1].length : 0;

  if (direction === "up") {
    if (currentLevel >= 6) return;
    if (currentLevel === 0) {
      editorView.dispatch({
        changes: { from: line.from, to: line.from, insert: "# " },
      });
    } else {
      editorView.dispatch({
        changes: {
          from: line.from,
          to: line.from + currentLevel,
          insert: "#".repeat(currentLevel + 1),
        },
      });
    }
  } else {
    if (currentLevel <= 0) return;
    if (currentLevel === 1) {
      // Remove "# " or "#"
      const removeLen = text.startsWith("# ") ? 2 : 1;
      editorView.dispatch({
        changes: { from: line.from, to: line.from + removeLen, insert: "" },
      });
    } else {
      editorView.dispatch({
        changes: {
          from: line.from,
          to: line.from + currentLevel,
          insert: "#".repeat(currentLevel - 1),
        },
      });
    }
  }
}

function toggleCheckbox() {
  const { from } = editorView.state.selection.main;
  const line = editorView.state.doc.lineAt(from);
  const text = line.text;

  if (text.match(/^\s*- \[x\]/)) {
    // Uncheck
    const idx = text.indexOf("[x]");
    editorView.dispatch({
      changes: { from: line.from + idx, to: line.from + idx + 3, insert: "[ ]" },
    });
  } else if (text.match(/^\s*- \[ \]/)) {
    // Check
    const idx = text.indexOf("[ ]");
    editorView.dispatch({
      changes: { from: line.from + idx, to: line.from + idx + 3, insert: "[x]" },
    });
  } else if (text.match(/^\s*-\s/)) {
    // Convert list item to checkbox
    const idx = text.indexOf("- ");
    editorView.dispatch({
      changes: { from: line.from + idx, to: line.from + idx + 2, insert: "- [ ] " },
    });
  } else {
    // Add checkbox
    const indent = text.match(/^\s*/)?.[0] ?? "";
    editorView.dispatch({
      changes: { from: line.from, to: line.from + indent.length, insert: `${indent}- [ ] ` },
    });
  }
}

const editorActions: Record<string, () => void> = {
  toggleBold: () => wrapSelection("**"),
  toggleItalic: () => wrapSelection("*"),
  toggleStrikethrough: () => wrapSelection("~~"),
  headingUp: () => handleHeading("up"),
  headingDown: () => handleHeading("down"),
  toggleCheckbox,
};

// --- Receive messages from extension ---
window.addEventListener("message", (event) => {
  const msg = event.data;
  if (msg.type === "switchMode") {
    if (msg.mode === "preview") {
      switchToPreview();
    } else {
      switchToSource();
    }
  } else if (msg.type === "editorAction") {
    const action = editorActions[msg.action];
    if (action) action();
  } else if (msg.type === "docChanged") {
    const currentText = editorView.state.doc.toString();
    if (msg.text !== currentText) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: currentText.length,
          insert: msg.text,
        },
      });
      if (mode === "preview") {
        previewEl.innerHTML = md.render(msg.text);
      }
    }
  }
});
