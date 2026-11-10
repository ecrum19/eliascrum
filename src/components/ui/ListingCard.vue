<template>
  <entry-card class="listing-card toc-anchor">
    <div class="listing-title-row">
      <component :is="`h${headingLevel}`" class="listing-title">
        <router-link :to="to">{{ title }}</router-link>
      </component>
      <button
        type="button"
        class="listing-date"
        :class="{ 'listing-date-active': dateActive }"
        :aria-pressed="dateActive"
        data-category="Date"
        @click="$emit('date')"
      >
        {{ date }}
      </button>
    </div>
    <slot name="meta" />
    <div class="listing-tags"><slot name="tags" /></div>
    <slot />
  </entry-card>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import EntryCard from "./EntryCard.vue";

/** One entry in a listing: linked title, a date chip that filters by date, then tags. */
withDefaults(
  defineProps<{
    title: string;
    to: RouteLocationRaw;
    date: string;
    dateActive?: boolean;
    headingLevel?: 2 | 3;
  }>(),
  { dateActive: false, headingLevel: 3 },
);
defineEmits<{ date: [] }>();
</script>

<style scoped>
.listing-title-row {
  display: block;
  padding-right: 116px;
}

.listing-title {
  margin: 0;
  font-size: var(--list-title-size);
  line-height: 1.35;
}

.listing-title a {
  color: var(--link-color);
  text-decoration: none;
}

.listing-title a:hover {
  text-decoration: underline;
}

.listing-date {
  position: absolute;
  top: 16px;
  right: 20px;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 5px 12px;
  background: transparent;
  font-weight: 700;
  font-size: var(--list-date-size);
  letter-spacing: 0.01em;
  color: var(--text-muted);
  opacity: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease;
}

.listing-date:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.52);
}

.listing-date:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.72);
  box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.28);
}

.listing-date-active {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.listing-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

@media (max-width: 768px) {
  .listing-title-row {
    padding-right: 0;
  }

  .listing-date {
    position: static;
    margin-top: 8px;
  }
}
</style>
