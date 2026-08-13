import { describe, it, expect } from "vitest";
import { getExportPath } from "./exportPath";

describe("getExportPath", () => {
  it("replaces a .md extension with the target extension", () => {
    expect(getExportPath("/docs/notes.md", "html")).toBe("/docs/notes.html");
    expect(getExportPath("/docs/notes.md", "pdf")).toBe("/docs/notes.pdf");
  });

  it("does NOT overwrite a .markdown source file (the data-loss bug)", () => {
    const src = "/docs/notes.markdown";
    const out = getExportPath(src, "html");
    expect(out).toBe("/docs/notes.html");
    expect(out).not.toBe(src);
  });

  it("is case-insensitive on the source extension", () => {
    expect(getExportPath("/docs/README.MD", "html")).toBe("/docs/README.html");
    expect(getExportPath("/docs/README.Markdown", "pdf")).toBe("/docs/README.pdf");
  });

  it("handles a filename that contains dots", () => {
    expect(getExportPath("/docs/v1.2.notes.md", "png")).toBe("/docs/v1.2.notes.png");
  });

  it("never returns the source path even if the target extension matches the source", () => {
    const src = "/docs/page.html";
    const out = getExportPath(src, "html");
    expect(out).not.toBe(src);
  });

  it("appends the extension when the source has none", () => {
    expect(getExportPath("/docs/LICENSE", "html")).toBe("/docs/LICENSE.html");
  });
});
