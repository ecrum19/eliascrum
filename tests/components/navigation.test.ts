import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import App from "../../src/App.vue";
import SpotlightSearch from "../../src/components/SpotlightSearch.vue";
import WorkToc from "../../src/components/WorkToc.vue";
import { mountPage } from "../helpers/mountPage";
import { createMemoryHistory, createRouter } from "vue-router";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("application shell", () => {
  it("persists theme, text size, and performance choices and handles search shortcuts", async () => {
    const { wrapper } = await mountPage(App, "/about");
    expect(document.documentElement.dataset.theme).toBe("dark");
    await wrapper.get(".theme-toggle").trigger("click");
    expect(localStorage.getItem("site-theme")).toBe("light");
    await wrapper.get(".theme-toggle").trigger("click");
    expect(localStorage.getItem("site-theme")).toBe("dark");
    for (const value of ["large", "small", "normal"]) {
      await wrapper.get(".text-size-toggle").trigger("click");
      expect(localStorage.getItem("site-text-scale")).toBe(value);
    }
    await wrapper.get(".performance-toggle").trigger("click");
    expect(localStorage.getItem("site-performance-mode")).toBe("auto");
    await wrapper.get(".performance-toggle").trigger("click");
    expect(localStorage.getItem("site-performance-mode")).toBe("standard");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
    );
    await vi.waitFor(() =>
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true),
    );
    await wrapper.get(".spotlight-close").trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });
  it("restores stored display preferences on startup", async () => {
    localStorage.setItem("site-theme", "light");
    localStorage.setItem("site-text-scale", "large");
    await mountPage(App);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(
      document.documentElement.style.getPropertyValue("--text-scale-body"),
    ).toBe("1.16");
  });
});

describe("search interaction", () => {
  async function openSearch(allowSparql = true) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
      ],
    });
    await router.push("/");
    const wrapper = mount(SpotlightSearch, {
      props: { open: true, allowSparql },
      global: { plugins: [router] },
      attachTo: document.body,
    });
    await flushPromises();
    await vi.waitFor(
      () =>
        expect(wrapper.findAll(".spotlight-result").length).toBeGreaterThan(0),
      { timeout: 5000 },
    );
    return { wrapper, router };
  }
  it("filters results, opens the first match with Enter, and releases body scrolling", async () => {
    const { wrapper, router } = await openSearch();
    expect(document.body.classList.contains("spotlight-open")).toBe(true);
    await wrapper.get("input").setValue("zzzzunmatchedzzzz");
    await flushPromises();
    expect(wrapper.findAll(".spotlight-result")).toHaveLength(0);
    await wrapper.get("input").setValue("Solid Cockpit");
    await flushPromises();
    expect(wrapper.findAll(".spotlight-result").length).toBeGreaterThan(0);
    await wrapper.get("input").trigger("keydown.enter");
    await flushPromises();
    expect(router.currentRoute.value.path).not.toBe("/");
    expect(wrapper.emitted("close")).toHaveLength(1);
    await wrapper.setProps({ open: false });
    expect(document.body.classList.contains("spotlight-open")).toBe(false);
  });
  it("guards semantic search in Lite mode and returns to keyword mode when disabled", async () => {
    const { wrapper } = await openSearch(false);
    await wrapper.get(".spotlight-mode-btn").trigger("click");
    expect(wrapper.text()).toContain("SPARQL search is disabled");
    expect(wrapper.find("textarea").exists()).toBe(false);
    await wrapper.setProps({ allowSparql: true });
    await wrapper.findAll(".spotlight-mode-btn")[1].trigger("click");
    expect(wrapper.find("textarea").exists()).toBe(true);
    await wrapper.get("textarea").setValue("");
    await wrapper.get(".spotlight-run-query").trigger("click");
    await flushPromises();
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain("Enter a SPARQL SELECT query"),
    );
    await wrapper.setProps({ allowSparql: false });
    await flushPromises();
    expect(wrapper.find("textarea").exists()).toBe(false);
    await wrapper.get('[role="dialog"]').trigger("keydown.esc");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});

describe("table of contents", () => {
  it("normalizes hierarchy, scrolls to anchors, responds to hashes, and collapses", async () => {
    document.body.innerHTML =
      '<section id="overview"></section><section id="details"></section><section id="last"></section>';
    const entries = [
      { id: "overview", label: "Overview", level: 1 },
      { id: "details", label: "Details", level: 3 },
      { id: "last", label: "Last", level: NaN },
    ];
    const wrapper = mount(WorkToc, {
      props: { entries },
      attachTo: document.body,
    });
    await flushPromises();
    expect(wrapper.findAll("a")[1].classes()).toContain(
      "work-toc-link-level-2",
    );
    await wrapper.findAll("a")[1].trigger("click");
    expect(window.location.hash).toBe("#details");
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
    expect(wrapper.findAll("a")[0].classes()).toContain(
      "work-toc-link-parent-active",
    );
    window.location.hash = "#last";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await flushPromises();
    expect(wrapper.findAll("a")[2].attributes("aria-current")).toBe("location");
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    await wrapper.get("button").trigger("click");
    expect(wrapper.get("nav").attributes("aria-hidden")).toBe("true");
    await wrapper.setProps({ entries: [] });
    expect(wrapper.findAll("a")).toHaveLength(0);
  });
});
