<template>
  <section class="work-page-shell w3-content w3-margin-top" :style="shellStyle">
    <div class="work-page-layout">
      <work-toc
        v-if="showToc"
        :entries="tocEntries"
        :title="tocTitle"
        :top-offset="tocTopOffset"
        :mobile-breakpoint="tocMobileBreakpoint"
      />

      <div class="work-page-main">
        <slot />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import WorkToc, { type TocEntry } from "../WorkToc.vue";

/**
 * Shared shell for pages using the recurring "left TOC + right content" pattern.
 * This component centralizes max-width, spacing, and responsive layout behavior.
 */
export default defineComponent({
  name: "WorkPageLayout",
  components: {
    WorkToc,
  },
  props: {
    tocEntries: {
      type: Array as PropType<TocEntry[]>,
      default: () => [],
    },
    tocTitle: {
      type: String,
      default: "Contents",
    },
    showToc: {
      type: Boolean,
      default: true,
    },
    maxWidth: {
      type: String,
      default: "min(1920px, 97vw)",
    },
    pagePadding: {
      type: String,
      default: "0 12px 118px",
    },
    tocTopOffset: {
      type: Number,
      default: 86,
    },
    tocMobileBreakpoint: {
      type: Number,
      default: 1080,
    },
  },
  computed: {
    shellStyle(): Record<string, string> {
      return {
        maxWidth: this.maxWidth,
        padding: this.pagePadding,
      };
    },
  },
});
</script>

<style scoped>
.work-page-shell {
  font-size: var(--font-size-body-lg);
}

.work-page-layout {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.work-page-main {
  min-width: 0;
  display: grid;
  gap: var(--work-main-gap, 16px);
}

@media (max-width: 1080px) {
  .work-page-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
