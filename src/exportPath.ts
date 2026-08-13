import * as path from "path";

/**
 * Computes the output path for an export by replacing the source file's real
 * extension with `targetExt`.
 *
 * Using `path.extname` (instead of a `.md`-only regex) is what prevents the
 * data-loss bug where exporting a `.markdown` file wrote the output back onto
 * the source. The result is guaranteed never to equal the source path.
 */
export function getExportPath(sourceFsPath: string, targetExt: string): string {
  const ext = path.extname(sourceFsPath);
  const base = ext ? sourceFsPath.slice(0, -ext.length) : sourceFsPath;
  let out = `${base}.${targetExt}`;
  if (out === sourceFsPath) {
    // Source already had the target extension — never overwrite it.
    out = `${base}.export.${targetExt}`;
  }
  return out;
}
