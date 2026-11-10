import { describe, expect, it } from "vitest";
import {
  getBlogPostsSortedNewestFirst,
  type BlogPost,
} from "../../src/data/blogPostsData";
import {
  fwoPhdFellowship,
  getFellowshipDetailPath,
} from "../../src/data/fellowshipData";
import {
  getAllHomepageUpdates,
  getRecentHomepageUpdates,
} from "../../src/data/homepageUpdates";
import { posterCatalog, talkCatalog } from "../../src/content/catalog";

describe("content lookup and authoring contracts", () => {
  it("sorts blog records without modifying authored order", () => {
    const records = [
      { id: "older", dateIso: "2024-01-01" },
      { id: "newer", dateIso: "2026-01-01" },
    ] as BlogPost[];
    expect(
      getBlogPostsSortedNewestFirst(records).map((record) => record.id),
    ).toEqual(["newer", "older"]);
    expect(records[0].id).toBe("older");
    expect(getBlogPostsSortedNewestFirst()).toEqual([]);
  });
  it("resolves every talk and poster by its stable slug", () => {
    for (const catalog of [talkCatalog, posterCatalog]) {
      for (const entry of catalog.entries) {
        expect(entry.id).toBe(entry.slug);
        expect(catalog.bySlug(entry.slug)).toBe(entry);
      }
      expect(catalog.bySlug("missing")).toBeUndefined();
    }
    expect(talkCatalog.byId("metabolinkai")?.slides).toMatchObject({
      format: "html",
      embedUrl: expect.stringContaining("MetaboLinkAI-Slides"),
    });
  });
  it("builds recent updates in descending order and honors limits", () => {
    const updates = getAllHomepageUpdates();
    expect(updates.length).toBeGreaterThan(0);
    expect(new Set(updates.map((entry) => entry.id)).size).toBe(updates.length);
    expect(updates.map((entry) => entry.dateIso)).toEqual(
      updates
        .map((entry) => entry.dateIso)
        .sort()
        .reverse(),
    );
    expect(getRecentHomepageUpdates(3)).toEqual(updates.slice(0, 3));
    expect(getRecentHomepageUpdates()).toHaveLength(1);
    // A paper leads its presentation on the same day.
    const order = ["Publication", "Talk", "Blog"];
    updates.slice(1).forEach((entry, index) => {
      const previous = updates[index];
      if (previous.dateIso === entry.dateIso)
        expect(order.indexOf(previous.type)).toBeLessThanOrEqual(order.indexOf(entry.type));
    });
    const position = (id: string) => updates.findIndex((entry) => entry.id === id);
    expect(position("publication:real-world-federation-iswc-2026")).toBeLessThan(
      position("talk:iswc-2026-federation"),
    );
    expect(getFellowshipDetailPath()).toBe(
      `/about/fellowships/${fwoPhdFellowship.slug}`,
    );
  });
});
