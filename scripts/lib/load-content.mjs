import { build } from "esbuild";
import { fileURLToPath } from "node:url";

/** Load typed content through esbuild, without regex parsing or temporary files. */
export async function loadContentModule(filename) {
  const result = await build({
    entryPoints: [filename],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
    define: { "import.meta.env.BASE_URL": '"/"' },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
}

/** Every site content module, keyed as the exporters expect (see src/content/siteContent.ts). */
export const loadSiteContent = () =>
  loadContentModule(
    fileURLToPath(new URL("../../src/content/siteContent.ts", import.meta.url)),
  );
