import * as vscode from "vscode";
import { getWebviewHtml } from "./webviewContent";
import { showExportMenu } from "./exportManager";

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

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Track active panel and document
    this.activePanel = webviewPanel;
    this.activeDocument = document;
    vscode.commands.executeCommand("setContext", "markdownToggle.mode", "source");
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
      katexCssUri
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

    webviewPanel.onDidDispose(() => {
      messageDisposable.dispose();
      changeDisposable.dispose();
      if (this.activePanel === webviewPanel) {
        this.activePanel = undefined;
        vscode.commands.executeCommand("setContext", "markdownToggle.active", false);
      }
    });
  }
}
