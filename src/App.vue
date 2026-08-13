<template>
  <div class="app-shell">
    <the-header
      :theme="theme"
      :text-scale-mode="textScaleMode"
      @toggle-theme="toggleTheme"
      @toggle-text-scale="toggleTextScale"
      @open-search="openSearch"
    />
    <spotlight-search
      v-if="isSearchOpen"
      :open="isSearchOpen"
      @close="closeSearch"
    />
    <div class="background">
      <video
        id="background-video"
        src="./assets/Abstract DNA Medical Animation.mp4"
        muted
        loop
        autoplay
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
import { resolvePublicAssetPath } from "./utils/publicAssetPath";

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
    SpotlightSearch,
  },
  data(): { theme: ThemeMode; textScaleMode: TextScaleMode; isSearchOpen: boolean } {
    return {
      theme: "dark",
      textScaleMode: "normal",
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
      this.updateSiteIcons(theme);
    },
    updateSiteIcons(theme: ThemeMode) {
      const iconHref = resolvePublicAssetPath(
        theme === "dark"
          ? "/branding/favicon.svg"
          : "/branding/favicon.svg"
      );

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
  },
  mounted() {

    const video = document.querySelector<HTMLVideoElement>('#background-video');
    if (video) {
      video.playbackRate = 0.45;
    }

    window.addEventListener("keydown", this.handleGlobalSearchShortcut);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleGlobalSearchShortcut);
  },
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=KoHo:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");

:root {
  --font-family-base: "KoHo", sans-serif;
  --font-family-heading: "KoHo", sans-serif;
  --font-family-display: "Cinzel", serif;
  --font-size-root: 17px;
  --text-scale-body: 1;
  --text-scale-small: 1;
  --text-scale-heading: 1;
  --font-size-micro: calc(0.72rem * var(--text-scale-small));
  --font-size-caption: calc(0.78rem * var(--text-scale-small));
  --font-size-label: calc(0.84rem * var(--text-scale-small));
  --font-size-meta: calc(0.9rem * var(--text-scale-small));
  --font-size-body-sm: calc(0.98rem * var(--text-scale-body));
  --font-size-body: calc(1.03rem * var(--text-scale-body));
  --font-size-body-lg: calc(1.1rem * var(--text-scale-body));
  --font-size-body-xl: calc(1.16rem * var(--text-scale-body));
  --font-size-subtitle: calc(1.24rem * var(--text-scale-heading));
  --font-size-section-title: calc(1.34rem * var(--text-scale-heading));
  --font-size-card-title: calc(1.44rem * var(--text-scale-heading));
  --font-size-prose-xl: calc(1.72rem * var(--text-scale-body));
  --font-size-prose-l: calc(1.42rem * var(--text-scale-body));
  --list-date-size: var(--font-size-meta);
  --list-title-size: calc(clamp(1.4rem, 2.25vw, 1.72rem) * var(--text-scale-heading));
  --list-tag-size: var(--font-size-meta);
  --list-summary-size: var(--font-size-body-sm);
  --page-background: #000000;
  --page-text: #f7f9fc;
  --text-muted: #e7edf5;
  --text-soft: #cfd8e4;
  --surface-bg: rgba(11, 11, 12, 0.9);
  --surface-elevated: rgba(18, 18, 20, 0.94);
  --surface-card: rgba(255, 255, 255, 0.065);
  --surface-outline: rgba(255, 255, 255, 0.22);
  --header-bg: rgba(9, 9, 10, 0.86);
  --footer-bg: rgba(8, 8, 9, 0.72);
  --link-color: #bf5e5e;
  --nav-hover-bg: rgba(255, 255, 255, 0.09);
  --toggle-bg: rgba(255, 255, 255, 0.065);
  --toggle-border: rgba(255, 255, 255, 0.28);
  --toggle-text: #ffffff;
  --video-opacity: 0.4;
  --content-heading-font: var(--font-family-heading);
  --content-h1-size: calc(clamp(1.8rem, 2.8vw, 2.5rem) * var(--text-scale-heading));
  --content-h2-size: calc(clamp(1.25rem, 2.1vw, 1.55rem) * var(--text-scale-heading));
  --site-title-size: calc(clamp(2.35rem, 5.4vw, 3.8rem) * var(--text-scale-heading));
  --accent-rgb: 80, 203, 255;
  --accent-secondary-rgb: 45, 212, 191;
  --accent-ink-rgb: 80, 203, 255;
  --accent-ink: #50cbff;
}

:root[data-theme="light"] {
  --page-background: #f6f3ed;
  --page-text: #10243b;
  --text-muted: rgba(16, 36, 59, 0.88);
  --text-soft: rgba(16, 36, 59, 0.74);
  --surface-bg: rgba(253, 251, 247, 0.94);
  --surface-elevated: rgba(253, 251, 247, 0.94);
  --surface-card: rgba(255, 255, 255, 0.52);
  --surface-outline: rgba(84, 66, 38, 0.22);
  --header-bg: rgba(250, 247, 241, 0.9);
  --footer-bg: rgba(244, 238, 229, 0.82);
  --accent-rgb: 226, 214, 196;
  --accent-secondary-rgb: 246, 240, 231;
  --accent-ink-rgb: 13, 79, 136;
  --accent-ink: #0d4f88;
  --link-color: #8f6b1f;
  --nav-hover-bg: rgba(var(--accent-rgb), 0.18);
  --toggle-bg: rgba(var(--accent-rgb), 0.12);
  --toggle-border: rgba(var(--accent-rgb), 0.34);
  --toggle-text: #10243b;
  --video-opacity: 0.16;
}

* {
  font-family: var(--font-family-base);
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

html {
  font-size: var(--font-size-root);
}

body {
  background: var(--page-background);
  color: var(--page-text);
  font-size: var(--font-size-body);
  transition: background-color 0.25s ease, color 0.25s ease;
  overflow-y: scroll;
  line-height: 1.48;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-family-heading);
  line-height: 1.2;
}

a {
  color: var(--link-color);
}

.btn-detail,
.btn-pdf,
.btn-back,
.btn-external {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: var(--font-size-body) !important;
  font-weight: 600;
  line-height: 1.2;
  min-width: 0;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.16s ease, box-shadow 0.2s ease;
}

.btn-detail {
  border-radius: 10px !important;
  border: 1px solid rgba(216, 116, 116, 0.66) !important;
  background: rgba(191, 94, 94, 0.14) !important;
  box-shadow: 0 0 0 1px rgba(191, 94, 94, 0.18), 0 4px 12px rgba(8, 15, 31, 0.14);
}

.btn-detail:hover {
  border-color: rgba(216, 116, 116, 0.82) !important;
  background: rgba(191, 94, 94, 0.2) !important;
  box-shadow: 0 0 0 1px rgba(216, 116, 116, 0.24), 0 8px 18px rgba(8, 15, 31, 0.2);
  transform: translateY(-1px);
}

.btn-detail:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(216, 116, 116, 0.42), 0 6px 16px rgba(8, 15, 31, 0.2) !important;
}

.btn-external {
  border-radius: 999px !important;
  border: 1px solid var(--surface-outline) !important;
  background: transparent !important;
  box-shadow: none !important;
}

.btn-external:hover {
  border-color: rgba(196, 181, 253, 0.86) !important;
  background: rgba(167, 139, 250, 0.16) !important;
  box-shadow: 0 4px 12px rgba(8, 15, 31, 0.12);
  transform: translateY(-1px);
}

.btn-external:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.34), 0 6px 16px rgba(8, 15, 31, 0.16) !important;
}

.btn-pdf {
  border-radius: 999px !important;
  border: 1px solid var(--surface-outline) !important;
  background: transparent !important;
  box-shadow: none !important;
}

.btn-pdf:hover {
  background: var(--nav-hover-bg) !important;
  border-color: rgba(var(--accent-rgb), 0.45) !important;
  transform: translateY(-1px);
}

.btn-pdf:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24) !important;
}

.btn-back {
  border-radius: 10px !important;
  border: 1px solid rgba(56, 189, 248, 0.55) !important;
  background: rgba(56, 189, 248, 0.13) !important;
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.14), 0 4px 12px rgba(8, 15, 31, 0.12);
}

.btn-back:hover {
  border-color: rgba(56, 189, 248, 0.78) !important;
  background: rgba(56, 189, 248, 0.2) !important;
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.24), 0 8px 18px rgba(8, 15, 31, 0.18);
  transform: translateY(-1px);
}

.btn-back:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.36), 0 6px 16px rgba(8, 15, 31, 0.18) !important;
}

:root[data-theme="light"] .btn-detail {
  border-color: rgba(143, 107, 31, 0.62) !important;
  background: rgba(143, 107, 31, 0.14) !important;
  box-shadow: 0 0 0 1px rgba(143, 107, 31, 0.14), 0 3px 10px rgba(84, 66, 38, 0.1);
}

:root[data-theme="light"] .btn-detail:hover {
  border-color: rgba(143, 107, 31, 0.8) !important;
  background: rgba(143, 107, 31, 0.2) !important;
}

:root[data-theme="light"] .btn-back {
  border-color: rgba(13, 79, 136, 0.48) !important;
  background: rgba(13, 79, 136, 0.12) !important;
  box-shadow: 0 0 0 1px rgba(13, 79, 136, 0.12), 0 3px 10px rgba(84, 66, 38, 0.1);
}

:root[data-theme="light"] .btn-back:hover {
  border-color: rgba(13, 79, 136, 0.68) !important;
  background: rgba(13, 79, 136, 0.2) !important;
}

:root[data-theme="light"] .btn-external {
  border-color: var(--surface-outline) !important;
}

:root[data-theme="light"] .btn-external:hover {
  border-color: rgba(126, 34, 206, 0.64) !important;
  background: rgba(126, 34, 206, 0.1) !important;
}

.w3-hover-black:hover {
  background-color: var(--nav-hover-bg) !important;
  color: var(--page-text) !important;
}

.background {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.background video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: var(--video-opacity);
  transition: opacity 0.25s ease;
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
