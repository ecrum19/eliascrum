import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const realPath = (filename) => {
  try {
    return realpathSync(filename);
  } catch {
    return filename;
  }
};

/** Importing a maintenance command for a test must never execute that command. */
export function isMain(moduleUrl, argv = process.argv) {
  // Node resolves the entry module's symlinks in import.meta.url, but not in argv.
  return Boolean(argv[1]) && realPath(argv[1]) === realPath(fileURLToPath(moduleUrl));
}
