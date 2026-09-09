/**
 * Runs inside the VS Code extension host (via @vscode/test-electron).
 *
 * Verifies the full disk-change → editor chain with the REAL webview running:
 *
 *   1. external disk change, editor clean  -> document model auto-reloads
 *      and the webview is updated; crucially the webview's "echo" (posting
 *      the applied disk text back as an edit) must NOT mark the doc dirty.
 *   2. repeated disk changes while clean   -> keep showing up immediately.
 *   3. unsaved edits in the editor         -> external change must NOT
 *      clobber them (dirty docs are never auto-reloaded).
 */
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(pred, timeout = 8000, step = 100) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await pred()) return true;
    } catch {
      /* ignore transient */
    }
    await sleep(step);
  }
  return false;
}

function findDoc(uri) {
  return vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.toString());
}

const log = (...args) => console.log("[disktest]", ...args);
let failures = 0;
function expect(label, cond) {
  log((cond ? "PASS" : "FAIL") + " —", label);
  if (!cond) failures++;
}

async function run() {
  const workspace = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const file = path.join(workspace, "disk-test.md");
  fs.writeFileSync(file, "# One\n\nline-a\n");
  const uri = vscode.Uri.file(file);

  // --- Open with the Markdown Ultimate custom editor ---
  await vscode.commands.executeCommand("vscode.openWith", uri, "markdownToggle.editor");
  const opened = await waitFor(() => {
    const doc = findDoc(uri);
    return !!doc && doc.getText().includes("line-a");
  });
  if (!opened) throw new Error("custom editor never opened the document");
  const doc = findDoc(uri);

  // --- STEP 1: disk change while clean -> reload + webview sync, doc stays clean ---
  fs.writeFileSync(file, "# One\n\nline-a\nline-b-on-disk\n");
  const reloaded1 = await waitFor(() => doc.getText().includes("line-b-on-disk"), 6000);
  expect("STEP1 clean doc + disk change: document model reloaded", reloaded1);

  // Wait out the webview round-trip (docChanged -> CodeMirror -> echo back).
  // Pre-fix the echo's identical applyEdit marked the doc dirty here.
  await sleep(2500);
  expect("STEP1 document stayed clean after webview echo (no false dirty)", !doc.isDirty);

  // --- STEP 2: repeated disk changes keep applying while clean ---
  fs.writeFileSync(file, "# One\n\nline-a\nline-b-on-disk\nline-c-disk\n");
  const reloaded2 = await waitFor(() => doc.getText().includes("line-c-disk"), 6000);
  expect("STEP2 second disk change: document model reloaded again", reloaded2);
  await sleep(1500);
  expect("STEP2 document still clean (auto-reload not blocked)", !doc.isDirty);

  // --- STEP 3: unsaved local edits are never clobbered ---
  const edit = new vscode.WorkspaceEdit();
  edit.replace(doc.uri, new vscode.Range(0, 0, doc.lineCount, 0), "# One\n\nlocal-unsaved\n");
  await vscode.workspace.applyEdit(edit);
  fs.writeFileSync(file, "# One\n\ndisk-wins\n");
  await sleep(2000);
  expect(
    "STEP3 dirty doc + disk change: local edits preserved",
    doc.getText().includes("local-unsaved") && !doc.getText().includes("disk-wins")
  );
  expect("STEP3 document is dirty (user edits pending)", doc.isDirty);

  // Leave the workspace clean of unsaved changes (silences the dirty
  // notification prompt on close).
  fs.writeFileSync(file, doc.getText());
  await vscode.commands.executeCommand("workbench.action.files.revert");
  await vscode.commands.executeCommand("workbench.action.closeAllEditors");

  if (failures > 0) {
    throw new Error(`${failures} disk-change assertion(s) failed`);
  }
}

module.exports = { run };
