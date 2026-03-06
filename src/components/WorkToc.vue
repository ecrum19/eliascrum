<template>
  <aside
    class="work-toc-shell"
    :class="{ 'work-toc-shell-collapsed': collapsed }"
    :style="{ '--toc-top-offset': `${topOffset}px` }"
  >
    <button
      type="button"
      class="work-toc-toggle"
      @click="toggleCollapsed"
      :aria-expanded="!collapsed"
      :aria-label="collapsed ? `Open ${title}` : `Hide ${title}`"
    >
      <span class="work-toc-toggle-main">
        <i class="fa fa-list-ul" aria-hidden="true"></i>
        <span class="work-toc-toggle-label">{{ title }}</span>
      </span>
      <span class="work-toc-toggle-state">{{ collapsed ? "Open" : "Hide" }}</span>
    </button>

    <nav
      class="work-toc-nav"
      :class="{ 'work-toc-nav-hidden': collapsed }"
      :aria-hidden="collapsed"
      :aria-label="`${title} navigation`"
    >
      <button
        v-for="(entry, index) in entries"
        :key="entry.id"
        type="button"
        class="work-toc-link"
        :class="{ 'work-toc-link-active': activeId === entry.id }"
        @click="scrollToEntry(entry.id)"
      >
        <span class="work-toc-link-index">{{ index + 1 }}.</span>
        <span class="work-toc-link-label">{{ entry.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export interface TocEntry {
  id: string;
  label: string;
}

export default defineComponent({
  name: "WorkToc",
  props: {
    entries: {
      type: Array as PropType<TocEntry[]>,
      required: true,
    },
    title: {
      type: String,
      default: "Contents",
    },
    topOffset: {
      type: Number,
      default: 86,
    },
    mobileBreakpoint: {
      type: Number,
      default: 1080,
    },
  },
  data() {
    return {
      collapsed: false,
      activeId: "",
    };
  },
  watch: {
    entries: {
      handler() {
        if (this.entries.length === 0) {
          this.activeId = "";
          return;
        }
        if (!this.entries.some((entry) => entry.id === this.activeId)) {
          this.activeId = this.entries[0].id;
        }
        this.$nextTick(() => this.syncActiveEntry());
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.collapsed = window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches;
    this.syncActiveEntry();
    window.addEventListener("scroll", this.syncActiveEntry, { passive: true });
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.syncActiveEntry);
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize() {
      if (window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches) {
        this.collapsed = true;
      }
      this.syncActiveEntry();
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    scrollToEntry(entryId: string) {
      const target = document.getElementById(entryId);
      if (!target) {
        return;
      }

      const targetTop = target.getBoundingClientRect().top + window.scrollY - this.topOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      this.activeId = entryId;

      if (window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches) {
        this.collapsed = true;
      }
    },
    syncActiveEntry() {
      if (!this.entries.length) {
        return;
      }

      const checkpoint = window.scrollY + window.innerHeight * 0.28;
      let current = this.entries[0].id;

      this.entries.forEach((entry) => {
        const element = document.getElementById(entry.id);
        if (!element) {
          return;
        }
        if (element.offsetTop <= checkpoint) {
          current = entry.id;
        }
      });

      this.activeId = current;
    },
  },
});
</script>

<style scoped>
.work-toc-shell {
  --toc-open-width: 228px;
  --toc-collapsed-width: 62px;

  position: sticky;
  top: var(--toc-top-offset);
  align-self: start;
  width: var(--toc-open-width);
  max-height: calc(100vh - (var(--toc-top-offset) + 16px));
  overflow: auto;
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 10px;
  display: grid;
  gap: 8px;
  z-index: 8;
  transition:
    width 0.28s cubic-bezier(0.22, 0.61, 0.36, 1),
    padding 0.22s ease,
    border-radius 0.22s ease;
}

.work-toc-shell-collapsed {
  width: var(--toc-collapsed-width);
  padding: 6px;
  border-radius: 12px;
}

.work-toc-toggle {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font: inherit;
  transition: background-color 0.16s ease, border-color 0.16s ease, opacity 0.2s ease;
}

.work-toc-toggle-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.work-toc-toggle-main .fa {
  font-size: var(--font-size-body);
  opacity: 0.82;
}

.work-toc-toggle-label {
  font-size: var(--font-size-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.9;
  font-weight: 600;
}

.work-toc-toggle-state {
  font-size: var(--font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}

.work-toc-toggle:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(80, 203, 255, 0.42);
}

.work-toc-shell-collapsed .work-toc-toggle {
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 40px;
  border-radius: 12px;
  padding: 0;
}

.work-toc-shell-collapsed .work-toc-toggle-state,
.work-toc-shell-collapsed .work-toc-toggle-label {
  display: none;
}

.work-toc-shell-collapsed .work-toc-toggle-main {
  justify-content: center;
  width: 100%;
  gap: 0;
}

.work-toc-shell-collapsed .work-toc-toggle-main .fa {
  font-size: calc(var(--font-size-body) + 2px);
}

.work-toc-nav {
  display: grid;
  gap: 8px;
  overflow: hidden;
  max-height: 2000px;
  opacity: 1;
  transform: translateY(0);
  transition: max-height 0.24s ease, opacity 0.18s ease, transform 0.24s ease;
}

.work-toc-nav-hidden {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
  pointer-events: none;
}

.work-toc-link {
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
  background: transparent;
  color: var(--page-text);
  text-align: left;
  padding: 8px 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 8px;
  font: inherit;
  cursor: pointer;
  min-width: 0;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}

.work-toc-link:hover {
  background: var(--nav-hover-bg);
}

.work-toc-link-active {
  border-color: rgba(80, 203, 255, 0.56);
  background: rgba(80, 203, 255, 0.12);
}

.work-toc-link-index {
  font-size: var(--font-size-micro);
  opacity: 0.75;
  letter-spacing: 0.06em;
}

.work-toc-link-label {
  font-size: var(--font-size-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1080px) {
  .work-toc-shell,
  .work-toc-shell-collapsed {
    width: 100%;
    top: 82px;
    padding: 10px;
    border-radius: 14px;
  }

  .work-toc-shell-collapsed .work-toc-toggle {
    justify-content: space-between;
    align-items: baseline;
    padding: 8px 12px;
    min-height: auto;
    border-radius: 999px;
  }

  .work-toc-shell-collapsed .work-toc-toggle-state,
  .work-toc-shell-collapsed .work-toc-toggle-label {
    display: inline;
  }

  .work-toc-shell-collapsed .work-toc-toggle-main {
    justify-content: flex-start;
    width: auto;
    gap: 8px;
  }
}
</style>
