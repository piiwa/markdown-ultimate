import * as vscode from "vscode";
import * as path from "path";
import { getWebviewHtml } from "./webviewContent";
import { showExportMenu } from "./exportManager";
import { normalizeMode } from "./mode";
import { shouldApplyWebviewEdit } from "./editGuard";

export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = "markdownToggle.editor";

  private activePanel: vscode.WebviewPanel | undefined;
  private activeDocument: vscode.TextDocument | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {
    vscode.commands.executeCommand("setContext", "markdownToggle.mode", "source");
    vscode.commands.executeCommand("setContext", "markdownToggle.active", false);
  }

  public switchMode(mode: "preview" | "source") {
    if (this.activePanel) {
      this.activePanel.webview.postMessage({ type: "switchMode", mode });
    }
  }

  public sendAction(action: string) {
    if (this.activePanel) {
      this.activePanel.webview.postMessage({ type: "editorAction", action });
    }
  }

  public async export() {
    if (this.activeDocument) {
      await showExportMenu(this.activeDocument, this.context.extensionUri);
    }
  }

  private async reloadFromDisk(document: vscode.TextDocument): Promise<void> {
    // `workbench.action.files.revert` acts on the active editor, so focus
    // ours first (the notification may have been clicked much later).
    await vscode.commands
      .executeCommand("vscode.openWith", document.uri, MarkdownEditorProvider.viewType)
      .then(() => vscode.commands.executeCommand("workbench.action.files.revert"));

    // Some custom-editor setups do not implement revert; fall back to a
    // manual disk→document sync so the editor is never left half-reloaded.
    const diskText = Buffer.from(await vscode.workspace.fs.readFile(document.uri)).toString("utf8");
    if (diskText !== document.getText()) {
      const edit = new vscode.WorkspaceEdit();
      edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), diskText);
      await vscode.workspace.applyEdit(edit);
    }
    if (document.isDirty) {
      await document.save();
    }
  }

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Track active panel and document
    this.activePanel = webviewPanel;
    this.activeDocument = document;
    const initialMode = normalizeMode(
      vscode.workspace.getConfiguration("markdownToggle").get("defaultMode")
    );
    vscode.commands.executeCommand("setContext", "markdownToggle.mode", initialMode);
    vscode.commands.executeCommand("setContext", "markdownToggle.active", true);

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "dist"),
        vscode.Uri.joinPath(this.context.extensionUri, "media"),
      ],
    };

    const editorJsUri = webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview.js")
    );
    const cssUri = webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "preview.css")
    );
    const katexCssUri = webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "katex.min.css")
    );

    webviewPanel.webview.html = getWebviewHtml(
      webviewPanel.webview,
      document.getText(),
      editorJsUri,
      cssUri,
      katexCssUri,
      initialMode
    );

    // Track which panel is active
    webviewPanel.onDidChangeViewState(() => {
      if (webviewPanel.active) {
        this.activePanel = webviewPanel;
        this.activeDocument = document;
        vscode.commands.executeCommand("setContext", "markdownToggle.active", true);
      } else {
        if (this.activePanel === webviewPanel) {
          vscode.commands.executeCommand("setContext", "markdownToggle.active", false);
        }
      }
    });

    // --- Two-way sync ---
    let isApplyingEdit = false;

    const messageDisposable = webviewPanel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "edit") {
        // Applying a full-document replace whose text is identical to the
        // document still marks the document dirty in VS Code, which blocks
        // all future automatic reloads of external disk changes. The webview
        // annotates disk-reload syncs so they are not echoed back, but guard
        // here as well in case a message races in with stale text.
        if (!shouldApplyWebviewEdit(msg.text, document.getText())) return;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), msg.text);
        isApplyingEdit = true;
        await vscode.workspace.applyEdit(edit);
        isApplyingEdit = false;
      } else if (msg.type === "export") {
        this.export();
      } else if (msg.type === "modeChanged") {
        vscode.commands.executeCommand("setContext", "markdownToggle.mode", msg.mode);
      }
    });

    const changeDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() !== document.uri.toString()) return;
      if (isApplyingEdit) return;
      webviewPanel.webview.postMessage({
        type: "docChanged",
        text: e.document.getText(),
      });
    });

    // --- External disk changes while the document is dirty ---
    // Clean documents are auto-reloaded by VS Code (which fires the listener
    // above and updates both modes immediately). A dirty document is never
    // reloaded — unsaved webview edits win — but the editor would then look
    // silently stale, so offer an explicit reload.
    let dirtyNotified = false;
    const onDiskChange = async () => {
      // Give VS Code a moment to auto-reload a clean model first.
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!document.isDirty || dirtyNotified) return;
      dirtyNotified = true;
      const fileName = path.basename(document.uri.fsPath);
      const choice = await vscode.window.showInformationMessage(
        `${fileName} changed on disk, but you have unsaved edits.`,
        "Reload from Disk",
        "Keep My Changes"
      );
      dirtyNotified = false;
      if (choice === "Reload from Disk") {
        await this.reloadFromDisk(document);
      }
    };
    const fileWatcher =
      document.uri.scheme === "file"
        ? vscode.workspace.createFileSystemWatcher(document.uri.fsPath)
        : undefined;
    const watcherDisposables = fileWatcher
      ? [
          fileWatcher.onDidChange(onDiskChange),
          fileWatcher.onDidCreate(onDiskChange),
          fileWatcher.onDidDelete(onDiskChange),
        ]
      : [];

    webviewPanel.onDidDispose(() => {
      messageDisposable.dispose();
      changeDisposable.dispose();
      watcherDisposables.forEach((d) => d.dispose());
      fileWatcher?.dispose();
      if (this.activePanel === webviewPanel) {
        this.activePanel = undefined;
        vscode.commands.executeCommand("setContext", "markdownToggle.active", false);
      }
    });
  }
}
