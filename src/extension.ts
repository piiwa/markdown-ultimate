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
    )
  );
}

export function deactivate() {}
