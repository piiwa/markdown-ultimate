import { describe, it, expect } from "vitest";
import { escapeInlineScript } from "./webviewBootstrap";

describe("escapeInlineScript", () => {
  it("round-trips ordinary text back to the original", () => {
    const text = '# Hello\n\nSome *markdown* with "quotes" and \\backslash.';
    // The result is a JS string literal; evaluating it must yield the original.
    const value = eval("(" + escapeInlineScript(text) + ")");
    expect(value).toBe(text);
  });

  it("does not leave a literal </script> that would close the inline script (the data-loss bug)", () => {
    const text = "Here is how to write a script tag: </script> and more text.";
    const escaped = escapeInlineScript(text);
    expect(escaped).not.toContain("</script>");
    // No raw '<' should survive, so neither </script> nor <!-- can break out.
    expect(escaped).not.toContain("<");
  });

  it("still decodes the escaped content back to the original including </script>", () => {
    const text = "a </script><script>alert(1)</script> b";
    const value = eval("(" + escapeInlineScript(text) + ")");
    expect(value).toBe(text);
  });

  it("escapes the HTML comment opener too", () => {
    const text = "<!-- comment --> content";
    const escaped = escapeInlineScript(text);
    expect(escaped).not.toContain("<");
  });
});
