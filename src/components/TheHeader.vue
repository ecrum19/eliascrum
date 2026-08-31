<template>
  <div class="w3-top" id="headerBar">

    <!-- Navbar -->
    <div class="w3-bar" id="myNavbar">
      <button
        id="dropdown"
        class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right"
        type="button"
        @click="toggleMenu"
        title="Toggle Navigation Menu"
      >
        <i class="fa fa-bars"></i>
      </button>
      <button
        class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right"
        type="button"
        @click="openSearch"
        aria-label="Open search"
      >
        <i class="fa fa-search"></i>
      </button>
      <div class="desktop-nav-links w3-hide-small">
        <router-link
          to="/about"
          class="nav-link w3-bar-item w3-button w3-hover-black w3-opacity w3-hover-opacity-off"
        >
          <i class="fa fa-user"></i> ABOUT
        </router-link>
        <router-link
          to="/publications"
          class="nav-link w3-bar-item w3-button w3-hover-black w3-opacity w3-hover-opacity-off"
        >
          <i class="fa fa-file-text-o"></i> PUBLICATIONS
        </router-link>
        <router-link
          to="/software"
          class="nav-link w3-bar-item w3-button w3-hover-black w3-opacity w3-hover-opacity-off"
        >
          <i class="fa fa-code"></i> SOFTWARE
        </router-link>
        <router-link
          to="/talks"
          class="nav-link w3-bar-item w3-button w3-hover-black w3-opacity w3-hover-opacity-off"
        >
          <i class="fa fa-slideshare"></i> TALKS
        </router-link>
      </div>
      <router-link
        v-if="showCompactBrand"
        to="/about"
        class="header-brand w3-bar-item w3-button w3-hover-opacity-off"
        aria-label="Go to home page"
        title="Home"
      >
        <img class="header-logo" :src="headerLogoSrc" alt="EDC logo" />
      </router-link>
      <div class="desktop-right-controls w3-hide-small">
        <button
          type="button"
          class="w3-bar-item w3-button w3-hover-black w3-hover-opacity-off search-trigger"
          aria-label="Open search"
          title="Search (Ctrl/Cmd+K)"
          @click="openSearch"
        >
          <i class="fa fa-search"></i>
        </button>
        <button
          type="button"
          class="w3-bar-item w3-button w3-hover-black w3-hover-opacity-off performance-toggle"
          @click="togglePerformanceMode"
          :aria-label="performanceModeLabel"
          :title="performanceModeLabel"
        >
          <i class="fa fa-tachometer" aria-hidden="true"></i>
          <span class="performance-toggle-label">{{ performanceMode.toUpperCase() }}</span>
        </button>
        <button
          type="button"
          class="w3-bar-item w3-button w3-hover-black w3-hover-opacity-off text-size-toggle"
          @click="toggleTextScale"
          :aria-label="`Text size: ${textScaleDisplayLabel}. Click to change text size`"
          :title="`Text size: ${textScaleDisplayLabel}`"
        >
          <span class="text-size-icon" aria-hidden="true">
            <span class="text-size-icon-large">A</span>
            <span class="text-size-icon-small">A</span>
          </span>
        </button>
        <button
          type="button"
          class="w3-bar-item w3-button w3-hover-black w3-hover-opacity-off theme-toggle"
          @click="toggleTheme"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <i class="fa" :class="theme === 'dark' ? 'fa-sun-o' : 'fa-moon-o'"></i>
          {{ theme === "dark" ? " LIGHT" : " DARK" }}
        </button>
        <router-link
          to="/about"
          class="nav-link w3-bar-item w3-button w3-hover-black w3-opacity w3-hover-opacity-off"
        >
          <i class="fa fa-home"></i>
        </router-link>
      </div>
    </div>

    <!-- Navbar on small screens -->
    <div
      id="navDemo"
      class="w3-bar-block w3-black w3-hide-large w3-hide-medium mobile-nav"
      :class="{ 'w3-show': mobileMenuOpen }"
    >
      <router-link to="/about" class="w3-bar-item w3-button" @click="closeMenu"
        >ABOUT</router-link
      >
      <router-link to="/publications" class="w3-bar-item w3-button" @click="closeMenu"
        >PUBLICATIONS</router-link
      >
      <router-link to="/software" class="w3-bar-item w3-button" @click="closeMenu"
        >SOFTWARE</router-link
      >
      <router-link to="/talks" class="w3-bar-item w3-button" @click="closeMenu"
        >TALKS</router-link
      >
      <button
        type="button"
        class="w3-bar-item w3-button w3-hover-black theme-toggle-mobile"
        @click="openSearch"
      >
        SEARCH
      </button>
      <button
        type="button"
        class="w3-bar-item w3-button w3-hover-black theme-toggle-mobile"
        @click="toggleTextScale"
      >
        TEXT SIZE: {{ textScaleDisplayLabel.toUpperCase() }}
      </button>
      <button
        type="button"
        class="w3-bar-item w3-button w3-hover-black theme-toggle-mobile"
        @click="togglePerformanceMode"
      >
        PERFORMANCE: {{ performanceMode.toUpperCase() }}
      </button>
      <button
        type="button"
        class="w3-bar-item w3-button w3-hover-black theme-toggle-mobile"
        @click="toggleTheme"
      >
        {{ theme === "dark" ? "LIGHT MODE" : "DARK MODE" }}
      </button>
      <router-link to="/about" class="w3-bar-item w3-button" @click="closeMenu"
        >HOME</router-link
      >
    </div>

  <!-- Name and Picture header -->
  <div v-if="showIdentityHeader">
    <header>
      <img class="identity-photo" src="./assets/headshot.jpeg" alt="personal picture" />
      <h1>Elias D. Crum</h1>
    </header>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import type { EffectivePerformanceMode, PerformanceMode } from "../utils/performanceMode";

type ThemeMode = "dark" | "light";
type TextScaleMode = "small" | "normal" | "large";

export default defineComponent({
  props: {
    theme: {
      type: String as PropType<ThemeMode>,
      default: "dark",
    },
    textScaleMode: {
      type: String as PropType<TextScaleMode>,
      default: "normal",
    },
    performanceMode: {
      type: String as PropType<PerformanceMode>,
      default: "auto",
    },
    effectivePerformanceMode: {
      type: String as PropType<EffectivePerformanceMode>,
      default: "standard",
    },
  },
  emits: ["toggle-theme", "toggle-text-scale", "toggle-performance-mode", "open-search"],
  data() {
    return {
      mobileMenuOpen: false,
    };
  },
  computed: {
    textScaleDisplayLabel(): string {
      if (this.textScaleMode === "small") {
        return "Small";
      }
      if (this.textScaleMode === "large") {
        return "Large";
      }
      return "Normal";
    },
    performanceModeLabel(): string {
      const activeMode = this.effectivePerformanceMode === "lite" ? "Lite" : "Standard";
      return `Performance: ${this.performanceMode} (${activeMode} active). Click to change.`;
    },
    showIdentityHeader(): boolean {
      return this.$route.path === "/about" || this.$route.path === "/";
    },
    showCompactBrand(): boolean {
      return !this.showIdentityHeader;
    },
    headerLogoSrc(): string {
      return resolvePublicAssetPath(
        this.theme === "dark"
          ? "/branding/edc-logo-inverse.svg"
          : "/branding/edc-logo.svg",
      );
    },
  },
  watch: {
    $route() {
      this.mobileMenuOpen = false;
    },
  },
  methods: {
    toggleMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMenu() {
      this.mobileMenuOpen = false;
    },
    toggleTheme() {
      this.$emit("toggle-theme");
    },
    toggleTextScale() {
      this.$emit("toggle-text-scale");
    },
    togglePerformanceMode() {
      this.$emit("toggle-performance-mode");
    },
    openSearch() {
      this.closeMenu();
      this.$emit("open-search");
    },
  },
});
</script>

<style scoped>
header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 6px;
}

#headerBar {
  background: var(--header-bg);
  color: var(--page-text);
  width: 100%;
  backdrop-filter: blur(6px);
  z-index: 1200;
  position: fixed;
  top: 0;
  left: 0;
}

#myNavbar a,
#dropdown {
  color: var(--page-text);
}

#myNavbar {
  display: flex;
  align-items: center;
  position: relative;
  min-height: 52px;
}

.desktop-nav-links {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header-brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px !important;
  margin: 0;
  opacity: 1 !important;
  background: transparent !important;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  max-width: min(20vw, 240px);
}

.header-logo {
  display: block;
  width: auto;
  height: clamp(26px, 2.1vw, 34px);
  max-width: 100%;
  margin: 0;
  border: none;
  border-radius: 0;
}

#myNavbar .desktop-right-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
}

#myNavbar :is(a, button) {
  min-height: 38px;
  font-size: var(--font-size-body-sm);
}

#navDemo {
  background: var(--header-bg) !important;
}

#navDemo a,
#navDemo button {
  color: var(--page-text);
}

.mobile-nav {
  display: none;
}

.mobile-nav.w3-show {
  display: block;
}

.nav-link {
  text-decoration: none;
  transition: background-color 0.18s ease, opacity 0.18s ease;
}

.nav-link.router-link-active {
  opacity: 1 !important;
  background: var(--nav-hover-bg);
}

header h1 {
  font-family: var(--font-family-display);
  color: var(--page-text);
  font-size: var(--site-title-size);
  font-weight: 500;
  letter-spacing: 0.03em;
  margin: 0;
}

.identity-photo {
  width: 75px; /* Adjust size as needed */
  height: 100px; /* Maintain aspect ratio */
  border-radius: 50%; /* Make the image round */
  border: 2px solid var(--surface-outline); /* Add a subtle border */
  margin-right: 20px;
}

.theme-toggle,
.theme-toggle-mobile,
.search-trigger,
.text-size-toggle,
.performance-toggle {
  border: none;
  background: transparent !important;
  color: var(--page-text);
  cursor: pointer;
  opacity: 0.68;
  transition: background-color 0.18s ease, color 0.18s ease, opacity 0.18s ease;
}

.text-size-toggle {
  min-width: 42px;
  padding-left: 10px !important;
  padding-right: 10px !important;
}

.performance-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-left: 10px !important;
  padding-right: 10px !important;
  font-size: var(--font-size-label) !important;
}

.performance-toggle-label {
  font-size: 0.78em;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.text-size-icon {
  display: inline-flex;
  align-items: flex-end;
  gap: 1px;
  line-height: 1;
  font-family: var(--font-family-heading);
  font-weight: 700;
}

.text-size-icon-large {
  font-size: 1.14em;
}

.text-size-icon-small {
  font-size: 0.72em;
  transform: translateY(-1px);
  opacity: 0.92;
}

.theme-toggle:hover,
.theme-toggle-mobile:hover,
.search-trigger:hover,
.text-size-toggle:hover,
.performance-toggle:hover {
  background-color: var(--nav-hover-bg) !important;
  color: var(--page-text);
  opacity: 1;
}

.theme-toggle:focus-visible,
.theme-toggle-mobile:focus-visible,
.search-trigger:focus-visible,
.text-size-toggle:focus-visible,
.performance-toggle:focus-visible {
  background-color: var(--nav-hover-bg) !important;
  color: var(--page-text);
  opacity: 1;
  outline: 2px solid var(--link-color);
  outline-offset: -2px;
}

@media (max-width: 1220px) {
  .header-brand {
    max-width: min(12vw, 130px);
  }

  .header-logo {
    height: 26px;
  }

  .performance-toggle-label {
    display: none;
  }
}

@media (max-width: 980px) {
  .header-brand {
    display: none;
  }
}

@media (max-width: 768px) {
  #myNavbar {
    min-height: 50px;
  }

  header h1 {
    font-size: clamp(1.8rem, 8vw, 2.6rem);
  }

  .identity-photo {
    width: 60px;
    height: 80px;
  }
}
</style>
