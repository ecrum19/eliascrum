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
      ref="navElement"
      class="work-toc-nav"
      :class="{ 'work-toc-nav-hidden': collapsed }"
      :aria-hidden="collapsed"
      :aria-label="`${title} navigation`"
    >
      <a
        v-for="entry in normalizedEntries"
        :key="entry.id"
        :href="entryHref(entry.id)"
        class="work-toc-link"
        :class="[
          `work-toc-link-level-${Math.min(entry.level, 3)}`,
          {
            'work-toc-link-active': activeId === entry.id,
            'work-toc-link-parent-active': activeTrailIds.includes(entry.id) && activeId !== entry.id,
          },
        ]"
        :data-entry-id="entry.id"
        :aria-current="activeId === entry.id ? 'location' : undefined"
        @click="handleEntryClick($event, entry.id)"
      >
        <span v-if="entry.level === 1" class="work-toc-link-index">{{ entry.topLevelIndex }}.</span>
        <span v-else class="work-toc-link-marker" aria-hidden="true"></span>
        <span class="work-toc-link-label">{{ entry.label }}</span>
      </a>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export interface TocEntry {
  id: string;
  label: string;
  level?: number;
}

interface NormalizedTocEntry extends TocEntry {
  level: number;
  topLevelIndex: number | null;
  ancestorIds: string[];
}

type ScrollMode = "auto" | "smooth";

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
      syncFrame: null as number | null,
    };
  },
  computed: {
    normalizedEntries(): NormalizedTocEntry[] {
      let topLevelIndex = 0;
      const lineage: string[] = [];

      return this.entries.map((entry) => {
        const rawLevel = Number(entry.level ?? 1);
        const requestedLevel = Number.isFinite(rawLevel) ? Math.max(1, Math.floor(rawLevel)) : 1;
        const level = Math.min(requestedLevel, lineage.length + 1);

        lineage.length = level - 1;
        const ancestorIds = lineage.slice(0, level - 1);

        const normalizedEntry: NormalizedTocEntry = {
          ...entry,
          level,
          topLevelIndex: level === 1 ? ++topLevelIndex : null,
          ancestorIds,
        };

        lineage[level - 1] = entry.id;
        return normalizedEntry;
      });
    },
    activeTrailIds(): string[] {
      const activeEntry = this.normalizedEntries.find((entry) => entry.id === this.activeId);
      if (!activeEntry) {
        return [];
      }
      return [...activeEntry.ancestorIds, activeEntry.id];
    },
  },
  watch: {
    activeId() {
      this.$nextTick(() => this.scrollActiveLinkIntoView("auto"));
    },
    entries: {
      handler() {
        if (this.entries.length === 0) {
          this.activeId = "";
          return;
        }
        if (!this.normalizedEntries.some((entry) => entry.id === this.activeId)) {
          this.activeId = this.normalizedEntries[0]?.id ?? "";
        }
        this.$nextTick(() => {
          if (!this.syncFromHash({ scroll: false })) {
            this.syncActiveEntry();
          }
        });
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.collapsed = window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches;
    this.$nextTick(() => {
      if (!this.syncFromHash({ scroll: false })) {
        this.syncActiveEntry();
      }
    });
    window.addEventListener("scroll", this.handleWindowScroll, { passive: true });
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("hashchange", this.handleHashChange);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleWindowScroll);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("hashchange", this.handleHashChange);
    if (this.syncFrame !== null) {
      window.cancelAnimationFrame(this.syncFrame);
      this.syncFrame = null;
    }
  },
  methods: {
    entryHref(entryId: string): string {
      return `#${encodeURIComponent(entryId)}`;
    },
    currentHashEntryId(): string {
      return decodeURIComponent(window.location.hash.replace(/^#/, ""));
    },
    prefersReducedMotion(): boolean {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
    handleWindowScroll() {
      this.scheduleSyncActiveEntry();
    },
    scheduleSyncActiveEntry() {
      if (this.syncFrame !== null) {
        return;
      }

      this.syncFrame = window.requestAnimationFrame(() => {
        this.syncFrame = null;
        this.syncActiveEntry();
      });
    },
    handleResize() {
      if (window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches) {
        this.collapsed = true;
      }
      this.scheduleSyncActiveEntry();
      this.scrollActiveLinkIntoView("auto");
    },
    handleHashChange() {
      this.syncFromHash({ scroll: false });
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    scrollActiveLinkIntoView(behavior: ScrollMode = "smooth") {
      if (!this.activeId || this.collapsed) {
        return;
      }

      const navElement = this.$refs.navElement as HTMLElement | undefined;
      if (!navElement) {
        return;
      }

      const activeLink = navElement.querySelector<HTMLElement>(`[data-entry-id="${this.activeId}"]`);
      if (!activeLink) {
        return;
      }

      const navRect = navElement.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const inset = 18;
      const isWithinView =
        linkRect.top >= navRect.top + inset &&
        linkRect.bottom <= navRect.bottom - inset;

      if (isWithinView) {
        return;
      }

      const targetTop =
        navElement.scrollTop +
        (linkRect.top - navRect.top) -
        navElement.clientHeight / 2 +
        activeLink.clientHeight / 2;

      navElement.scrollTo({
        top: Math.max(
          0,
          Math.min(targetTop, navElement.scrollHeight - navElement.clientHeight)
        ),
        behavior,
      });
    },
    syncFromHash(options: { scroll: boolean }): boolean {
      const hashEntryId = this.currentHashEntryId();
      if (!hashEntryId) {
        return false;
      }

      if (!this.normalizedEntries.some((entry) => entry.id === hashEntryId)) {
        return false;
      }

      this.activeId = hashEntryId;

      if (options.scroll) {
        this.navigateToEntry(hashEntryId, {
          behavior: this.prefersReducedMotion() ? "auto" : "smooth",
          updateHash: false,
        });
      } else {
        this.$nextTick(() => this.scrollActiveLinkIntoView("auto"));
      }

      return true;
    },
    handleEntryClick(event: MouseEvent, entryId: string) {
      event.preventDefault();
      this.navigateToEntry(entryId, {
        behavior: this.prefersReducedMotion() ? "auto" : "smooth",
        updateHash: true,
      });
    },
    navigateToEntry(
      entryId: string,
      options: { behavior: ScrollMode; updateHash: boolean }
    ) {
      const target = document.getElementById(entryId);
      if (!target) {
        return;
      }

      if (options.updateHash) {
        window.history.replaceState(null, "", this.entryHref(entryId));
      }

      const targetTop = target.getBoundingClientRect().top + window.scrollY - this.topOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: options.behavior });
      this.activeId = entryId;

      if (window.matchMedia(`(max-width: ${this.mobileBreakpoint}px)`).matches) {
        this.collapsed = true;
      }

      this.$nextTick(() => this.scrollActiveLinkIntoView(options.behavior));
    },
    syncActiveEntry() {
      if (!this.normalizedEntries.length) {
        return;
      }

      const firstEntryId = this.normalizedEntries[0]?.id ?? "";
      const scrollTop = window.scrollY;
      const viewportAnchor =
        scrollTop +
        this.topOffset +
        Math.min(140, Math.max(32, window.innerHeight * 0.14));

      let currentEntryId: string | null = null;
      let nearestBelowEntry: { id: string; top: number } | null = null;

      for (const entry of this.normalizedEntries) {
        const element = document.getElementById(entry.id);
        if (!element) {
          continue;
        }

        const top = element.getBoundingClientRect().top + scrollTop;
        if (top <= viewportAnchor) {
          currentEntryId = entry.id;
          continue;
        }

        if (!nearestBelowEntry || top < nearestBelowEntry.top) {
          nearestBelowEntry = { id: entry.id, top };
        }
      }

      let resolvedActiveId = currentEntryId ?? nearestBelowEntry?.id ?? firstEntryId;

      if (window.scrollY <= 4) {
        resolvedActiveId = firstEntryId || resolvedActiveId;
      } else {
        const nearPageBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 8;
        if (nearPageBottom) {
          resolvedActiveId =
            this.normalizedEntries[this.normalizedEntries.length - 1]?.id ??
            resolvedActiveId;
        }
      }

      if (resolvedActiveId && resolvedActiveId !== this.activeId) {
        this.activeId = resolvedActiveId;
      }
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
  max-height: auto;
  overflow: hidden;
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
  border-color: rgba(var(--accent-rgb), 0.42);
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
  overflow: auto;
  max-height: 2000px;
  opacity: 1;
  transform: translateY(0);
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  padding-right: 2px;
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
  text-decoration: none;
  text-align: left;
  padding: 8px 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px;
  font: inherit;
  cursor: pointer;
  min-width: 0;
  transition: background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
}

.work-toc-link:hover {
  background: var(--nav-hover-bg);
  transform: translateY(-1px);
}

.work-toc-link-active {
  border-color: rgba(var(--accent-rgb), 0.56);
  background: rgba(var(--accent-rgb), 0.12);
}

.work-toc-link-parent-active {
  border-color: rgba(var(--accent-rgb), 0.34);
  background: rgba(var(--accent-rgb), 0.06);
}

.work-toc-link-level-1 {
  font-weight: 650;
}

.work-toc-link-level-2 {
  padding-left: 18px;
}

.work-toc-link-level-3 {
  padding-left: 26px;
}

.work-toc-link-index {
  font-size: var(--font-size-micro);
  opacity: 0.75;
  letter-spacing: 0.06em;
  min-width: 1.15rem;
}

.work-toc-link-marker {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.3;
}

.work-toc-link-label {
  font-size: var(--font-size-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.work-toc-link-level-2 .work-toc-link-label {
  font-size: var(--font-size-meta);
  opacity: 0.92;
}

.work-toc-link-level-3 .work-toc-link-label {
  font-size: var(--font-size-caption);
  opacity: 0.86;
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
