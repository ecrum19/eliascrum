<template>
  <entry-card
    id="detail-overview"
    as="header"
    variant="panel"
    class="detail-header toc-anchor"
  >
    <div class="detail-header-top">
      <div class="detail-header-copy">
        <p v-if="kicker" class="detail-kicker">{{ kicker }}</p>
        <content-heading :level="1" compact>{{ title }}</content-heading>
        <p v-if="byline" class="detail-byline">{{ byline }}</p>
      </div>
      <p v-if="date" class="detail-date">{{ date }}</p>
    </div>
    <slot />
    <div class="detail-actions">
      <action-link :to="back.to" shape="pill" intent="back">{{
        back.label
      }}</action-link>
      <action-link
        v-for="action in actions"
        :key="action.label"
        :to="action.to"
        :href="action.href"
        shape="pill"
        :intent="action.to ? 'detail' : 'external'"
        >{{ action.label }}</action-link
      >
    </div>
    <div v-if="tags.length" class="detail-tags">
      <span class="detail-tags-label">Tags:</span>
      <div class="detail-tags-list">
        <tag-chip
          v-for="tag in tags"
          :key="`${tag.category}:${tag.label}`"
          :kind="tag.color"
          :category="tag.category"
          :to="tag.to"
          >{{ tag.label }}</tag-chip
        >
      </div>
    </div>
  </entry-card>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import EntryCard from "../ui/EntryCard.vue";
import ContentHeading from "../ui/ContentHeading.vue";
import ActionLink from "../ui/ActionLink.vue";
import TagChip from "../ui/TagChip.vue";
import type { DetailAction, DetailTag } from "./detail";

withDefaults(
  defineProps<{
    title: string;
    back: { to: RouteLocationRaw; label: string };
    kicker?: string;
    byline?: string;
    date?: string;
    actions?: DetailAction[];
    tags?: DetailTag[];
  }>(),
  { actions: () => [], tags: () => [] },
);
</script>

<style scoped>
.detail-header {
  display: grid;
  gap: 12px;
}

.detail-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.detail-header-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.detail-kicker {
  margin: 0;
  color: var(--text-soft);
  font-size: var(--font-size-meta);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-byline {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-body-lg);
}

.detail-date {
  margin: 4px 0 0;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 6px 12px;
  color: var(--page-text);
  font-size: var(--font-size-body);
  font-weight: 700;
  white-space: nowrap;
}

.detail-actions,
.detail-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-tags {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.detail-tags-label {
  font-weight: 700;
  color: var(--page-text);
  padding-top: 4px;
}

@media (max-width: 780px) {
  .detail-header-top,
  .detail-tags {
    flex-direction: column;
  }

  .detail-tags {
    gap: 6px;
  }
}
</style>
