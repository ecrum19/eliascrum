import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  document.head
    .querySelectorAll("[data-google-analytics-id]")
    .forEach((node) => node.remove());
  window.dataLayer = [];
  delete window.gtag;
  vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST");
});

describe("analytics consent", () => {
  it("does not load or track before consent", async () => {
    const api = await import("../../src/utils/analytics");
    expect(api.getAnalyticsConsent()).toBeNull();
    await api.initializeStoredAnalyticsConsent();
    api.trackPageView();
    expect(document.querySelector("[data-google-analytics-id]")).toBeNull();
    expect(window.dataLayer).toEqual([]);
  });
  it("initializes once, tracks only while granted, and removes analytics cookies on rejection", async () => {
    const api = await import("../../src/utils/analytics");
    const consent = api.setAnalyticsConsent("granted");
    const sameInitialization = api.initializeGoogleAnalytics();
    expect(
      document.querySelectorAll("[data-google-analytics-id]"),
    ).toHaveLength(1);
    document
      .querySelector("script[data-google-analytics-id]")!
      .dispatchEvent(new Event("load"));
    await Promise.all([consent, sameInitialization]);
    api.trackPageView();
    expect(window.dataLayer).toContainEqual(
      expect.arrayContaining(["event", "page_view"]),
    );
    document.cookie = "_ga_test=present; path=/";
    await api.setAnalyticsConsent("denied");
    const count = window.dataLayer.length;
    api.trackPageView();
    expect(window.dataLayer).toHaveLength(count);
    expect(document.cookie).not.toContain("_ga_test");
    expect(api.getAnalyticsConsent()).toBe("denied");
  });
  it("handles an unavailable measurement ID and blocked storage", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Denied");
    });
    const api = await import("../../src/utils/analytics");
    expect(api.getAnalyticsConsent()).toBeNull();
    await api.setAnalyticsConsent("granted");
    expect(document.querySelector("[data-google-analytics-id]")).toBeNull();
  });
  it("settles failed loading without sending a page view", async () => {
    const api = await import("../../src/utils/analytics");
    const consent = api.setAnalyticsConsent("granted");
    document
      .querySelector("script[data-google-analytics-id]")!
      .dispatchEvent(new Event("error"));
    await consent;
    api.trackPageView();
    expect(
      window.dataLayer.some(
        (value) => Array.isArray(value) && value[0] === "event",
      ),
    ).toBe(false);
  });
  it("unsubscribes settings listeners", async () => {
    const api = await import("../../src/utils/analytics");
    const callback = vi.fn();
    const dispose = api.subscribeToAnalyticsSettings(callback);
    api.openAnalyticsSettings();
    expect(callback).toHaveBeenCalledTimes(1);
    dispose();
    api.openAnalyticsSettings();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
