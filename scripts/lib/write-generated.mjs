import fs from "node:fs/promises";

const PLACEHOLDER = new Date(0).toISOString();

/**
 * Rewrite a generated file only when more than its generation timestamp changed, so
 * regenerating unchanged content leaves committed files untouched. `render(iso)`
 * must put the timestamp on lines of its own.
 */
export async function writeGeneratedFile(filePath, render) {
  const previous = (await fs.readFile(filePath, "utf8").catch(() => null))?.split("\n");
  const candidate = render(PLACEHOLDER).split("\n");
  const unchanged =
    previous?.length === candidate.length &&
    candidate.every((line, index) => line === previous[index] || line.includes(PLACEHOLDER));
  if (unchanged) return false;
  await fs.writeFile(filePath, render(new Date().toISOString()), "utf8");
  return true;
}
