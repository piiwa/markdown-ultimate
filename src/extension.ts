import * as vscode from "vscode";
import { MarkdownEditorProvider } from "./markdownEditorProvider";

function isMarkdownFile(uri: vscode.Uri): boolean {
  return /\.(md|markdown)$/i.test(uri.fsPath);
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new MarkdownEditorProvider(context);

  // Set of URIs currently being reopened to avoid infinite loops
  const reopening = new Set<string>();

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(MarkdownEditorProvider.viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true },
      supportsMultipleEditorsPerDocument: false,
    }),
    vscode.commands.registerCommand("markdownToggle.showPreview", () => {
      provider.switchMode("preview");
    }),
    vscode.commands.registerCommand("markdownToggle.showSource", () => {
      provider.switchMode("source");
    }),
    vscode.commands.registerCommand("markdownToggle.openWith", () => {
      const uri = vscode.window.activeTextEditor?.document.uri;
      if (uri) {
        vscode.commands.executeCommand("vscode.openWith", uri, MarkdownEditorProvider.viewType);
      }
    }),
    ...[
      "toggleBold",
      "toggleItalic",
      "toggleStrikethrough",
      "headingUp",
      "headingDown",
      "toggleCheckbox",
    ].map((action) =>
      vscode.commands.registerCommand(`markdownToggle.${action}`, () => {
        provider.sendAction(action);
      })
    ),

    // Intercept markdown files opened in the standard text editor
    // (e.g. by other extensions like Claude Code) and reopen them
    // with the custom editor
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;
      const uri = editor.document.uri;
      if (uri.scheme !== "file" || !isMarkdownFile(uri)) return;

      const key = uri.toString();
      if (reopening.has(key)) return;

      // Check if user has explicitly chosen a different editor for markdown.
      // Our configurationDefaults set *.md → our editor, but inspect() lets
      // us see if the user has overridden that to something else.
      const inspect = vscode.workspace
        .getConfiguration("workbench")
        .inspect<Record<string, string>>("editorAssociations");
      const userAssoc = {
        ...(inspect?.globalValue ?? {}),
        ...(inspect?.workspaceValue ?? {}),
        ...(inspect?.workspaceFolderValue ?? {}),
      };
      const userOverride = userAssoc["*.md"] ?? userAssoc["*.markdown"];
      if (userOverride && userOverride !== MarkdownEditorProvider.viewType) {
        // User explicitly chose another editor — respect that
        return;
      }

      reopening.add(key);
      // Close the standard text editor tab and reopen with our custom editor
      vscode.commands
        .executeCommand("workbench.action.closeActiveEditor")
        .then(() =>
          vscode.commands.executeCommand("vscode.openWith", uri, MarkdownEditorProvider.viewType)
        )
        .then(
          () => reopening.delete(key),
          () => reopening.delete(key)
        );
    })
  );
}

export function deactivate() {}
