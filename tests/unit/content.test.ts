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
import {
  getPosterViewEntries,
  getPosterViewBySlug,
} from "../../src/data/posterCatalog";
import {
  getTalkViewEntries,
  getTalkViewBySlug,
} from "../../src/data/talkCatalog";
import { talks, posters } from "../../src/data/talksData";
import {
  publications,
  getPublicationById,
  getPublicationBySlug,
  getPublicationSlug,
  getPublicationPagePath,
  getRelatedPublicationLinksForTalkSlug,
  getRelatedPublicationLinksForPresentationFile,
} from "../../src/data/publicationsData";

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
  it("resolves every publication, preserving its public route", () => {
    for (const record of publications) {
      expect(getPublicationById(record.id)).toBe(record);
      expect(getPublicationBySlug(getPublicationSlug(record))).toBe(record);
      expect(getPublicationPagePath(record)).toBe(
        `/publications/${getPublicationSlug(record)}/paper`,
      );
    }
    expect(getPublicationById("missing")).toBeUndefined();
    expect(getPublicationBySlug("missing")).toBeUndefined();
    expect(getPublicationSlug({ id: "", title: "Example: A Paper" })).toBe(
      "example-a-paper",
    );
  });
  it("hydrates all talks/posters and resolves their stable slugs", () => {
    expect(getTalkViewEntries()).toHaveLength(talks.length);
    expect(getPosterViewEntries()).toHaveLength(posters.length);
    for (const talk of talks)
      expect(getTalkViewBySlug(talk.slug)?.displayTitle).toBeTruthy();
    for (const poster of posters)
      expect(getPosterViewBySlug(poster.slug)?.displayTitle).toBeTruthy();
    expect(getTalkViewBySlug("missing")).toBeUndefined();
    expect(getPosterViewBySlug("missing")).toBeUndefined();
    const html = getTalkViewBySlug("metabolinkai");
    expect(html?.slideFormat).toBe("html");
    expect(html?.slideEmbedUrl).toContain("MetaboLinkAI-Slides");
  });
  it("links presentations to publications by slug and material path", () => {
    expect(
      getRelatedPublicationLinksForTalkSlug("sosy2026").map(
        (entry) => entry.publicationId,
      ),
    ).toContain("solid-cockpit-eswc-2026-demo");
    expect(
      getRelatedPublicationLinksForPresentationFile(
        "/talks/posters/eswc_2026_print.pdf",
      ),
    ).not.toHaveLength(0);
    expect(getRelatedPublicationLinksForTalkSlug("missing")).toEqual([]);
    expect(
      getRelatedPublicationLinksForPresentationFile("/missing.pdf"),
    ).toEqual([]);
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
