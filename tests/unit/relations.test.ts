import { describe, expect, it } from "vitest";
import {
  relatedItems,
  resolveEntryRef,
  resolveHighlight,
} from "../../src/content/relations";
import { getPublicationById } from "../../src/data/publicationsData";

const keys = (ref: Parameters<typeof relatedItems>[0]) => relatedItems(ref).map((item) => item.key);

describe("entry relationships", () => {
  it("derives reverse links from software, presentation links, and talk–poster pairs", () => {
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
      label: `Publication: ${getPublicationById("solid-cockpit-eswc-2026-demo")!.title}`,
      to: "/publications/solid-cockpit-eswc-2026-demo/paper",
    });
    expect(items.map((item) => item.key)).not.toContain("software:solid-cockpit");
    expect(resolveEntryRef("talk:missing")).toBeUndefined();
  });
  it("resolves a highlight's resource and site entry", () => {
    const highlight = getPublicationById("real-world-federation-iswc-2026")!.highlight;
    expect(resolveHighlight(highlight)).toMatchObject({
      label: "Federated Query Results Explorer",
      href: "https://ecrum19.github.io/fed-survey-results/",
      related: { to: "/software/fed-survey-results-explorer" },
    });
    expect(resolveHighlight(undefined)).toBeUndefined();
  });
});
