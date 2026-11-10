<template>
  <listing-card
    :id="`software-${entry.id}`"
    class="software-card"
    :title="entry.title"
    :to="entryPath(entry)"
    :date="year"
    :date-active="filters.year === year"
    @date="$emit('year', year)"
  >
    <template #tags>
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
    </template>
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
  </listing-card>
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
import ListingCard from "../ui/ListingCard.vue";
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


.software-links {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
}

</style>
