import { expect, test } from "@playwright/test";
import { prepareVisualPage } from "./setup";
import {
  publications,
  getPublicationPagePath,
} from "../../src/data/publicationsData";

const paperPath = getPublicationPagePath(
  publications.find((entry) => entry.paperPdfPath)!,
);

for (const theme of ["light", "dark"]) {
  for (const mode of ["standard", "lite"]) {
    for (const width of [1440, 390]) {
      test(`PDF loading and missing resource: ${theme} ${mode} ${width}`, async ({
        page,
      }) => {
        await prepareVisualPage(page, theme, mode, width);
        let release!: () => void;
        const heldRequest = new Promise<void>((resolve) => {
          release = resolve;
        });
        await page.route(/\.pdf(?:\?.*)?$/, async (route) => {
          await heldRequest;
          await route.fulfill({ status: 404, body: "Missing test PDF" });
        });
        try {
          await page.goto(paperPath, { waitUntil: "domcontentloaded" });
          if (mode === "lite")
            await page
              .getByRole("button", { name: "Load Paper Preview" })
              .click();
          await page.locator("#detail-pdf").scrollIntoViewIfNeeded();
          await expect(page.getByText("Loading paper...")).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          await page.addStyleTag({
            content: "video { visibility:hidden !important; }",
          });
          await expect(page).toHaveScreenshot(
            `pdf-loading-${theme}-${mode}-${width}.png`,
            {
              animations: "disabled",
              maxDiffPixelRatio: 0.001,
              timeout: 20_000,
            },
          );
          release();
          await expect(page.getByText("Preview unavailable.")).toBeVisible();
          await expect(page).toHaveScreenshot(
            `pdf-missing-${theme}-${mode}-${width}.png`,
            {
              animations: "disabled",
              maxDiffPixelRatio: 0.001,
              timeout: 20_000,
            },
          );
        } finally {
          release();
        }
      });
    }
  }
}

test("renders a real PDF page and changes pages using the installed PDF.js worker", async ({
  page,
}) => {
  await prepareVisualPage(page, "light", "standard", 1440);
  await page.goto(paperPath);
  await page.locator("#detail-pdf").scrollIntoViewIfNeeded();
  await expect(page.locator(".pdf-overlay")).toHaveCount(0, {
    timeout: 20_000,
  });
  await expect
    .poll(() =>
      page
        .locator("canvas")
        .evaluate((canvas) => (canvas as HTMLCanvasElement).width),
    )
    .toBeGreaterThan(100);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Current page" }),
  ).toHaveValue("2");
  await expect(page.locator(".pdf-overlay")).toHaveCount(0);
});
