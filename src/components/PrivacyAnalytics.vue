<template>
  <section class="privacy-page w3-content" aria-labelledby="privacy-title">
    <header class="privacy-page__header">
      <p class="privacy-page__eyebrow">Site settings</p>
      <h1 id="privacy-title">Privacy &amp; Analytics</h1>
      <p class="privacy-page__lead">
        This page explains what Google Analytics will record if you allow it.
      </p>
      <p class="privacy-page__aside">
        Google would very much like your data to help make the world a better place and,
        coincidentally, help Alphabet make more money
        <span
          v-if="stockSnapshot"
          class="privacy-stock"
          :class="stockChangeClass"
          tabindex="0"
          :aria-label="stockHoverLabel"
        >
          ({{ stockSnapshot.ticker }} {{ stockChangeArrow }} {{ stockChangeAmount }}
          <span class="privacy-stock__tooltip" role="tooltip">{{ stockHoverLabel }}</span>)
        </span>.
        Thank you in advance for helping me contribute to this crucial public service.
      </p>
    </header>

    <div class="privacy-page__grid">
      <article class="privacy-page__panel">
        <h2>What is tracked</h2>
        <ul class="privacy-page__list">
          <li><strong>Page views.</strong> The page path, page title, and visit time.</li>
          <li><strong>Technical context.</strong> Basic browser and device information needed for analytics reporting.</li>
          <li><strong>Usage patterns.</strong> The referring page and which site sections are visited.</li>
        </ul>
        <p class="privacy-page__note">
          <strong>Information NOT sent:</strong> Names, email addresses, search terms, SPARQL query
          contents, PDF contents, and advertising identifiers are not sent to Google
          Analytics. Google may still generate standard technical or session measurements from an
          allowed visit and process the request data required to deliver its service. In other words,
          Google gets some numbers, I get a rough idea of whether anyone is visiting, and everyone
          moves on with their day.
        </p>
        <p class="privacy-page__takeaway">
          <strong>Main takeaway.</strong> If you reject analytics, nothing is sent to Google Analytics and I do not
          even know you were here. Like a tree falling in the forest with no one around to hear it, you arguably 
          weren't even here at all.
        </p>
      </article>

      <article class="privacy-page__panel">
        <h2>Cookies and choice</h2>
        <div class="privacy-page__choice-copy">
          <p><strong>Default.</strong> Analytics is disabled by default.</p>
          <p>
            <strong>Allow.</strong> Google Analytics may set measurement cookies and receive page-view events. You are simply a number.
          </p>
          <p>
            <strong>Reject.</strong> Selecting Reject, or closing the notice, keeps analytics disabled. No guilt,
            no dramatic music, and no tiny cookie-shaped tears. You are simply not here.
          </p>
        </div>
        <p
          class="privacy-page__status"
          :class="{
            'privacy-page__status--allowed': consent === 'granted',
            'privacy-page__status--rejected': consent === 'denied',
          }"
          role="status"
        >
          <span class="privacy-page__status-label">Current choice</span>
          <strong>{{ consentLabel }}</strong>
        </p>
        <div class="privacy-page__actions">
          <button
            type="button"
            class="privacy-page__button privacy-page__button--allow"
            :class="{ 'privacy-page__button--selected': consent === 'granted' }"
            :aria-pressed="consent === 'granted'"
            @click="allowAnalytics"
          >
            Allow analytics
          </button>
          <button
            type="button"
            class="privacy-page__button privacy-page__button--reject"
            :class="{ 'privacy-page__button--selected': consent === 'denied' }"
            :aria-pressed="consent === 'denied'"
            @click="rejectAnalytics"
          >
            Reject analytics
          </button>
        </div>
      </article>

      <article class="privacy-page__panel">
        <h2>More information</h2>
        <p class="privacy-page__purpose">
          <strong>Purpose.</strong> I use these analytics to see how popular I am becoming. Nothing more,
          nothing less. They are not used for advertising, profiling, or selling personal information
          from this website; the ambition is popularity metrics, not a surveillance empire.
        </p>
        <p>
          Read Google's documentation about
          <a href="https://support.google.com/analytics/answer/11397207" target="_blank" rel="noopener noreferrer">
            Analytics cookies
          </a>
          and
          <a href="https://support.google.com/analytics/answer/10000067" target="_blank" rel="noopener noreferrer">
            consent mode
          </a>
          for additional technical details.
        </p>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getAnalyticsConsent, setAnalyticsConsent } from "../utils/analytics";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";

interface AlphabetStockSnapshot {
  ticker: string;
  currency: string;
  firstCommitDate: string;
  initialPriceDate: string;
  initialPrice: number;
  currentDate: string;
  currentClose: number;
  changeAmount: number;
  changePercent: number;
  source: string;
  sourceUrl: string;
}

export default defineComponent({
  name: "PrivacyAnalytics",
  data(): {
    consent: ReturnType<typeof getAnalyticsConsent>;
    stockSnapshot: AlphabetStockSnapshot | null;
  } {
    return {
      consent: getAnalyticsConsent(),
      stockSnapshot: null,
    };
  },
  computed: {
    consentLabel(): string {
      if (this.consent === "granted") {
        return "Analytics allowed";
      }
      if (this.consent === "denied") {
        return "Analytics rejected";
      }
      return "No choice recorded";
    },
    stockChangeClass(): string {
      if (!this.stockSnapshot) {
        return "";
      }
      if (this.stockSnapshot.changeAmount > 0) {
        return "privacy-stock--positive";
      }
      if (this.stockSnapshot.changeAmount < 0) {
        return "privacy-stock--negative";
      }
      return "privacy-stock--neutral";
    },
    stockChangeArrow(): string {
      if (!this.stockSnapshot || this.stockSnapshot.changeAmount === 0) {
        return "→";
      }
      return this.stockSnapshot.changeAmount > 0 ? "↑" : "↓";
    },
    stockChangeAmount(): string {
      if (!this.stockSnapshot) {
        return "";
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: this.stockSnapshot.currency,
        signDisplay: "never",
      }).format(Math.abs(this.stockSnapshot.changeAmount));
    },
    stockChangePercent(): string {
      if (!this.stockSnapshot) {
        return "";
      }
      const sign = this.stockSnapshot.changePercent > 0 ? "+" : "";
      return `${sign}${this.stockSnapshot.changePercent.toFixed(2)}%`;
    },
    stockHoverLabel(): string {
      if (!this.stockSnapshot) {
        return "";
      }
      let direction = "unchanged";
      if (this.stockSnapshot.changeAmount > 0) {
        direction = "up";
      } else if (this.stockSnapshot.changeAmount < 0) {
        direction = "down";
      }
      return `Since this website went live (first commit ${this.stockSnapshot.firstCommitDate}), `
        + `${this.stockSnapshot.ticker} is ${direction} ${this.stockChangePercent}. `
        + `Correlation is correlation; causation is unproven. `
        + `Initial close ${this.stockSnapshot.initialPrice.toFixed(2)} ${this.stockSnapshot.currency}; `
        + `latest close ${this.stockSnapshot.currentClose.toFixed(2)} ${this.stockSnapshot.currency} `
        + `on ${this.stockSnapshot.currentDate}.`;
    },
  },
  mounted() {
    document.title = "Privacy & Analytics | Elias Crum";
    void this.loadStockSnapshot();
  },
  beforeUnmount() {
    document.title = "Elias Crum";
  },
  methods: {
    async loadStockSnapshot() {
      try {
        const response = await fetch(resolvePublicAssetPath("/alphabet-stock.json"), {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        this.stockSnapshot = (await response.json()) as AlphabetStockSnapshot;
      } catch {
        this.stockSnapshot = null;
      }
    },
    async allowAnalytics() {
      await setAnalyticsConsent("granted");
      this.consent = "granted";
    },
    async rejectAnalytics() {
      await setAnalyticsConsent("denied");
      this.consent = "denied";
    },
  },
});
</script>

<style scoped>
.privacy-page {
  width: min(1040px, calc(100% - 32px));
  margin: 0 auto;
  padding: 30px 0 58px;
}

.privacy-page__header {
  padding: 8px 4px 24px;
  border-bottom: 1px solid var(--surface-outline);
}

.privacy-page__panel {
  padding: 22px 24px;
  background: var(--surface-bg);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
}

.privacy-page__eyebrow {
  margin: 0 0 6px;
  color: var(--link-color);
  font-size: var(--font-size-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.privacy-page h1,
.privacy-page h2 {
  color: var(--page-text);
}

.privacy-page h1 {
  margin: 0 0 12px;
  font-size: var(--content-h1-size);
}

.privacy-page h2 {
  margin: 0 0 12px;
  font-size: var(--content-h2-size);
}

.privacy-page p,
.privacy-page li {
  color: var(--text-muted);
  font-size: var(--font-size-body);
  line-height: 1.55;
}

.privacy-page strong {
  color: var(--page-text);
  font-weight: 650;
}

.privacy-page__lead,
.privacy-page__aside {
  max-width: 820px;
  margin: 0;
}

.privacy-page__lead {
  color: var(--page-text) !important;
}

.privacy-page__aside {
  margin-top: 10px;
}

.privacy-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.privacy-page__list {
  display: grid;
  gap: 10px;
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
}

.privacy-page__list li {
  padding-left: 12px;
  border-left: 2px solid rgba(var(--accent-ink-rgb), 0.45);
}

.privacy-page__panel p {
  margin: 0 0 14px;
}

.privacy-page__panel p:last-child {
  margin-bottom: 0;
}

.privacy-page__panel:nth-child(3) {
  grid-column: 1 / -1;
}

.privacy-page__note,
.privacy-page__purpose {
  padding: 11px 13px;
  border-left: 3px solid var(--link-color);
  background: var(--surface-card);
}

.privacy-page__takeaway {
  padding: 12px 13px;
  color: var(--page-text) !important;
  border: 1px solid rgba(var(--accent-ink-rgb), 0.28);
  border-left: 3px solid var(--accent-ink);
  border-radius: 8px;
  background: rgba(var(--accent-ink-rgb), 0.1);
}

.privacy-page__takeaway strong {
  color: var(--accent-ink);
}

.privacy-page__choice-copy {
  display: grid;
  gap: 8px;
}

.privacy-page__choice-copy p {
  margin: 0;
}

.privacy-page__status {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 18px 0 14px !important;
  padding: 9px 12px;
  border-left: 3px solid var(--link-color);
  background: var(--surface-card);
}

.privacy-page__status-label {
  color: var(--text-soft);
  font-size: var(--font-size-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.privacy-page__status--allowed {
  border-left-color: rgba(var(--accent-ink-rgb), 0.72);
  background: rgba(var(--accent-ink-rgb), 0.16);
}

.privacy-page__status--allowed strong {
  color: var(--accent-ink);
}

.privacy-page__status--rejected {
  border-left-color: rgba(191, 94, 94, 0.72);
  background: rgba(191, 94, 94, 0.14);
}

.privacy-page__status--rejected strong {
  color: #bb5360;
}

.privacy-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.privacy-page__button {
  min-height: 36px;
  padding: 7px 12px;
  color: var(--page-text);
  font: inherit;
  border: 1px solid var(--surface-outline);
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease,
    filter 0.16s ease;
}

.privacy-page__button--allow {
  border-color: var(--surface-outline);
}

.privacy-page__button--selected {
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(var(--accent-ink-rgb), 0.16);
}

.privacy-page__button--allow.privacy-page__button--selected {
  border-color: rgba(var(--accent-ink-rgb), 0.72);
  background: rgba(var(--accent-ink-rgb), 0.16);
}

.privacy-page__button--reject.privacy-page__button--selected {
  border-color: rgba(191, 94, 94, 0.72);
  background: rgba(191, 94, 94, 0.14);
  box-shadow: 0 0 0 2px rgba(191, 94, 94, 0.16);
}

.privacy-page__button:hover {
  filter: brightness(1.08);
}

.privacy-page__button:focus-visible {
  outline: 2px solid var(--link-color);
  outline-offset: 2px;
}

.privacy-stock {
  position: relative;
  display: inline;
  font-weight: 700;
  cursor: help;
  outline: none;
}

.privacy-stock--positive {
  color: #238b52;
}

.privacy-stock--negative {
  color: #bb5360;
}

.privacy-stock--neutral {
  color: var(--text-muted);
}

.privacy-stock__tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 9px);
  z-index: 4;
  width: max-content;
  max-width: min(360px, 80vw);
  padding: 8px 10px;
  color: var(--page-text);
  font-size: var(--font-size-caption);
  font-weight: 400;
  line-height: 1.35;
  text-align: left;
  background: var(--surface-elevated);
  border: 1px solid var(--surface-outline);
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 4px);
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.privacy-stock:hover .privacy-stock__tooltip,
.privacy-stock:focus-visible .privacy-stock__tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (max-width: 850px) {
  .privacy-page__grid {
    grid-template-columns: 1fr;
  }

  .privacy-page__panel:nth-child(3) {
    grid-column: auto;
  }
}
</style>
