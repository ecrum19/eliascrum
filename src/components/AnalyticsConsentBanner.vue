<template>
  <aside
    v-if="isVisible"
    class="analytics-consent"
    aria-label="Analytics consent"
  >
    <div class="analytics-consent__copy">
      <strong>Optional analytics</strong>
      <span>
        Google Analytics uses cookies to measure visits and page views. You decide whether it may
        run.
      </span>
    </div>
    <div class="analytics-consent__actions">
      <router-link to="/privacy" class="analytics-consent__link">What is tracked?</router-link>
      <button type="button" class="analytics-consent__button analytics-consent__button--quiet" @click="reject">
        Reject
      </button>
      <button type="button" class="analytics-consent__button analytics-consent__button--allow" @click="allow">
        Allow analytics
      </button>
      <button
        type="button"
        class="analytics-consent__close"
        aria-label="Close analytics notice"
        @click="close"
      >
        <i class="fa fa-times" aria-hidden="true"></i>
      </button>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  subscribeToAnalyticsSettings,
  trackPageView,
} from "../utils/analytics";

export default defineComponent({
  name: "AnalyticsConsentBanner",
  data(): { isVisible: boolean; unsubscribe: (() => void) | null } {
    return {
      isVisible: false,
      unsubscribe: null,
    };
  },
  mounted() {
    this.unsubscribe = subscribeToAnalyticsSettings(this.expand);

    if (getAnalyticsConsent() === null) {
      this.isVisible = true;
    }
  },
  beforeUnmount() {
    this.unsubscribe?.();
  },
  methods: {
    expand() {
      this.isVisible = true;
    },
    close() {
      this.isVisible = false;
    },
    async allow() {
      await setAnalyticsConsent("granted");
      trackPageView();
      this.close();
    },
    async reject() {
      await setAnalyticsConsent("denied");
      this.close();
    },
  },
});
</script>

<style scoped>
.analytics-consent {
  position: fixed;
  left: 50%;
  bottom: 18px;
  z-index: 20;
  width: min(1380px, calc(100vw - 32px));
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 9px 14px;
  color: var(--page-text);
  background: color-mix(in srgb, var(--surface-elevated) 96%, transparent);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
  animation: analytics-consent-in 0.2s ease-out;
}

.analytics-consent--compact {
  left: auto;
  right: 18px;
  width: auto;
  min-width: 156px;
  transform: none;
  padding: 8px 10px 8px 13px;
  border-radius: 999px;
  gap: 12px;
}

.analytics-consent__copy {
  display: grid;
  gap: 1px;
  min-width: 0;
  font-size: var(--font-size-meta);
}

.analytics-consent__copy strong {
  color: var(--page-text);
  font-size: var(--font-size-body-sm);
}

.analytics-consent__copy span {
  color: var(--text-muted);
}

.analytics-consent__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.analytics-consent__button,
.analytics-consent__link,
.analytics-consent__close {
  font: inherit;
  cursor: pointer;
}

.analytics-consent__button,
.analytics-consent__link {
  min-height: 30px;
  padding: 4px 10px;
  border-radius: 8px;
  text-decoration: none;
  white-space: nowrap;
}

.analytics-consent__button {
  border: 1px solid var(--surface-outline);
  color: var(--page-text);
  background: transparent;
}

.analytics-consent__button--allow {
  border-color: rgba(var(--accent-ink-rgb), 0.62);
  background: rgba(var(--accent-ink-rgb), 0.13);
}

.analytics-consent__button:hover,
.analytics-consent__link:hover {
  filter: brightness(1.08);
}

.analytics-consent__link {
  color: var(--link-color);
}

.analytics-consent__close {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  color: var(--text-soft);
  background: transparent;
}

@keyframes analytics-consent-in {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@media (max-width: 700px) {
  .analytics-consent {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .analytics-consent__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .analytics-consent {
    animation: none;
  }
}
</style>
