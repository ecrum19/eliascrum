<template>
  <div class="app-shell">
    <the-header
      :theme="theme"
      :text-scale-mode="textScaleMode"
      @toggle-theme="toggleTheme"
      @toggle-text-scale="toggleTextScale"
      @open-search="openSearch"
    />
    <spotlight-search :open="isSearchOpen" @close="closeSearch" />
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
      <router-view></router-view>
    </main>
    <the-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import SpotlightSearch from "./components/SpotlightSearch.vue";

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
@import url("https://fonts.googleapis.com/css2?family=KoHo:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");

:root {
  --font-family-base: "KoHo", sans-serif;
  --font-family-heading: "KoHo", sans-serif;
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
  --page-background: #000000;
  --page-text: #ffffff;
  --surface-bg: rgba(0, 0, 0, 0.8);
  --surface-outline: rgba(255, 255, 255, 0.8);
  --header-bg: rgba(0, 0, 0, 0.7);
  --footer-bg: rgba(0, 0, 0, 0.2);
  --link-color: #eaf4ff;
  --nav-hover-bg: rgba(255, 255, 255, 0.15);
  --toggle-bg: rgba(255, 255, 255, 0.08);
  --toggle-border: rgba(255, 255, 255, 0.45);
  --toggle-text: #ffffff;
  --video-opacity: 0.4;
  --content-heading-font: var(--font-family-heading);
  --content-h1-size: calc(clamp(1.8rem, 2.8vw, 2.5rem) * var(--text-scale-heading));
  --content-h2-size: calc(clamp(1.25rem, 2.1vw, 1.55rem) * var(--text-scale-heading));
  --site-title-size: calc(clamp(2.35rem, 5.4vw, 3.8rem) * var(--text-scale-heading));
}

:root[data-theme="light"] {
  --page-background: #e9eff7;
  --page-text: #10243b;
  --surface-bg: rgba(246, 250, 255, 0.9);
  --surface-outline: rgba(16, 36, 59, 0.28);
  --header-bg: rgba(243, 248, 255, 0.85);
  --footer-bg: rgba(230, 239, 250, 0.75);
  --link-color: #0d4f88;
  --nav-hover-bg: rgba(16, 36, 59, 0.12);
  --toggle-bg: rgba(16, 36, 59, 0.08);
  --toggle-border: rgba(16, 36, 59, 0.28);
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

@media (max-width: 768px) {
  .app-main {
    padding-top: 140px;
  }

  .app-main.app-main--compact {
    padding-top: 78px;
  }
}
</style>
