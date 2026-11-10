<template>
  <work-page-layout
    id="talks"
    :toc-entries="tocEntries"
    max-width="min(1780px, 97vw)"
    page-padding="0 16px 140px"
  >
    <section id="talks-overview" class="work-section">
      <header class="talks-header">
        <content-heading :level="1">Talks and Posters</content-heading>
        <p class="page-subheader">
          Presentation slide decks and conference posters from talks, symposiums, and research events.
        </p>
        <filter-panel
          id="talks-filters"
          v-model:open="filtersOpen"
          class="talks-filters toc-anchor"
          :active="hasActiveFilters"
          :result-label="`Showing ${filteredEntries.length} of ${allEntries.length} items.`"
          @clear="filters = defaultPresentationFilters()"
        >
          <filter-select v-model="filters.venue" label="Venue" :options="options.venues" />
          <filter-select v-model="filters.topic" label="Main Topic" :options="options.topics" />
          <filter-select v-model="filters.material" label="Type" :options="options.materials" />
          <filter-select v-model="filters.duration" label="Duration" :options="options.durations" />
          <filter-select
            v-model="filters.audienceSize"
            label="Audience Size"
            :options="options.audienceSizes"
          />
          <filter-select
            v-model="filters.audienceGroup"
            label="Audience Field"
            :options="options.audienceGroups"
          />
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

    <section id="talks-sections" class="work-section">
      <work-section-block v-for="group in groups" :id="`talks-section-${group.id}`" :key="group.id">
        <header class="talk-section-header">
          <content-heading>{{ group.title }}</content-heading>
          <p>{{ group.description }}</p>
        </header>
        <div class="talks-shell">
          <presentation-card
            v-for="entry in group.entries"
            :key="`${entry.kind}:${entry.id}`"
            :entry="entry"
            :filters="filters"
            @tag="applyTag"
          />
        </div>
      </work-section-block>

      <work-section-block v-if="!filteredEntries.length" :anchor="false">
        <entry-card class="empty-state">
          <h2>No Items Match Current Filters</h2>
          <p>Try clearing one or more filters to see more talks and posters.</p>
        </entry-card>
      </work-section-block>
    </section>
  </work-page-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { posterCatalog, talkCatalog } from "../content/catalog";
import { SORT_OPTIONS, type SortOrder } from "../content/listingFilters";
import type { PresentationRecord } from "../content/presentationDetails";
import {
  defaultPresentationFilters,
  filterPresentations,
  presentationAnchor,
  presentationFilterOptions,
  routeTagFilters,
  tagFilters,
  type PresentationTagKind,
} from "../content/presentationFilters";
import WorkPageLayout from "./layout/WorkPageLayout.vue";
import WorkSectionBlock from "./layout/WorkSectionBlock.vue";
import ContentHeading from "./ui/ContentHeading.vue";
import EntryCard from "./ui/EntryCard.vue";
import FilterPanel from "./ui/FilterPanel.vue";
import FilterSelect from "./ui/FilterSelect.vue";
import PresentationCard from "./talks/PresentationCard.vue";

const route = useRoute();
const allEntries: PresentationRecord[] = [...talkCatalog.entries, ...posterCatalog.entries];
const options = presentationFilterOptions(allEntries);
const filters = ref(defaultPresentationFilters());
const filtersOpen = ref(false);
const hasActiveFilters = computed(
  () => JSON.stringify(filters.value) !== JSON.stringify(defaultPresentationFilters()),
);
const filteredEntries = computed(() => filterPresentations(allEntries, filters.value));
const groups = computed(() =>
  [
    { id: "talks", title: "Talks", description: "Presentation slides and meta-data.", kind: "talk" },
    { id: "posters", title: "Posters", description: "Posters presented at conferences and symposiums.", kind: "poster" },
  ]
    .map((group) => ({ ...group, entries: filteredEntries.value.filter((entry) => entry.kind === group.kind) }))
    .filter((group) => group.entries.length),
);
const tocEntries = computed(() => [
  { id: "talks-overview", label: "Overview", level: 1 },
  { id: "talks-filters", label: "Filters", level: 2 },
  ...groups.value.flatMap((group) => [
    { id: `talks-section-${group.id}`, label: group.title, level: 1 },
    ...group.entries.map((entry) => ({ id: presentationAnchor(entry), label: entry.title, level: 2 })),
  ]),
]);

function applyTag(kind: PresentationTagKind, value: string) {
  filters.value = tagFilters(kind, value, filters.value.sort);
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
#talks {
  font-size: var(--font-size-body-lg);
  --work-main-gap: 16px;
  --filter-columns: repeat(8, minmax(0, 1fr));
}

.work-section {
  min-width: 0;
  display: grid;
  gap: 12px;
}

.toc-anchor {
  scroll-margin-top: 92px;
}

.talks-header {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 18px 22px;
}

.page-subheader {
  margin: 8px 0 0;
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body-lg);
  line-height: 1.45;
}

.talks-filters {
  margin-top: 12px;
}

.talk-section-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body);
}

.talks-shell {
  display: grid;
  gap: 16px;
}

.empty-state h2 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
}

@media (max-width: 1320px) {
  #talks {
    --filter-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 1080px) {
  #talks {
    --filter-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  #talks {
    --filter-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  #talks {
    padding: 0 10px 132px;
  }

  .talks-header {
    padding: 14px;
  }
}

@media (max-width: 640px) {
  #talks {
    --filter-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 500px) {
  #talks {
    --filter-columns: 1fr;
  }
}
</style>
