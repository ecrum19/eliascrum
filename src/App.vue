<template>
  <div class="app-shell">
    <the-header
      :theme="theme"
      :text-scale-mode="textScaleMode"
      :performance-mode="performanceMode"
      :effective-performance-mode="effectivePerformanceMode"
      @toggle-theme="toggleTheme"
      @toggle-text-scale="toggleTextScale"
      @toggle-performance-mode="togglePerformanceMode"
      @open-search="openSearch"
    />
    <spotlight-search
      v-if="isSearchOpen"
      :open="isSearchOpen"
      :allow-sparql="effectivePerformanceMode === 'standard'"
      @close="closeSearch"
    />
    <analytics-consent-banner />
    <div class="background" :class="{ 'background--video-ready': backgroundVideoReady }" aria-hidden="true">
      <img class="background-poster" :src="backgroundPosterUrl" alt="" />
      <video
        v-if="backgroundVideoEnabled"
        ref="backgroundVideo"
        class="background-video"
        :src="backgroundVideoUrl"
        muted
        loop
        autoplay
        playsinline
        preload="metadata"
        @canplay="activateBackgroundVideo"
      ></video>
    </div>
    <main class="app-main" :class="{ 'app-main--compact': !isHomeRoute }">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </main>
    <the-footer />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import AnalyticsConsentBanner from './components/AnalyticsConsentBanner.vue';
import backgroundPosterUrl from "./assets/abstract-dna-poster.webp";
import backgroundVideoUrl from "./assets/Abstract DNA Medical Animation.mp4";
import { resolvePublicAssetPath } from "./utils/publicAssetPath";
import {
  addPerformanceSignalListeners,
  getNextPerformanceMode,
  readPerformanceMode,
  resolvePerformanceMode,
  savePerformanceMode,
  scheduleWhenIdle,
  type EffectivePerformanceMode,
  type PerformanceMode,
} from "./utils/performanceMode";

const SpotlightSearch = defineAsyncComponent(() => import("./components/SpotlightSearch.vue"));

type ThemeMode = "dark" | "light";
type TextScaleMode = "small" | "normal" | "large";
const THEME_STORAGE_KEY = "site-theme";
const TEXT_SCALE_STORAGE_KEY = "site-text-scale";
const TEXT_SCALE_SEQUENCE: TextScaleMode[] = ["small", "normal", "large"];
const TEXT_SCALE_VALUES: Record<TextScaleMode, { body: string; small: string; heading: string }> = {
  small: { body: "0.95", small: "0.9", heading: "0.95" },
  normal: { body: "1", small: "1", heading: "1" },
  large: { body: "1.16", small: "1.32", heading: "1.18" },
};

export default defineComponent({
  name: "App",
  components: {
    TheHeader,
    TheFooter,
    AnalyticsConsentBanner,
    SpotlightSearch,
  },
  data(): {
    theme: ThemeMode;
    textScaleMode: TextScaleMode;
    performanceMode: PerformanceMode;
    effectivePerformanceMode: EffectivePerformanceMode;
    backgroundPosterUrl: string;
    backgroundVideoUrl: string;
    backgroundVideoEnabled: boolean;
    backgroundVideoReady: boolean;
    backgroundVideoCancel: (() => void) | null;
    removePerformanceSignalListeners: (() => void) | null;
    isSearchOpen: boolean;
  } {
    const performanceMode = readPerformanceMode();
    return {
      theme: "dark",
      textScaleMode: "normal",
      performanceMode,
      effectivePerformanceMode: resolvePerformanceMode(performanceMode),
      backgroundPosterUrl,
      backgroundVideoUrl,
      backgroundVideoEnabled: false,
      backgroundVideoReady: false,
      backgroundVideoCancel: null,
      removePerformanceSignalListeners: null,
      isSearchOpen: false,
    };
  },
  computed: {
    isHomeRoute(): boolean {
      return this.$route.path === "/about" || this.$route.path === "/";
    },
  },
  methods: {
    applyTheme(theme: ThemeMode) {
      document.documentElement.setAttribute("data-theme", theme);
      this.updateSiteIcons();
    },
    updateSiteIcons() {
      const iconHref = resolvePublicAssetPath("/branding/favicon.svg");

      const iconLinks = document.querySelectorAll<HTMLLinkElement>(
        "#site-favicon, #site-shortcut-icon, #site-apple-touch-icon",
      );

      iconLinks.forEach((link) => {
        link.href = iconHref;
      });
    },
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      this.applyTheme(this.theme);
      localStorage.setItem(THEME_STORAGE_KEY, this.theme);
    },
    applyTextScale(mode: TextScaleMode) {
      const values = TEXT_SCALE_VALUES[mode];
      document.documentElement.style.setProperty("--text-scale-body", values.body);
      document.documentElement.style.setProperty("--text-scale-small", values.small);
      document.documentElement.style.setProperty("--text-scale-heading", values.heading);
    },
    toggleTextScale() {
      const currentIndex = TEXT_SCALE_SEQUENCE.indexOf(this.textScaleMode);
      const nextIndex = (currentIndex + 1) % TEXT_SCALE_SEQUENCE.length;
      this.textScaleMode = TEXT_SCALE_SEQUENCE[nextIndex];
      this.applyTextScale(this.textScaleMode);
      localStorage.setItem(TEXT_SCALE_STORAGE_KEY, this.textScaleMode);
    },
    refreshPerformanceMode(scheduleVideo = true) {
      this.effectivePerformanceMode = resolvePerformanceMode(this.performanceMode);
      document.documentElement.dataset.performanceMode = this.effectivePerformanceMode;
      if (scheduleVideo) {
        this.scheduleBackgroundVideo();
      }
    },
    togglePerformanceMode() {
      this.performanceMode = getNextPerformanceMode(this.performanceMode);
      savePerformanceMode(this.performanceMode);
      this.refreshPerformanceMode();
    },
    scheduleBackgroundVideo() {
      this.backgroundVideoCancel?.();
      this.backgroundVideoCancel = null;
      this.backgroundVideoReady = false;
      this.backgroundVideoEnabled = false;

      if (this.effectivePerformanceMode !== "standard") {
        return;
      }

      // The still image is rendered first; the MP4 is only inserted after the page is responsive.
      this.backgroundVideoCancel = scheduleWhenIdle(() => {
        this.backgroundVideoCancel = null;
        if (this.effectivePerformanceMode === "standard") {
          this.backgroundVideoEnabled = true;
        }
      });
    },
    activateBackgroundVideo() {
      const video = this.$refs.backgroundVideo as HTMLVideoElement | undefined;
      if (!video) {
        return;
      }

      video.playbackRate = 0.45;
      this.backgroundVideoReady = true;
      void video.play().catch(() => undefined);
    },
    openSearch() {
      this.isSearchOpen = true;
    },
    closeSearch() {
      this.isSearchOpen = false;
    },
    handleGlobalSearchShortcut(event: KeyboardEvent) {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) {
        return;
      }

      event.preventDefault();
      this.openSearch();
    },
  },
  created() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      this.theme = savedTheme;
    }

    const savedTextScale = localStorage.getItem(TEXT_SCALE_STORAGE_KEY);
    if (
      savedTextScale === "small" ||
      savedTextScale === "normal" ||
      savedTextScale === "large"
    ) {
      this.textScaleMode = savedTextScale;
    }

    this.applyTheme(this.theme);
    this.applyTextScale(this.textScaleMode);
    this.refreshPerformanceMode(false);
  },
  mounted() {
    window.addEventListener("keydown", this.handleGlobalSearchShortcut);
    this.removePerformanceSignalListeners = addPerformanceSignalListeners(() => {
      if (this.performanceMode === "auto") {
        this.refreshPerformanceMode();
      }
    });
    this.scheduleBackgroundVideo();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleGlobalSearchShortcut);
    this.backgroundVideoCancel?.();
    this.removePerformanceSignalListeners?.();
  },
});
</script>

<style src="./styles/tokens.css"></style>
<style src="./styles/base.css"></style>
<style>
.background {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.background-poster,
.background-video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-poster {
  opacity: var(--video-opacity);
  transition: opacity 0.35s ease;
}

.background-video {
  opacity: 0;
  transition: opacity 0.35s ease;
}

.background--video-ready .background-poster {
  opacity: 0;
}

.background--video-ready .background-video {
  opacity: var(--video-opacity);
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1 0 auto;
  padding: 170px 0 20px;
}

.app-main.app-main--compact {
  padding-top: 94px;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.32s ease,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Lite mode favors immediate navigation over decorative route motion. */
:root[data-performance-mode="lite"] .page-fade-enter-active,
:root[data-performance-mode="lite"] .page-fade-leave-active {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none;
  }

  .page-fade-enter-from,
  .page-fade-leave-to {
    transform: none;
  }
}

@media (max-width: 768px) {
  .app-main {
    padding-top: 140px;
  }

  .app-main.app-main--compact {
    padding-top: 78px;
  }
}
</style>
