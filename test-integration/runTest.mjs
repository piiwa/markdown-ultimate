/**
 * Integration test runner: launches a real VS Code instance with this
 * extension loaded and runs src/test-integration/suite/index.js inside it.
 *
 * Verifies how disk-based file changes propagate to a custom text editor.
 */
import { runTests } from "@vscode/test-electron";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";

const extRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = path.join(extRoot, ".test-workspace");

async function main() {
  fs.rmSync(workspace, { recursive: true, force: true });
  fs.mkdirSync(workspace, { recursive: true });
  try {
    await runTests({
      extensionDevelopmentPath: extRoot,
      extensionTestsPath: path.resolve(extRoot, "test-integration/suite/index.js"),
      launchArgs: [
        workspace,
        // Keep the environment deterministic
        "--disable-telemetry",
        "--skip-welcome",
        "--skip-release-notes",
        "--disable-gpu",
      ],
    });
  } catch (err) {
    console.error("INTEGRATION TEST RUN FAILED:", err);
    process.exitCode = 1;
  }
}

main().then(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});
