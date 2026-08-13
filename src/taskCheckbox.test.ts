import { describe, it, expect } from "vitest";
import { toggleTaskCheckbox } from "./taskCheckbox";

describe("toggleTaskCheckbox", () => {
  it("checks an unchecked box by index", () => {
    expect(toggleTaskCheckbox("- [ ] a", 0)).toBe("- [x] a");
  });

  it("unchecks a checked box by index", () => {
    expect(toggleTaskCheckbox("- [x] a", 0)).toBe("- [ ] a");
  });

  it("toggles only the targeted box among several", () => {
    const src = "- [ ] a\n- [ ] b\n- [ ] c";
    expect(toggleTaskCheckbox(src, 1)).toBe("- [ ] a\n- [x] b\n- [ ] c");
  });

  it("handles uppercase X and preserves the rest of the line", () => {
    expect(toggleTaskCheckbox("  - [X] done thing", 0)).toBe("  - [ ] done thing");
  });

  it("supports *, + and ordered list markers", () => {
    expect(toggleTaskCheckbox("* [ ] a", 0)).toBe("* [x] a");
    expect(toggleTaskCheckbox("+ [ ] a", 0)).toBe("+ [x] a");
    expect(toggleTaskCheckbox("1. [ ] a", 0)).toBe("1. [x] a");
  });

  it("does NOT count checkboxes inside fenced code blocks", () => {
    const src = ["- [ ] real", "```", "- [ ] fake in code", "```", "- [ ] second real"].join("\n");
    // index 1 must be the SECOND real checkbox, not the one in the code fence
    const out = toggleTaskCheckbox(src, 1);
    expect(out).toBe(
      ["- [ ] real", "```", "- [ ] fake in code", "```", "- [x] second real"].join("\n")
    );
  });

  it("returns the input unchanged when the index is out of range", () => {
    expect(toggleTaskCheckbox("- [ ] a", 5)).toBe("- [ ] a");
    expect(toggleTaskCheckbox("no tasks here", 0)).toBe("no tasks here");
  });
});
