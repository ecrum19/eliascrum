<template>
  <work-page-layout
    id="publications"
    :toc-entries="tocEntries"
    max-width="min(1920px, 97vw)"
    page-padding="0 12px 118px"
  >
    <section id="publications-overview" class="work-section">
      <header class="publications-header">
        <div class="publications-intro">
          <content-heading :level="1">Publications</content-heading>
          <p class="page-subheader">
            Journal publications, conference papers, preprints, and linked paper materials.
          </p>
          <p class="citation-update-note">
            Google Scholar citation counts last updated:
            <strong>{{ citationsUpdatedLabel }}</strong>
          </p>
        </div>
        <div class="profile-links">
          <a
            v-for="profile in publicationProfileLinks"
            :key="profile.id"
            class="profile-link"
            :class="profile.variant"
            :href="profile.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="profile.label"
            :title="profile.label"
          >
            <img class="profile-icon" :src="profile.iconUrl" alt="" />
          </a>
        </div>
        <filter-panel
          id="publications-filters"
          v-model:open="filtersOpen"
          :active="hasActiveFilters"
          :result-label="`Showing ${filteredEntries.length} of ${publicationCatalog.entries.length} publications.`"
          @clear="filters = defaultPublicationFilters()"
        >
          <filter-select v-model="filters.venue" label="Venue" :options="options.venues" />
          <filter-select v-model="filters.topic" label="Main Topic" :options="options.topics" />
          <filter-select v-model="filters.type" label="Type" :options="options.types" />
          <filter-select v-model="filters.year" label="Date" :options="options.years" />
          <filter-select
            :model-value="filters.sort"
            label="Sort"
            :options="SORT_OPTIONS"
            @update:model-value="setSort"
          />
        </filter-panel>
      </header>
    </section>

    <section id="publications-content" class="work-section">
      <work-section-block class="publications-content-block" :anchor="false">
        <div class="publications-list">
          <publication-card
            v-for="entry in filteredEntries"
            :key="entry.id"
            :entry="entry"
            :filters="filters"
            @tag="applyTag"
            @year="applyYear"
          />
          <entry-card v-if="!filteredEntries.length" class="publication-card empty-state">
            <h2>No Publications Match Current Filters</h2>
            <p>Try clearing one or more filters to see more entries.</p>
          </entry-card>
        </div>
      </work-section-block>
    </section>
  </work-page-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { publicationCatalog } from "../content/catalog";
import { SORT_OPTIONS, type SortOrder } from "../content/listingFilters";
import {
  defaultPublicationFilters,
  filterPublications,
  publicationFilterOptions,
  routeTagFilters,
  tagFilters,
  type PublicationTagKind,
} from "../content/publicationFilters";
import { publicationProfileLinks } from "../content/profiles";
import { scholarCitationLastUpdatedIso } from "../data/scholarCitations";
import WorkPageLayout from "./layout/WorkPageLayout.vue";
import WorkSectionBlock from "./layout/WorkSectionBlock.vue";
import ContentHeading from "./ui/ContentHeading.vue";
import EntryCard from "./ui/EntryCard.vue";
import FilterPanel from "./ui/FilterPanel.vue";
import FilterSelect from "./ui/FilterSelect.vue";
import PublicationCard from "./publications/PublicationCard.vue";

const route = useRoute();
const filters = ref(defaultPublicationFilters());
const filtersOpen = ref(false);
const options = publicationFilterOptions(publicationCatalog.entries);
const hasActiveFilters = computed(
  () => JSON.stringify(filters.value) !== JSON.stringify(defaultPublicationFilters()),
);
const filteredEntries = computed(() => filterPublications(publicationCatalog.entries, filters.value));
const tocEntries = computed(() => [
  { id: "publications-overview", label: "Overview", level: 1 },
  { id: "publications-filters", label: "Filters", level: 2 },
  { id: "publications-content", label: "Entries", level: 1 },
  ...filteredEntries.value.map((entry) => ({
    id: `publication-${entry.id}`,
    label: entry.title,
    level: 2,
  })),
]);
const citationsUpdatedLabel = computed(() => {
  if (!scholarCitationLastUpdatedIso) return "Not yet updated";
  const date = new Date(scholarCitationLastUpdatedIso);
  return Number.isNaN(date.getTime())
    ? scholarCitationLastUpdatedIso
    : date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
});

function applyTag(kind: PublicationTagKind, value: string) {
  filters.value = tagFilters(kind, value, filters.value.sort);
  filtersOpen.value = true;
}
function applyYear(value: string) {
  filters.value.year = value;
  filtersOpen.value = true;
}
function setSort(value: string) {
  if (SORT_OPTIONS.some((option) => option.value === value)) filters.value.sort = value as SortOrder;
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
#publications {
  --work-content-max: 100%;
  font-size: var(--font-size-body-lg);
  --work-main-gap: 14px;
  --filter-columns: repeat(5, minmax(0, 1fr));
}

.work-section {
  min-width: 0;
  display: grid;
  gap: 12px;
  scroll-margin-top: 92px;
}

.publications-content-block {
  max-width: var(--work-content-max);
  gap: 0;
  padding-top: 14px;
}

.publications-header {
  max-width: var(--work-content-max);
  width: 100%;
  margin: 0 auto;
  background: var(--surface-bg);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 14px 16px;
  display: grid;
  gap: 10px;
  position: relative;
}

.publications-intro {
  padding-right: 104px;
}

.page-subheader {
  margin: 6px 0 0;
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body-lg);
  line-height: 1.4;
}

.citation-update-note {
  margin: 6px 0 0;
  color: var(--text-soft);
  opacity: 1;
  font-size: var(--font-size-meta) !important;
}

.profile-links {
  position: absolute;
  top: 12px;
  right: 14px;
  display: flex;
  gap: 6px;
}

.profile-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: var(--font-size-subtitle);
  font-weight: 700;
  padding: 0;
  border-radius: 999px;
  border: 1px solid var(--surface-outline);
  color: var(--page-text);
  background: transparent;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}

.profile-link:hover {
  transform: translateY(-1px);
  background: var(--nav-hover-bg);
}

.profile-link.scholar {
  box-shadow: inset 0 0 0 1px rgba(var(--accent-rgb), 0.35);
}

.profile-link.semantic {
  box-shadow: inset 0 0 0 1px rgba(var(--accent-secondary-rgb), 0.35);
}

.profile-link.orcid {
  box-shadow: inset 0 0 0 1px rgba(166, 206, 57, 0.46);
}

.profile-icon {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
  filter: grayscale(1) brightness(0) contrast(1.05);
}

[data-theme="dark"] .profile-icon {
  filter: grayscale(1) brightness(0) invert(1) contrast(1.05);
}

.publications-list {
  display: grid;
  gap: 16px;
}

.empty-state h2 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
}

@media (max-width: 768px) {
  #publications {
    padding: 0 8px 118px;
    --work-main-gap: 16px;
    --filter-columns: repeat(2, minmax(0, 1fr));
  }

  .publications-header {
    padding: 12px;
  }

  .publications-intro {
    padding-right: 0;
  }

  .profile-links {
    position: static;
    gap: 10px;
  }
}
</style>
