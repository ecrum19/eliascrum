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
      <router-link
        to="/about"
        class="nav-link w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
      >
        <i class="fa fa-user"></i> ABOUT
      </router-link>
      <router-link
        to="/publications"
        class="nav-link w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
      >
        <i class="fa fa-file-text-o"></i> PUBLICATIONS
      </router-link>
      <router-link
        to="/software"
        class="nav-link w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
      >
        <i class="fa fa-code"></i> SOFTWARE
      </router-link>
      <router-link
        to="/talks"
        class="nav-link w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
      >
        <i class="fa fa-slideshare"></i> TALKS
      </router-link>
      <router-link
        to="/blogs"
        class="nav-link w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
      >
        <i class="fa fa-pencil"></i> BLOGS
      </router-link>
      <div class="desktop-right-controls w3-hide-small">
        <button
          type="button"
          class="w3-bar-item w3-button w3-hover-opacity-off search-trigger"
          aria-label="Open search"
          title="Search (Ctrl/Cmd+K)"
          @click="openSearch"
        >
          <i class="fa fa-search"></i>
        </button>
        <button
          type="button"
          class="w3-bar-item w3-button w3-hover-opacity-off text-size-toggle"
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
          class="w3-bar-item w3-button w3-hover-opacity-off theme-toggle"
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
      <router-link
        to="/blogs"
        class="w3-bar-item w3-button"
        @click="closeMenu"
        >BLOGS</router-link
      >
      <button
        type="button"
        class="w3-bar-item w3-button theme-toggle-mobile"
        @click="openSearch"
      >
        SEARCH
      </button>
      <button
        type="button"
        class="w3-bar-item w3-button theme-toggle-mobile"
        @click="toggleTextScale"
      >
        TEXT SIZE: {{ textScaleDisplayLabel.toUpperCase() }}
      </button>
      <button
        type="button"
        class="w3-bar-item w3-button theme-toggle-mobile"
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
      <img src="./assets/headshot.jpeg" alt="personal picture" />
      <h1>Elias D. Crum</h1>
    </header>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

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
  },
  emits: ["toggle-theme", "toggle-text-scale", "open-search"],
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
    showIdentityHeader(): boolean {
      return this.$route.path === "/about" || this.$route.path === "/";
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
}

#myNavbar .desktop-right-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
}

#myNavbar :is(a, button) {
  min-height: 44px;
  font-size: var(--font-size-body);
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
  font-family: var(--content-heading-font);
  color: var(--page-text);
  font-size: var(--site-title-size);
  font-weight: 400;
  margin: 0;
}

img {
  width: 75px; /* Adjust size as needed */
  height: 100px; /* Maintain aspect ratio */
  border-radius: 50%; /* Make the image round */
  border: 2px solid var(--surface-outline); /* Add a subtle border */
  margin-right: 20px;
}

.theme-toggle,
.theme-toggle-mobile,
.search-trigger,
.text-size-toggle {
  border: none;
  background: var(--toggle-bg);
  color: var(--toggle-text);
  cursor: pointer;
}

.text-size-toggle {
  min-width: 42px;
  padding-left: 10px !important;
  padding-right: 10px !important;
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
.text-size-toggle:hover {
  background: var(--nav-hover-bg) !important;
}

[data-theme="light"] .theme-toggle,
[data-theme="light"] .theme-toggle-mobile,
[data-theme="light"] .search-trigger,
[data-theme="light"] .text-size-toggle {
  background: transparent;
}

[data-theme="light"] .theme-toggle:hover,
[data-theme="light"] .theme-toggle-mobile:hover,
[data-theme="light"] .search-trigger:hover,
[data-theme="light"] .text-size-toggle:hover {
  background: rgba(16, 36, 59, 0.08) !important;
}

@media (max-width: 768px) {
  header h1 {
    font-size: clamp(1.8rem, 8vw, 2.6rem);
  }

  img {
    width: 60px;
    height: 80px;
  }
}
</style>
