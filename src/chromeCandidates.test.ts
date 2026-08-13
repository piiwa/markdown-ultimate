import { describe, it, expect } from "vitest";
import { chromeCandidates } from "./chromeCandidates";

describe("chromeCandidates", () => {
  it("includes Chrome, Chromium, Brave and Edge on macOS", () => {
    const paths = chromeCandidates("darwin", {});
    expect(paths).toContain("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
    expect(paths.some((p) => p.includes("Microsoft Edge"))).toBe(true);
    expect(paths.some((p) => p.includes("Brave"))).toBe(true);
  });

  it("includes per-user Chrome (LOCALAPPDATA), Edge and Brave on Windows", () => {
    const paths = chromeCandidates("win32", { LOCALAPPDATA: "C:\\Users\\me\\AppData\\Local" });
    expect(paths).toContain("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe");
    expect(paths).toContain(
      "C:\\Users\\me\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe"
    );
    expect(paths.some((p) => p.includes("msedge.exe"))).toBe(true);
    expect(paths.some((p) => p.toLowerCase().includes("brave.exe"))).toBe(true);
  });

  it("omits the per-user Windows path when LOCALAPPDATA is unset", () => {
    const paths = chromeCandidates("win32", {});
    expect(paths.some((p) => p.includes("AppData"))).toBe(false);
    // still returns the system-wide candidates
    expect(paths.length).toBeGreaterThan(0);
  });

  it("includes chromium, snap, Brave and Edge on Linux", () => {
    const paths = chromeCandidates("linux", {});
    expect(paths).toContain("/usr/bin/google-chrome");
    expect(paths).toContain("/snap/bin/chromium");
    expect(paths.some((p) => p.includes("brave"))).toBe(true);
    expect(paths.some((p) => p.includes("edge"))).toBe(true);
  });
});
