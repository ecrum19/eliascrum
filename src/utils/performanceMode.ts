/**
 * Local performance preferences used to avoid optional, high-bandwidth features
 * on constrained devices. The decision is never sent to analytics or a server.
 */
export type PerformanceMode = "auto" | "standard" | "lite";
export type EffectivePerformanceMode = Exclude<PerformanceMode, "auto">;

export const PERFORMANCE_MODE_STORAGE_KEY = "site-performance-mode";

const PERFORMANCE_MODE_SEQUENCE: PerformanceMode[] = ["auto", "standard", "lite"];

interface NetworkInformationLike extends EventTarget {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorWithPerformanceHints extends Navigator {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
  deviceMemory?: number;
}

interface WindowWithIdleCallback extends Window {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
}

export function readPerformanceMode(): PerformanceMode {
  if (typeof window === "undefined") {
    return "auto";
  }

  try {
    const savedMode = window.localStorage.getItem(PERFORMANCE_MODE_STORAGE_KEY);
    return savedMode === "standard" || savedMode === "lite" || savedMode === "auto"
      ? savedMode
      : "auto";
  } catch {
    // Privacy-focused browser settings can deny storage access; Auto still works without it.
    return "auto";
  }
}

export function savePerformanceMode(mode: PerformanceMode): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, mode);
    } catch {
      // The current in-memory selection remains active even if persistence is unavailable.
    }
  }
}

export function getNextPerformanceMode(mode: PerformanceMode): PerformanceMode {
  const currentIndex = PERFORMANCE_MODE_SEQUENCE.indexOf(mode);
  return PERFORMANCE_MODE_SEQUENCE[(currentIndex + 1) % PERFORMANCE_MODE_SEQUENCE.length];
}

export function resolvePerformanceMode(mode: PerformanceMode): EffectivePerformanceMode {
  return mode === "auto" ? (shouldUseLiteMode() ? "lite" : "standard") : mode;
}

export function shouldDeferPdfPreviews(): boolean {
  return resolvePerformanceMode(readPerformanceMode()) === "lite";
}

/**
 * Re-evaluates Auto mode if the browser exposes network or motion preference
 * changes. Unsupported browser APIs simply leave Auto in its standard state.
 */
export function addPerformanceSignalListeners(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const navigatorWithHints = navigator as NavigatorWithPerformanceHints;
  const connection = getConnection(navigatorWithHints);
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  connection?.addEventListener?.("change", onChange);
  reducedMotion?.addEventListener?.("change", onChange);

  return () => {
    connection?.removeEventListener?.("change", onChange);
    reducedMotion?.removeEventListener?.("change", onChange);
  };
}

export function scheduleWhenIdle(callback: () => void, timeout = 1400): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const browserWindow = window as WindowWithIdleCallback;
  if (typeof browserWindow.requestIdleCallback === "function") {
    const handle = browserWindow.requestIdleCallback(callback, { timeout });
    return () => browserWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, Math.min(timeout, 900));
  return () => window.clearTimeout(handle);
}

function shouldUseLiteMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithHints = navigator as NavigatorWithPerformanceHints;
  const connection = getConnection(navigatorWithHints);
  const connectionType = connection?.effectiveType?.toLowerCase();

  if (
    connection?.saveData ||
    connectionType === "slow-2g" ||
    connectionType === "2g" ||
    connectionType === "3g" ||
    (typeof connection?.downlink === "number" && connection.downlink < 1.5) ||
    (typeof connection?.rtt === "number" && connection.rtt >= 500)
  ) {
    return true;
  }

  if (typeof navigatorWithHints.deviceMemory === "number" && navigatorWithHints.deviceMemory <= 2) {
    return true;
  }

  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2) {
    return true;
  }

  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function getConnection(navigatorWithHints: NavigatorWithPerformanceHints): NetworkInformationLike | undefined {
  return (
    navigatorWithHints.connection ||
    navigatorWithHints.mozConnection ||
    navigatorWithHints.webkitConnection
  );
}
