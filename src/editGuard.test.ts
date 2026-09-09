import { describe, expect, it } from "vitest";
import { shouldApplyWebviewEdit } from "./editGuard";

describe("shouldApplyWebviewEdit", () => {
  it("applies real user edits (text differs from document)", () => {
    expect(shouldApplyWebviewEdit("# Edited\n", "# Original\n")).toBe(true);
  });

  it("rejects echoes of text the document already contains", () => {
    // This is the disk-reload echo: the webview applied text the extension
    // just sent it, and CodeMirror's updateListener posted it right back.
    // Applying it would mark the document dirty and block future reloads.
    expect(shouldApplyWebviewEdit("# Same\n", "# Same\n")).toBe(false);
  });

  it("rejects empty-document echoes", () => {
    expect(shouldApplyWebviewEdit("", "")).toBe(false);
  });

  it("is sensitive to whitespace differences", () => {
    expect(shouldApplyWebviewEdit("trailing space ", "trailing space")).toBe(true);
  });
});
