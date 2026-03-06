<template>
  <div class="app-shell">
    <the-header :theme="theme" @toggle-theme="toggleTheme" @open-search="openSearch" />
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
    <main class="app-main">
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
const THEME_STORAGE_KEY = "site-theme";

export default defineComponent({
  name: "App",
  components: {
    TheHeader,
    TheFooter,
    SpotlightSearch,
  },
  data(): { theme: ThemeMode; isSearchOpen: boolean } {
    return {
      theme: "dark",
      isSearchOpen: false,
    };
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
    this.applyTheme(this.theme);
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
  --content-heading-font: "KoHo", sans-serif;
  --content-h1-size: clamp(1.8rem, 2.8vw, 2.5rem);
  --content-h2-size: clamp(1.25rem, 2.1vw, 1.55rem);
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
  font-family: "KoHo", sans-serif;
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

html {
  font-size: 17px;
}

body {
  background: var(--page-background);
  color: var(--page-text);
  transition: background-color 0.25s ease, color 0.25s ease;
  overflow-y: scroll;
  line-height: 1.45;
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

@media (max-width: 768px) {
  .app-main {
    padding-top: 140px;
  }
}
</style>
