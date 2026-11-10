import { test, expect } from "@playwright/test";
import { captureLayout, prepareVisualPage } from "./setup";
import {
  entryPath,
  posterCatalog,
  publicationCatalog,
  softwareCatalog,
  talkCatalog,
} from "../../src/content/catalog";

// Every route pattern, plus each kind of detail/preview and exceptional state.
const routes = [
  "/",
  "/about",
  "/work",
  "/publications",
  "/software",
  "/blogs",
  "/talks",
  "/about/cv",
  "/privacy",
  "/about/fellowships/fwo-phd-fellowship",
  entryPath(softwareCatalog.entries[0]),
  entryPath(softwareCatalog.entries[1]),
  entryPath(publicationCatalog.entries[0]),
  entryPath(talkCatalog.entries.find((talk) => !talk.slides.embedUrl)!),
  entryPath(talkCatalog.entries.find((talk) => talk.slides.embedUrl)!),
  // The poster the baseline has always captured.
  entryPath(posterCatalog.byId("e-i-xchange24-poster-edc")!),
  "/software?tag=topic&value=Solid",
  "/software?tag=topic&value=missing-topic",
  "/software/missing",
  "/publications/missing/paper",
  "/talks/missing",
  "/talks/posters/missing",
];

for (const theme of ["light", "dark"]) {
  for (const mode of ["standard", "lite"]) {
    for (const [device, width] of [
      ["desktop", 1440],
      ["mobile", 390],
    ] as const) {
      for (const [index, path] of routes.entries()) {
        test(`${theme} ${mode} ${device} ${path}`, async ({ page }) => {
          await prepareVisualPage(page, theme, mode, width);
          await page.goto(path);
          await page.locator("h1").first().waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.addStyleTag({
            content:
              "video { visibility: hidden !important; } canvas { visibility: hidden !important; }",
          });
          // Finish local previews; animations and volatile media are excluded from layout comparisons.
          await page.waitForLoadState("networkidle");
          // Full-page capture can trigger viewport resize events; choose the TOC state explicitly.
          const tocToggle = page.locator(".work-toc-toggle");
          if (await tocToggle.count()) {
            const shouldExpand = width > 1080;
            if (
              ((await tocToggle.getAttribute("aria-expanded")) === "true") !==
              shouldExpand
            )
              await tocToggle.click();
          }
          await page.addStyleTag({
            content:
              "*, *::before, *::after { transition: none !important; animation: none !important; }",
          });
          if (await tocToggle.count()) {
            await expect(tocToggle).toHaveAttribute(
              "aria-expanded",
              String(width > 1080),
            );
          }
          const screenshot = await captureLayout(page, width > 1080);
          expect(screenshot).toMatchSnapshot(
            `${theme}-${mode}-${device}-${index}.png`,
            { maxDiffPixelRatio: 0.001 },
          );
        });
      }
    }
  }
}
