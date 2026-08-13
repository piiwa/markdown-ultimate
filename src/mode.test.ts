import { describe, it, expect } from "vitest";
import { normalizeMode } from "./mode";

describe("normalizeMode", () => {
  it("accepts the two valid modes", () => {
    expect(normalizeMode("source")).toBe("source");
    expect(normalizeMode("preview")).toBe("preview");
  });

  it("falls back to source for unknown, empty, or non-string values", () => {
    expect(normalizeMode("edit")).toBe("source");
    expect(normalizeMode("")).toBe("source");
    expect(normalizeMode(undefined)).toBe("source");
    expect(normalizeMode(null)).toBe("source");
    expect(normalizeMode(42)).toBe("source");
  });
});
