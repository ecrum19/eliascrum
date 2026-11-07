import { describe, expect, it, vi } from "vitest";
import type { RouteLocationNormalized } from "vue-router";
import { scrollBehavior } from "../../src/router";

const at = (path: string, extra: Partial<RouteLocationNormalized> = {}) =>
  ({ path, hash: "", query: {}, ...extra }) as RouteLocationNormalized;

describe("router scroll behavior", () => {
  it("opens a new page at the top instead of keeping the listing's scroll position", () => {
    expect(scrollBehavior(at("/publications/example/paper"), at("/publications"), null)).toEqual({
      top: 0,
    });
  });
  it("restores the previous position on back/forward once the page is tall enough", async () => {
    const height = vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(500);
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
    const restored = scrollBehavior(at("/publications"), at("/publications/example/paper"), {
      left: 0,
      top: 1200,
    });
    expect(frames).toHaveLength(1); // still waiting for the listing to render
    height.mockReturnValue(5000);
    frames[0](0);
    await expect(restored).resolves.toEqual({ left: 0, top: 1200 });
  });
  it("restores anyway after a short wait so navigation never hangs", async () => {
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(0);
    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      now.mockReturnValue(2000);
      callback(0);
      return 0;
    });
    await expect(
      scrollBehavior(at("/publications"), at("/publications/example/paper"), { left: 0, top: 900 }),
    ).resolves.toEqual({ left: 0, top: 900 });
  });
  it("leaves anchors to the contents panel and keeps the place on filter changes", () => {
    expect(scrollBehavior(at("/about", { hash: "#cv" }), at("/publications"), null)).toBe(false);
    expect(
      scrollBehavior(at("/publications", { query: { tag: "topic", value: "RDF" } }), at("/publications"), null),
    ).toBe(false);
  });
});
