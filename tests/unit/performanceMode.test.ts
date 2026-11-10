import { describe, expect, it, vi } from "vitest";
import {
  addPerformanceSignalListeners,
  getNextPerformanceMode,
  readPerformanceMode,
  resolvePerformanceMode,
  savePerformanceMode,
  scheduleWhenIdle,
  shouldDeferPdfPreviews,
} from "../../src/utils/performanceMode";

describe("performance preferences", () => {
  it("persists choices and cycles through each mode", () => {
    expect(readPerformanceMode()).toBe("auto");
    for (const mode of ["auto", "standard", "lite"] as const) {
      savePerformanceMode(mode);
      expect(readPerformanceMode()).toBe(mode);
    }
    expect(getNextPerformanceMode("auto")).toBe("standard");
    expect(getNextPerformanceMode("standard")).toBe("lite");
    expect(getNextPerformanceMode("lite")).toBe("auto");
    expect(shouldDeferPdfPreviews()).toBe(true);
    localStorage.setItem("site-performance-mode", "invalid");
    expect(readPerformanceMode()).toBe("auto");
  });
  it("keeps explicit choices and works when storage is denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Denied");
    });
    expect(readPerformanceMode()).toBe("auto");
    expect(() => savePerformanceMode("lite")).not.toThrow();
    expect(resolvePerformanceMode("standard")).toBe("standard");
    expect(resolvePerformanceMode("lite")).toBe("lite");
  });
  it.each([
    { saveData: true },
    { effectiveType: "slow-2g" },
    { effectiveType: "2g" },
    { effectiveType: "3g" },
    { downlink: 1 },
    { rtt: 500 },
  ])("detects constrained network %j", (connection) => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
    expect(resolvePerformanceMode("auto")).toBe("lite");
    delete (navigator as Navigator & { connection?: unknown }).connection;
  });
  it("observes and removes browser preference listeners", () => {
    const connection = new EventTarget();
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: connection,
    });
    const changed = vi.fn();
    const dispose = addPerformanceSignalListeners(changed);
    connection.dispatchEvent(new Event("change"));
    expect(changed).toHaveBeenCalledTimes(1);
    dispose();
    connection.dispatchEvent(new Event("change"));
    expect(changed).toHaveBeenCalledTimes(1);
    delete (navigator as Navigator & { connection?: unknown }).connection;
  });
  it("schedules and cancels work with a timer fallback", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const cancel = scheduleWhenIdle(callback);
    cancel();
    vi.runAllTimers();
    expect(callback).not.toHaveBeenCalled();
    scheduleWhenIdle(callback, 50);
    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
  });
  it("uses and cancels native idle callbacks when available", () => {
    const request = vi.fn(() => 12);
    const cancel = vi.fn();
    vi.stubGlobal("requestIdleCallback", request);
    vi.stubGlobal("cancelIdleCallback", cancel);
    const callback = vi.fn();
    scheduleWhenIdle(callback, 700)();
    expect(request).toHaveBeenCalledWith(callback, { timeout: 700 });
    expect(cancel).toHaveBeenCalledWith(12);
  });
});
