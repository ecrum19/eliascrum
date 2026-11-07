import type { Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

/**
 * Full-page capture resizes the viewport and can collapse the desktop TOC mid-capture
 * (never on real page loads). Resize events are suppressed, and since a capture can only
 * collapse the TOC, a collapsed TOC afterwards means the image is retaken with it reopened.
 */
export async function captureLayout(page: Page, tocExpanded?: boolean): Promise<Buffer> {
  await page.evaluate(() => {
    window.addEventListener(
      "resize",
      (event) => event.stopImmediatePropagation(),
      true,
    );
  });
  const toggle = page.locator(".work-toc-toggle");
  for (let attempt = 1; ; attempt++) {
    const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
    if (tocExpanded === undefined || !(await toggle.count())) return screenshot;
    if ((await toggle.getAttribute("aria-expanded")) === String(tocExpanded)) return screenshot;
    if (attempt === 3) throw new Error("The TOC kept changing state during capture.");
    await toggle.click();
  }
}

/** Cache fonts, freeze preferences, and isolate third-party content for local comparisons. */
export async function prepareVisualPage(
  page: Page,
  theme: string,
  mode: string,
  width: number,
) {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(
    ({ theme, mode }) => {
      localStorage.setItem("site-theme", theme);
      localStorage.setItem("site-performance-mode", mode);
    },
    { theme, mode },
  );
  await mkdir(".cache/visual-fonts", { recursive: true });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") return route.continue();
    if (["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname)) {
      const file = `.cache/visual-fonts/${createHash("sha256").update(url.href).digest("hex")}`;
      let body: Buffer;
      try {
        body = await readFile(file);
      } catch {
        const response = await route.fetch();
        if (!response.ok()) throw new Error(`Font download failed: ${url}`);
        body = await response.body();
        await writeFile(file, body);
      }
      return route.fulfill({
        body,
        contentType:
          url.hostname === "fonts.googleapis.com" ? "text/css" : "font/woff2",
      });
    }
    // Icons, analytics, and third-party slide embeds are deterministic fixtures.
    return route.fulfill({
      body: "",
      contentType:
        route.request().resourceType() === "stylesheet"
          ? "text/css"
          : "text/html",
    });
  });
}
