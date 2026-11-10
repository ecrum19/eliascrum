import { describe, expect, it } from "vitest";
import { publicationCatalog } from "../../src/content/catalog";
import {
  detailRelated,
  relatedItems,
  resolveEntryRef,
  findEntry,
  resolveHighlight,
} from "../../src/content/relations";

type Ref = Parameters<typeof relatedItems>[0];
/** What an item page lists: the entry's authored relations plus reverse ones. */
const keys = (ref: Ref) => relatedItems(ref, findEntry(ref)?.related).map((item) => item.key);

describe("entry relationships", () => {
  it("derives reverse links from software, papers' presentations, and a talk's poster", () => {
    expect(keys("publication:solid-cockpit-eswc-2026-demo")).toEqual(
      expect.arrayContaining(["software:solid-cockpit", "talk:sosy2026", "poster:eswc-2026-print"]),
    );
    expect(keys("talk:sosy2026")).toEqual(
      expect.arrayContaining([
        "software:solid-cockpit",
        "publication:solid-cockpit-eswc-2026-demo",
        "poster:eswc-2026-print",
      ]),
    );
    expect(keys("poster:eswc-2026-print")).toEqual(
      expect.arrayContaining(["talk:sosy2026", "publication:solid-cockpit-eswc-2026-demo"]),
    );
  });
  it("links the PENGQUIN symposium talk and poster to their paper", () => {
    expect(keys("talk:eswc-phdsymp-pangquin")).toContain("publication:pengquin-eswc-2024");
    expect(keys("publication:pengquin-eswc-2024")).toEqual(
      expect.arrayContaining(["talk:eswc-phdsymp-pangquin", "poster:eswc-24-poster-edc"]),
    );
  });
  it("lists authored relations first, once, without the entry itself or unknown targets", () => {
    const items = relatedItems("software:solid-cockpit", [
      "publication:solid-cockpit-eswc-2026-demo",
      "software:solid-cockpit",
      "talk:missing",
    ]);
    expect(items[0]).toEqual({
      key: "publication:solid-cockpit-eswc-2026-demo",
      label: `Publication: ${publicationCatalog.byId("solid-cockpit-eswc-2026-demo")!.title}`,
      to: "/publications/solid-cockpit-eswc-2026-demo/paper",
    });
    expect(items.map((item) => item.key)).not.toContain("software:solid-cockpit");
    expect(resolveEntryRef("talk:missing")).toBeUndefined();
  });
  it("resolves a highlight's resource and site entry", () => {
    const highlight = publicationCatalog.byId("real-world-federation-iswc-2026")!.highlight;
    expect(resolveHighlight(highlight)).toMatchObject({
      label: "Federated Query Results Explorer",
      href: "https://ecrum19.github.io/fed-survey-results/",
      related: { to: "/software/fed-survey-results-explorer" },
    });
    expect(resolveHighlight(undefined)).toBeUndefined();
  });
  it("leaves a highlighted entry out of the page's Related list, but only there", () => {
    const paper = publicationCatalog.byId("real-world-federation-iswc-2026")!;
    const self = "publication:real-world-federation-iswc-2026" as const;
    const explorer = "software:fed-survey-results-explorer";
    expect(keys(self)).toContain(explorer);
    const related = detailRelated(self, paper.related, paper.highlight).map((item) => item.key);
    expect(related).not.toContain(explorer);
    expect(related).toContain("talk:iswc-2026-federation");
    expect(detailRelated(self, paper.related).map((item) => item.key)).toContain(explorer);
  });
});
