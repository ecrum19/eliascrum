<template>
  <work-page-layout
    class="detail-page"
    :toc-entries="tocEntries"
    :toc-title="tocTitle"
    :show-toc="found"
    max-width="min(1780px, 97vw)"
    page-padding="0 16px 140px"
  >
    <slot v-if="found" />
    <detail-header v-else :title="notFoundTitle" :back="back">
      <p class="detail-not-found">{{ notFoundMessage }}</p>
    </detail-header>
  </work-page-layout>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import WorkPageLayout from "../layout/WorkPageLayout.vue";
import DetailHeader from "./DetailHeader.vue";
import type { TocEntry } from "../WorkToc.vue";

/** The shared shell of every item page: contents, header, highlight, then section panels. */
defineProps<{
  found: boolean;
  tocTitle: string;
  tocEntries: TocEntry[];
  back: { to: RouteLocationRaw; label: string };
  notFoundTitle: string;
  notFoundMessage: string;
}>();
</script>

<style scoped>
.detail-page {
  --work-main-gap: 18px;
}

.detail-not-found {
  margin: 0;
  color: var(--text-muted);
}
</style>
