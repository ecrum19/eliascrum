import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { mountPage } from "../helpers/mountPage";
import AboutMe from "../../src/components/AboutMe.vue";
import CurrentCv from "../../src/components/CurrentCv.vue";
import MyBlogs from "../../src/components/MyBlogs.vue";
import MyPublications from "../../src/components/MyPublications.vue";
import MySlides from "../../src/components/MySlides.vue";
import PosterDetail from "../../src/components/PosterDetail.vue";
import PrivacyAnalytics from "../../src/components/PrivacyAnalytics.vue";
import TheHeader from "../../src/components/TheHeader.vue";
import TheFooter from "../../src/components/TheFooter.vue";
import AnalyticsConsentBanner from "../../src/components/AnalyticsConsentBanner.vue";
import WorkSectionBlock from "../../src/components/layout/WorkSectionBlock.vue";
import DeferredPreviewNotice from "../../src/components/layout/DeferredPreviewNotice.vue";
import { getPosterViewEntries } from "../../src/data/posterCatalog";
import { getRecentHomepageUpdates } from "../../src/data/homepageUpdates";
import { publications, type Publication } from "../../src/data/publicationsData";
import { getTalkViewEntries } from "../../src/data/talkCatalog";
import {
  getAnalyticsConsent,
  openAnalyticsSettings,
} from "../../src/utils/analytics";

describe("page content and navigation", () => {
  it("links the profile to its CV, fellowship, and recent work", async () => {
    const { wrapper } = await mountPage(AboutMe, "/about");
    expect(wrapper.text()).toContain("Ph.D. Candidate");
    expect(wrapper.find('a[href="/about/cv"]').exists()).toBe(true);
    expect(wrapper.find('a[href*="/about/fellowships/"]').exists()).toBe(true);
    const [latest] = getRecentHomepageUpdates(1);
    expect(wrapper.get("#recentWork").text()).toContain(latest.title);
  });
  it("provides both CV downloads and toggles the focus filter", async () => {
    const { wrapper } = await mountPage(CurrentCv, "/about/cv");
    expect(wrapper.findAll("a[download]")).toHaveLength(2);
    const count = wrapper.findAll(".cv-item").length;
    await wrapper.get(".cv-focus-tag").trigger("click");
    expect(wrapper.get(".cv-focus-tag").attributes("aria-pressed")).toBe(
      "true",
    );
    expect(wrapper.findAll(".cv-item").length).toBeLessThanOrEqual(count);
    await wrapper.get(".cv-focus-clear-btn").trigger("click");
    expect(wrapper.findAll(".cv-item")).toHaveLength(count);
  });
  it("shows the blog empty state", async () => {
    const { wrapper } = await mountPage(MyBlogs, "/blogs");
    expect(wrapper.text()).toContain("No Blog Posts Yet");
  });
  it("filters publications by each dimension to exactly the matching records", async () => {
    const { wrapper, router } = await mountPage(MyPublications, "/publications");
    const cards = () => wrapper.findAll(".publication-card:not(.empty-state)");
    expect(cards()).toHaveLength(publications.length);
    await wrapper.get(".filter-toggle").trigger("click");
    const [venue, topic, type, year] = wrapper.findAll("select");
    const sample = publications.find((entry) => entry.venueTags.length && entry.topicTags.length)!;
    const sampleYear = sample.sortDate.slice(0, 4);
    const dimensions = [
      { select: venue, value: sample.venueTags[0], matches: (entry: Publication) => entry.venueTags.includes(sample.venueTags[0]) },
      { select: topic, value: sample.topicTags[0], matches: (entry: Publication) => entry.topicTags.includes(sample.topicTags[0]) },
      { select: type, value: sample.type, matches: (entry: Publication) => entry.type === sample.type },
      { select: year, value: sampleYear, matches: (entry: Publication) => entry.sortDate.startsWith(`${sampleYear}-`) },
    ];
    for (const { select, value, matches } of dimensions) {
      await select.setValue(value);
      const expected = publications.filter(matches);
      expect(cards().map((card) => card.get(".publication-title").text())).toEqual(
        expect.arrayContaining(expected.map((entry) => entry.title)),
      );
      expect(cards()).toHaveLength(expected.length);
      expect(wrapper.get(".filter-result").text()).toBe(
        `Showing ${expected.length} of ${publications.length} publications.`,
      );
      await wrapper.get(".filter-clear-btn").trigger("click");
      expect(cards()).toHaveLength(publications.length);
    }
    await router.push("/publications?tag=topic&value=zzzzunmatchedzzzz");
    await flushPromises();
    expect(cards()).toHaveLength(0);
  });
  it("filters talks and posters together by venue, topic, and year", async () => {
    const { wrapper } = await mountPage(MySlides, "/talks");
    const items = [...getTalkViewEntries(), ...getPosterViewEntries()];
    const titles = () =>
      wrapper.findAll(".talk-card:not(.empty-state) .talk-card-title").map((title) => title.text());
    await wrapper.get(".filter-toggle").trigger("click");
    const selects = wrapper.findAll("select");
    const sample = items.find((entry) => entry.venueTags.length && entry.topicTags.length)!;
    const sampleYear = sample.displayDateIso.slice(0, 4);
    const dimensions = [
      { select: selects[0], value: sample.venueTags[0], matches: (entry: (typeof items)[number]) => entry.venueTags.includes(sample.venueTags[0]) },
      { select: selects[1], value: sample.topicTags[0], matches: (entry: (typeof items)[number]) => entry.topicTags.includes(sample.topicTags[0]) },
      { select: selects[6], value: sampleYear, matches: (entry: (typeof items)[number]) => entry.displayDateIso.startsWith(`${sampleYear}-`) },
    ];
    for (const { select, value, matches } of dimensions) {
      await select.setValue(value);
      const expected = items.filter(matches);
      expect(wrapper.get(".filter-result").text()).toBe(
        `Showing ${expected.length} of ${items.length} items.`,
      );
      expect(titles()).toEqual(expect.arrayContaining(expected.map((entry) => entry.displayTitle)));
      await wrapper.get(".filter-clear-btn").trigger("click");
    }
    expect(wrapper.get(".filter-result").text()).toBe(`Showing ${items.length} of ${items.length} items.`);
  });
  it("keeps poster media unloaded until explicitly requested in Lite mode", async () => {
    const poster = getPosterViewEntries()[0];
    const { wrapper, router } = await mountPage(
      PosterDetail,
      `/talks/posters/${poster.slug}`,
    );
    expect(wrapper.get("h1").text()).toBe(poster.displayTitle);
    expect(wrapper.find("object").exists()).toBe(false);
    await wrapper.get(".deferred-preview button").trigger("click");
    expect(wrapper.get("object").attributes("data")).toContain(".pdf");
    await router.push("/talks/posters/missing");
    await flushPromises();
    expect(wrapper.text()).toContain("Poster not found");
  });
  it("renders shell links and forwards header controls", async () => {
    const { wrapper, router } = await mountPage(TheHeader, "/about");
    await wrapper.get("#dropdown").trigger("click");
    expect(wrapper.get("#navDemo").classes()).toContain("w3-show");
    await router.push("/software");
    await flushPromises();
    expect(wrapper.get("#navDemo").classes()).not.toContain("w3-show");
    for (const selector of [
      ".theme-toggle",
      ".text-size-toggle",
      ".performance-toggle",
      ".search-trigger",
    ]) {
      await wrapper.get(selector).trigger("click");
    }
    expect(Object.keys(wrapper.emitted())).toEqual(
      expect.arrayContaining([
        "toggle-theme",
        "toggle-text-scale",
        "toggle-performance-mode",
        "open-search",
      ]),
    );
    const footer = (await mountPage(TheFooter)).wrapper;
    expect(footer.get('a[href="/privacy"]').text()).toContain("Privacy");
    expect(footer.text()).toContain(String(new Date().getFullYear()));
  });
});

describe("consent and reusable layout", () => {
  it("rejects, reopens, and closes the consent banner without granting consent", async () => {
    const { wrapper } = await mountPage(AnalyticsConsentBanner);
    await wrapper.get(".analytics-consent__button--quiet").trigger("click");
    await flushPromises();
    expect(getAnalyticsConsent()).toBe("denied");
    expect(wrapper.find("aside").exists()).toBe(false);
    openAnalyticsSettings();
    await flushPromises();
    expect(wrapper.find("aside").exists()).toBe(true);
    await wrapper.get('[aria-label="Close analytics notice"]').trigger("click");
    expect(getAnalyticsConsent()).toBe("denied");
  });
  it("shows stock context and changes analytics choice", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "");
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          ticker: "GOOG",
          currency: "USD",
          firstCommitDate: "2025-01-01",
          initialPrice: 100,
          currentClose: 110,
          currentDate: "2026-01-01",
          changeAmount: 10,
          changePercent: 10,
        }),
      ),
    );
    const { wrapper } = await mountPage(PrivacyAnalytics, "/privacy");
    await flushPromises();
    expect(wrapper.text()).toContain("No choice recorded");
    expect(wrapper.get(".privacy-stock").text()).toContain("$10.00");
    await wrapper.get(".privacy-page__button--allow").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Analytics allowed");
    await wrapper.get(".privacy-page__button--reject").trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Analytics rejected");
  });
  it("uses semantic containers and explicit preview loading events", async () => {
    const surface = mount(WorkSectionBlock, {
      props: { tag: "section", anchor: false, tintedInLightMode: false },
      slots: { default: "Contents" },
    });
    expect(surface.element.tagName).toBe("SECTION");
    expect(surface.classes()).not.toContain("work-section-block-anchor");
    expect(surface.text()).toBe("Contents");
    const notice = mount(DeferredPreviewNotice, {
      props: { message: "Deferred", actionLabel: "Load" },
    });
    await notice.get("button").trigger("click");
    expect(notice.emitted("load")).toHaveLength(1);
  });
});
