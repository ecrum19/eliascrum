import { expect, it, vi } from "vitest";

it("resolves every route component and keeps historical redirects", async () => {
  const { default: router } = await import("../../src/router");
  for (const route of router.getRoutes()) {
    if (route.components?.default) {
      const component = await (
        route.components.default as () => Promise<{ default: unknown }>
      )();
      expect(component.default).toBeTruthy();
    }
  }
  await router.push("/work");
  expect(router.currentRoute.value.path).toBe("/publications");
  await router.push("/");
  expect(router.currentRoute.value.path).toBe("/about");
});

it("mounts the app, registers page tracking, and restores stored consent before tracking", async () => {
  const app = { use: vi.fn(), mount: vi.fn() };
  const router = {
    afterEach: vi.fn(),
    isReady: vi.fn().mockResolvedValue(undefined),
  };
  const track = vi.fn();
  const consent = vi.fn().mockResolvedValue(undefined);
  vi.doMock("vue", async (importOriginal) => ({
    ...(await importOriginal<typeof import("vue")>()),
    createApp: () => app,
  }));
  vi.doMock("../../src/router", () => ({ default: router }));
  vi.doMock("../../src/utils/analytics", () => ({
    initializeStoredAnalyticsConsent: consent,
    trackPageView: track,
  }));
  await import("../../src/main");
  await vi.waitFor(() => expect(track).toHaveBeenCalledOnce());
  expect(app.use).toHaveBeenCalledWith(router);
  expect(app.mount).toHaveBeenCalledWith("#app");
  expect(consent).toHaveBeenCalledOnce();
  router.afterEach.mock.calls[0][0]();
  expect(track).toHaveBeenCalledTimes(2);
  vi.doUnmock("vue");
  vi.doUnmock("../../src/router");
  vi.doUnmock("../../src/utils/analytics");
});
