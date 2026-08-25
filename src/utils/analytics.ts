const ANALYTICS_CONSENT_KEY = "site-analytics-consent";
const ANALYTICS_SETTINGS_EVENT = "open-analytics-settings";

export type AnalyticsConsent = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let analyticsInitialized = false;
let analyticsInitialization: Promise<void> | null = null;

function measurementId(): string {
  return (import.meta.env.VITE_GA_MEASUREMENT_ID ?? "").trim();
}

function readStoredConsent(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function storeConsent(consent: Exclude<AnalyticsConsent, null>): void {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // Analytics remains usable for this session when storage is unavailable.
  }
}

function queueGoogleTag(...args: unknown[]): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...queuedArgs: unknown[]) => {
    window.dataLayer.push(queuedArgs);
  });
  window.gtag(...args);
}

function removeAnalyticsCookies(): void {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ga")) {
      return;
    }

    document.cookie = `${name}=; Max-Age=0; path=/`;
  });
}

/**
 * Loads GA4 only after consent has been granted. The default consent state is
 * still denied so a slow script load cannot create an accidental page view.
 */
export function initializeGoogleAnalytics(): Promise<void> {
  if (analyticsInitialized || !measurementId()) {
    return Promise.resolve();
  }

  if (analyticsInitialization) {
    return analyticsInitialization;
  }

  analyticsInitialization = new Promise((resolve) => {
    const id = measurementId();
    window.dataLayer = window.dataLayer || [];
    queueGoogleTag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-google-analytics-id="${id}"]`,
    );

    if (existingScript) {
      analyticsInitialized = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.dataset.googleAnalyticsId = id;
    script.onload = () => {
      queueGoogleTag("js", new Date());
      queueGoogleTag("config", id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      analyticsInitialized = true;
      resolve();
    };
    script.onerror = () => {
      analyticsInitialization = null;
      resolve();
    };
    document.head.appendChild(script);
  });

  return analyticsInitialization;
}

export function getAnalyticsConsent(): AnalyticsConsent {
  return readStoredConsent();
}

export async function setAnalyticsConsent(
  consent: Exclude<AnalyticsConsent, null>,
): Promise<void> {
  storeConsent(consent);

  if (consent === "denied") {
    if (analyticsInitialized) {
      queueGoogleTag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
    removeAnalyticsCookies();
    return;
  }

  await initializeGoogleAnalytics();
  if (!analyticsInitialized) {
    return;
  }

  queueGoogleTag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export async function initializeStoredAnalyticsConsent(): Promise<void> {
  if (getAnalyticsConsent() === "granted") {
    await setAnalyticsConsent("granted");
  }
}

export function trackPageView(): void {
  if (
    !analyticsInitialized ||
    getAnalyticsConsent() !== "granted" ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });
}

export function openAnalyticsSettings(): void {
  window.dispatchEvent(new Event(ANALYTICS_SETTINGS_EVENT));
}

export function subscribeToAnalyticsSettings(callback: () => void): () => void {
  window.addEventListener(ANALYTICS_SETTINGS_EVENT, callback);
  return () => window.removeEventListener(ANALYTICS_SETTINGS_EVENT, callback);
}
