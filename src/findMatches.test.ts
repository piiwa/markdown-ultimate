import { describe, it, expect } from "vitest";
import { findMatchRanges } from "./findMatches";

describe("findMatchRanges", () => {
  it("finds a single match and returns its offsets", () => {
    expect(findMatchRanges("hello world", "world")).toEqual([{ start: 6, end: 11 }]);
  });

  it("finds all non-overlapping matches", () => {
    expect(findMatchRanges("a-a-a", "a")).toEqual([
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
    ]);
  });

  it("does not report overlapping matches", () => {
    // "aa" in "aaa" matches once (offset 0), next search resumes at offset 2.
    expect(findMatchRanges("aaa", "aa")).toEqual([{ start: 0, end: 2 }]);
  });

  it("is case-insensitive by default", () => {
    expect(findMatchRanges("Hello HELLO hello", "hello")).toEqual([
      { start: 0, end: 5 },
      { start: 6, end: 11 },
      { start: 12, end: 17 },
    ]);
  });

  it("respects case-sensitive mode when requested", () => {
    expect(findMatchRanges("Hello hello", "hello", true)).toEqual([{ start: 6, end: 11 }]);
  });

  it("returns nothing for an empty query", () => {
    expect(findMatchRanges("anything", "")).toEqual([]);
  });

  it("returns nothing when there is no match", () => {
    expect(findMatchRanges("abc", "xyz")).toEqual([]);
  });

  it("treats the query literally, not as a regex", () => {
    expect(findMatchRanges("a.b a.b", "a.b")).toEqual([
      { start: 0, end: 3 },
      { start: 4, end: 7 },
    ]);
    expect(findMatchRanges("axb", "a.b")).toEqual([]);
  });
});
