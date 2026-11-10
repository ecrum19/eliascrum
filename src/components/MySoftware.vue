<template>
  <work-page-layout
    id="software-page"
    :toc-entries="tocEntries"
    max-width="min(1920px, 97vw)"
    page-padding="0 12px 118px"
  >
    <section id="software-overview" class="work-section">
      <header class="software-header">
        <content-heading :level="1">Software</content-heading>
        <p class="page-subheader">
          Software platforms, tooling, web resources, and technical
          specifications.
        </p>
        <filter-panel
          id="software-filters"
          v-model:open="filtersOpen"
          :active="hasActiveFilters"
          :result-label="`Showing ${filteredEntries.length} of ${softwareCatalog.entries.length} software entries.`"
          @clear="clearFilters"
        >
          <filter-select
            v-model="filters.section"
            label="Section"
            :options="[
              'All',
              ...softwareCatalog.sections.map((section) => section.title),
            ]"
          />
          <filter-select
            v-model="filters.type"
            label="Type"
            :options="options.types"
          />
          <filter-select
            v-model="filters.purpose"
            label="Purpose"
            :options="options.purposes"
          />
          <filter-select
            v-model="filters.topic"
            label="Main Topic"
            :options="options.topics"
          />
          <filter-select
            v-model="filters.year"
            label="Date"
            :options="options.years"
          />
          <filter-select
            :model-value="filters.sort"
            label="Sort"
            :options="sortOptions"
            @update:model-value="setSort"
          />
        </filter-panel>
      </header>
    </section>
    <section id="software-content" class="work-section">
      <work-section-block
        v-for="section in displayedSections"
        :id="`software-section-${section.id}`"
        :key="section.id"
      >
        <header class="work-section-header">
          <content-heading>{{ section.title }}</content-heading>
          <p>{{ section.description }}</p>
        </header>
        <div class="software-list">
          <software-card
            v-for="entry in section.entries"
            :key="entry.id"
            :entry="entry"
            :filters="filters"
            :release="softwareReleasesBySoftwareId[entry.id]"
            @tag="applyTag"
            @year="applyYear"
          />
        </div>
      </work-section-block>
      <work-section-block v-if="!displayedSections.length" :anchor="false">
        <entry-card class="empty-state">
          <h3>No matching software</h3>
          <p>Try another filter or clear the current selection.</p>
        </entry-card>
      </work-section-block>
    </section>
  </work-page-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { softwareCatalog } from "../content/catalog";
import { dateLabel, dateSortValue } from "../content/dates";
import { SORT_OPTIONS as sortOptions, choices } from "../content/listingFilters";
import {
  defaultSoftwareFilters,
  filterSoftware,
  routeTagFilters,
  tagFilters,
  type SoftwareFilters,
  type SoftwareTagKind,
} from "../content/softwareFilters";
import { softwareReleasesBySoftwareId } from "../data/softwareReleases";
import WorkPageLayout from "./layout/WorkPageLayout.vue";
import WorkSectionBlock from "./layout/WorkSectionBlock.vue";
import ContentHeading from "./ui/ContentHeading.vue";
import FilterPanel from "./ui/FilterPanel.vue";
import FilterSelect from "./ui/FilterSelect.vue";
import EntryCard from "./ui/EntryCard.vue";
import SoftwareCard from "./software/SoftwareCard.vue";

const route = useRoute();
const filters = ref(defaultSoftwareFilters());
const filtersOpen = ref(false);
const options = {
  types: choices(softwareCatalog.entries.map((entry) => entry.type)),
  purposes: choices(softwareCatalog.entries.map((entry) => entry.purpose)),
  topics: choices(softwareCatalog.entries.flatMap((entry) => entry.topics)),
  years: [
    "All",
    ...new Set(
      [...softwareCatalog.entries]
        .sort((a, b) => dateSortValue(b.date) - dateSortValue(a.date))
        .map((entry) => dateLabel(entry.date)),
    ),
  ],
};
const hasActiveFilters = computed(
  () =>
    JSON.stringify(filters.value) !== JSON.stringify(defaultSoftwareFilters()),
);
const filteredEntries = computed(() =>
  filterSoftware(
    softwareCatalog.entries,
    softwareCatalog.sections,
    filters.value,
  ),
);
const displayedSections = computed(() =>
  softwareCatalog.sections
    .map((section) => ({
      ...section,
      entries: filteredEntries.value.filter(
        (entry) => entry.sectionId === section.id,
      ),
    }))
    .filter((section) => section.entries.length),
);
const tocEntries = computed(() => [
  { id: "software-overview", label: "Overview", level: 1 },
  { id: "software-filters", label: "Filters", level: 2 },
  ...displayedSections.value.flatMap((section) => [
    { id: `software-section-${section.id}`, label: section.title, level: 1 },
    ...section.entries.map((entry) => ({
      id: `software-${entry.id}`,
      label: entry.title,
      level: 2,
    })),
  ]),
]);
function clearFilters() {
  filters.value = defaultSoftwareFilters();
}
function applyTag(kind: SoftwareTagKind, value: string) {
  filters.value = tagFilters(kind, value, filters.value.sort);
  filtersOpen.value = true;
}
function applyYear(value: string) {
  filters.value.year = value;
  filtersOpen.value = true;
}
function setSort(value: string) {
  if (sortOptions.some((option) => option.value === value))
    filters.value.sort = value as SoftwareFilters["sort"];
}
watch(
  () => route.query,
  (query) => {
    const fromRoute = routeTagFilters(query);
    if (fromRoute) {
      filters.value = fromRoute;
      filtersOpen.value = true;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
#software-page {
  font-size: var(--font-size-body-lg);
  --work-main-gap: 20px;
}

.work-section {
  min-width: 0;
  display: grid;
  gap: 12px;
  scroll-margin-top: 92px;
}

.software-header {
  width: 100%;
  margin: 0 auto;
  background: var(--surface-bg);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 14px 16px;
  display: grid;
  gap: 10px;
}

.page-subheader {
  margin: 0;
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body-lg);
  line-height: 1.4;
}

.work-section-header {
  margin: 0;
}

.work-section-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body);
}

.software-list {
  display: grid;
  gap: 16px;
}

.empty-state h3 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
}

@media (max-width: 768px) {
  #software-page {
    padding: 0 8px 118px;
    --work-main-gap: 16px;
  }
  .software-header {
    padding: 12px;
  }
}
</style>
