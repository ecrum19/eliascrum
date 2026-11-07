import { expect, it } from "vitest";
import {
  filterSoftware,
  defaultSoftwareFilters,
} from "../../src/content/softwareFilters";
import { softwareCatalog } from "../../src/content/catalog";
import { dateSortValue } from "../../src/content/dates";

it("orders by date or title in both directions without changing authored order", () => {
  const originalOrder = softwareCatalog.entries.map((entry) => entry.id);
  for (const sort of [
    "date-desc",
    "date-asc",
    "title-asc",
    "title-desc",
  ] as const) {
    const sorted = filterSoftware(
      softwareCatalog.entries,
      softwareCatalog.sections,
      { ...defaultSoftwareFilters(), sort },
    );
    for (let index = 1; index < sorted.length; index++) {
      const left = sorted[index - 1];
      const right = sorted[index];
      if (sort === "date-desc")
        expect(dateSortValue(left.date)).toBeGreaterThanOrEqual(
          dateSortValue(right.date),
        );
      if (sort === "date-asc")
        expect(dateSortValue(left.date)).toBeLessThanOrEqual(
          dateSortValue(right.date),
        );
      if (sort === "title-asc")
        expect(left.title.localeCompare(right.title)).toBeLessThanOrEqual(0);
      if (sort === "title-desc")
        expect(left.title.localeCompare(right.title)).toBeGreaterThanOrEqual(0);
    }
  }
  expect(softwareCatalog.entries.map((entry) => entry.id)).toEqual(
    originalOrder,
  );
});
