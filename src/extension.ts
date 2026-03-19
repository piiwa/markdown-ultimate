import * as vscode from "vscode";
import { MarkdownEditorProvider } from "./markdownEditorProvider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new MarkdownEditorProvider(context);

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
    )
  );
}

export function deactivate() {}
