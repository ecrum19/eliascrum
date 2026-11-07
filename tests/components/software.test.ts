import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountPage } from "../helpers/mountPage";
import MySoftware from "../../src/components/MySoftware.vue";
import SoftwareDetail from "../../src/components/SoftwareDetail.vue";
import { softwareCatalog } from "../../src/content/catalog";

describe("Software catalog UI", () => {
  it("shows every record with a stable detail route", async () => {
    const { wrapper } = await mountPage(MySoftware);
    expect(wrapper.findAll(".software-card")).toHaveLength(
      softwareCatalog.entries.length,
    );
    for (const entry of softwareCatalog.entries) {
      expect(wrapper.get(`#software-${entry.id} h3 a`).attributes("href")).toBe(
        `/software/${entry.slug}`,
      );
    }
  });
  it("combines filters, sorts, selects chips, and clears the selection", async () => {
    const { wrapper } = await mountPage(MySoftware);
    await wrapper.get(".filter-toggle").trigger("click");
    for (const select of wrapper.findAll("select")) {
      const options = select.findAll("option");
      for (const option of options.slice(1, 2)) {
        await select.setValue(option.element.value);
        expect(wrapper.findAll(".software-card").length).toBeGreaterThan(0);
        await wrapper.get(".filter-clear-btn").trigger("click");
      }
    }
    for (const category of ["Type", "Purpose", "Main Topic", "Date"]) {
      await wrapper.get(`[data-category="${category}"]`).trigger("click");
      expect(
        wrapper.get(`[data-category="${category}"]`).attributes("aria-pressed"),
      ).toBe("true");
      await wrapper.get(".filter-clear-btn").trigger("click");
    }
    expect(wrapper.findAll(".software-card")).toHaveLength(
      softwareCatalog.entries.length,
    );
    expect(
      wrapper.get(".filter-clear-btn").attributes("disabled"),
    ).toBeDefined();
  });
  it("applies incoming route tags and explains an empty selection", async () => {
    const { wrapper, router } = await mountPage(
      MySoftware,
      "/software?tag=topic&value=Solid",
    );
    expect(wrapper.findAll(".software-card")).toHaveLength(
      softwareCatalog.entries.filter((entry) => entry.topics.includes("Solid"))
        .length,
    );
    expect(wrapper.text()).toContain("Solid Cockpit");
    await router.push("/software?tag=topic&value=missing");
    await flushPromises();
    expect(wrapper.text()).toContain("No matching software");
    expect(wrapper.findAll(".software-card")).toHaveLength(0);
    await wrapper.get(".filter-clear-btn").trigger("click");
    expect(wrapper.findAll(".software-card")).toHaveLength(
      softwareCatalog.entries.length,
    );
  });
  it("renders every detail including optional metadata, resources, and relationships", async () => {
    const { wrapper, router } = await mountPage(
      SoftwareDetail,
      "/software/solid-cockpit",
    );
    for (const entry of softwareCatalog.entries) {
      await router.push(`/software/${entry.slug}`);
      await flushPromises();
      expect(wrapper.get("h1").text()).toBe(entry.title);
      expect(wrapper.text()).toContain(entry.summary);
      expect(wrapper.findAll("#detail-related a")).toHaveLength(
        entry.related?.length ?? 0,
      );
      for (const topic of entry.topics) expect(wrapper.text()).toContain(topic);
    }
    await router.push("/software/missing");
    await flushPromises();
    expect(wrapper.text()).toContain("Software item not found");
    expect(wrapper.get('a[href="/software"]').text()).toBe("Back to Software");
  });
});
