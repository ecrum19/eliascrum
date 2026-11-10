<template>
  <entry-card :id="`software-${entry.id}`" class="software-card toc-anchor">
    <div class="software-title-row">
      <h3 class="software-title">
        <router-link :to="entryPath(entry)">{{ entry.title }}</router-link>
      </h3>
      <button
        type="button"
        class="software-year"
        :class="{ 'software-year-active': filters.year === year }"
        :aria-pressed="filters.year === year"
        data-category="Date"
        @click="$emit('year', year)"
      >
        {{ year }}
      </button>
    </div>
    <div class="software-tags">
      <tag-chip
        kind="type"
        category="Type"
        :active="filters.type === entry.type"
        @click="$emit('tag', 'type', entry.type)"
        >{{ entry.type }}</tag-chip
      >
      <tag-chip
        kind="purpose"
        category="Purpose"
        :active="filters.purpose === entry.purpose"
        @click="$emit('tag', 'purpose', entry.purpose)"
        >{{ entry.purpose }}</tag-chip
      >
      <tag-chip
        v-for="topic in entry.topics"
        :key="topic"
        kind="topic"
        category="Main Topic"
        :active="filters.topic === topic"
        @click="$emit('tag', 'topic', topic)"
        >{{ topic }}</tag-chip
      >
    </div>
    <p class="software-summary">{{ entry.summary }}</p>
    <p v-if="release" class="software-release">
      Latest release:
      <a
        v-if="release.url"
        :href="normalizeLinkUrl(release.url)"
        :target="linkTarget(release.url)"
        :rel="linkRel(release.url)"
        >{{ releaseLabel }}</a
      >
      <span v-else>{{ releaseLabel }}</span>
    </p>
    <p
      v-if="release?.publishedAt && release.publishedAt.length >= 10"
      class="software-release-date"
    >
      Latest release date: {{ release.publishedAt.slice(0, 10) }}
    </p>
    <div class="software-links">
      <action-link :to="entryPath(entry)" intent="detail"
        >Show Details</action-link
      >
      <action-link v-if="entry.links?.repository" :href="entry.links.repository"
        >To Git Repo</action-link
      >
      <action-link v-if="entry.links?.website" :href="entry.links.website">To Web Page</action-link>
      <action-link
        v-if="entry.links?.documentation"
        :href="entry.links.documentation"
        >Documentation</action-link
      >
    </div>
  </entry-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SoftwareRecord } from "../../content/types";
import type {
  SoftwareFilters,
  SoftwareTagKind,
} from "../../content/softwareFilters";
import type { SoftwareReleaseInfo } from "../../data/softwareReleases";
import { dateLabel } from "../../content/dates";
import { entryPath } from "../../content/catalog";
import { normalizeLinkUrl, linkTarget, linkRel } from "../../utils/links";
import EntryCard from "../ui/EntryCard.vue";
import TagChip from "../ui/TagChip.vue";
import ActionLink from "../ui/ActionLink.vue";

const props = defineProps<{
  entry: SoftwareRecord;
  filters: SoftwareFilters;
  release?: SoftwareReleaseInfo | null;
}>();
defineEmits<{
  tag: [kind: SoftwareTagKind, value: string];
  year: [value: string];
}>();
const year = computed(() => dateLabel(props.entry.date));
const releaseLabel = computed(
  () => props.release?.tagName || props.release?.name || "Latest update",
);
</script>

<style scoped>
.software-title-row {
  display: block;
  padding-right: 112px;
}

.software-title {
  margin: 0;
  font-size: var(--list-title-size);
  line-height: 1.35;
}

.software-title a {
  color: var(--link-color);
  text-decoration: none;
}

.software-title a:hover {
  text-decoration: underline;
}

.software-year {
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

.software-year:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.52);
}

.software-year:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.72);
  box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.28);
}

.software-year-active {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.software-summary {
  margin: 12px 0 0;
  color: var(--page-text);
  line-height: 1.6;
  font-size: var(--list-summary-size);
}

.software-release {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: var(--font-size-body-sm);
}

.software-release a {
  color: var(--link-color);
  text-decoration: none;
}

.software-release a:hover {
  text-decoration: underline;
}

.software-release-date {
  margin: 2px 0 0;
  color: var(--text-soft);
  font-size: var(--font-size-caption);
}

.software-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.software-links {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
}

@media (max-width: 768px) {
  .software-title-row {
    padding-right: 0;
  }
  .software-year {
    position: static;
    margin-top: 8px;
  }
}
</style>
