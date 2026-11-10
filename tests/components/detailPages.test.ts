import { describe, expect, it } from "vitest";
import { mountPage } from "../helpers/mountPage";
import SoftwareDetail from "../../src/components/SoftwareDetail.vue";
import PublicationPaperPage from "../../src/components/PublicationPaperPage.vue";
import SlideDetail from "../../src/components/SlideDetail.vue";
import PosterDetail from "../../src/components/PosterDetail.vue";

// Every item page shares one architecture: header, optional highlight, then section panels.
const pages = [
  { kind: "software", component: SoftwareDetail, path: "/software/solid-cockpit", back: "/software" },
  {
    kind: "publication",
    component: PublicationPaperPage,
    path: "/publications/solid-cockpit-eswc-2026-demo/paper",
    back: "/publications",
  },
  { kind: "talk", component: SlideDetail, path: "/talks/sosy2026", back: "/talks" },
  { kind: "poster", component: PosterDetail, path: "/talks/posters/eswc-2026-print", back: "/talks" },
];

const sectionIds = (root: Element) =>
  [...root.querySelectorAll(".entry-card[id]")].map((element) => element.id);

describe("item pages", () => {
  for (const page of pages) {
    it(`${page.kind} page uses the shared detail structure`, async () => {
      const { wrapper } = await mountPage(page.component, page.path);
      const header = wrapper.get("#detail-overview");
      expect(header.element.tagName).toBe("HEADER");
      expect(header.find("h1").exists()).toBe(true);
      expect(header.find(".detail-date").text()).toMatch(/^\d{4}|Ongoing|Undated/);
      expect(header.get(`a[href="${page.back}"]`).text()).toMatch(/^Back to /);
      expect(header.findAll(".detail-tags a").length).toBeGreaterThan(0);
      const ids = sectionIds(wrapper.element);
      expect(ids.slice(0, 2)).toEqual(["detail-overview", "detail-summary"]);
      expect(ids).toEqual(expect.arrayContaining(["detail-metadata", "detail-related"]));
      expect(ids.indexOf("detail-metadata")).toBeLessThan(ids.indexOf("detail-related"));
      for (const section of wrapper.findAll(".detail-section")) {
        expect(section.find("h2").exists()).toBe(true);
      }
      expect(wrapper.findAll("#detail-related a").length).toBeGreaterThan(0);
    });
  }
  it("features a highlight directly under the header", async () => {
    const { wrapper } = await mountPage(
      PublicationPaperPage,
      "/publications/real-world-federation-iswc-2026/paper",
    );
    expect(sectionIds(wrapper.element).slice(0, 3)).toEqual([
      "detail-overview",
      "detail-highlight",
      "detail-summary",
    ]);
    const highlight = wrapper.get("#detail-highlight");
    expect(highlight.text()).toContain("Federated Query Results Explorer");
    expect(highlight.get('a[href="https://ecrum19.github.io/fed-survey-results/"]').attributes("target")).toBe(
      "_blank",
    );
    expect(highlight.find('a[href="/software/fed-survey-results-explorer"]').exists()).toBe(true);
  });
});
