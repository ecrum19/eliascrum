<template>
  <section id="talks" class="w3-content w3-margin-top" style="max-width: 1400px">
    <div class="talks-shell">
      <header class="talks-header">
        <h1>Talks and Posters</h1>
        <p>
          Slides and posters with metadata tags and optional previews.
        </p>

        <section class="talk-filters">
          <button
            type="button"
            class="filter-toggle"
            @click="filtersOpen = !filtersOpen"
            :aria-expanded="filtersOpen"
          >
            <span class="filter-toggle-title">Filter and Sort</span>
            <span class="filter-toggle-state">{{ filtersOpen ? "Hide" : "Show" }}</span>
          </button>

          <div v-show="filtersOpen" class="filter-panel">
            <div class="filter-grid">
              <label class="filter-control">
                Venue
                <select v-model="selectedVenue">
                  <option value="All">All</option>
                  <option v-for="venue in availableVenueTags" :key="venue" :value="venue">
                    {{ venue }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                Main Topic
                <select v-model="selectedTopic">
                  <option value="All">All</option>
                  <option v-for="topic in availableTopicTags" :key="topic" :value="topic">
                    {{ topic }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                Type
                <select v-model="selectedMaterial">
                  <option value="All">All</option>
                  <option v-for="material in availableMaterialTags" :key="material" :value="material">
                    {{ material }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                Duration
                <select v-model="selectedDuration">
                  <option value="All">All</option>
                  <option
                    v-for="durationTag in availableDurationTags"
                    :key="durationTag"
                    :value="durationTag"
                  >
                    {{ durationTag }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                Audience Size
                <select v-model="selectedAudienceSize">
                  <option value="All">All</option>
                  <option
                    v-for="sizeTag in availableAudienceSizeTags"
                    :key="sizeTag"
                    :value="sizeTag"
                  >
                    {{ sizeTag }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                Audience Field
                <select v-model="selectedAudienceGroup">
                  <option value="All">All</option>
                  <option
                    v-for="audienceGroup in availableAudienceGroupTags"
                    :key="audienceGroup"
                    :value="audienceGroup"
                  >
                    {{ audienceGroup }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                Date
                <select v-model="selectedYear">
                  <option value="All">All</option>
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </label>

              <label class="filter-control">
                Sort
                <select v-model="selectedSort">
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </label>
            </div>
            <div class="filter-footer">
              <p class="filter-result">
                Showing {{ filteredAndSortedItems.length }} of {{ catalogEntries.length }} items.
              </p>
              <button
                type="button"
                class="filter-clear-btn"
                :disabled="!hasActiveFilters"
                @click="clearTalkFilters"
              >
                Clear
              </button>
            </div>
          </div>
        </section>
      </header>

      <article
        v-for="item in filteredAndSortedItems"
        :key="item.id"
        class="talk-card"
      >
        <div class="talk-card-layout">
          <div>
            <div class="talk-meta">
              <span class="talk-date">{{ item.displayDateIso }}</span>
            </div>

            <h2>{{ item.displayTitle }}</h2>
            <div class="talk-tags">
              <button
                type="button"
                class="talk-tag talk-tag-material"
                :class="{ 'talk-tag-active': isTalkTagActive('material', item.materialTag) }"
                data-category="Type"
                @click="applyTalkTagFilter('material', item.materialTag)"
              >
                {{ item.materialTag }}
              </button>
              <button
                type="button"
                v-for="tag in item.venueTags"
                :key="`${item.id}-${tag}`"
                class="talk-tag talk-tag-venue"
                :class="{ 'talk-tag-active': isTalkTagActive('venue', tag) }"
                data-category="Venue"
                @click="applyTalkTagFilter('venue', tag)"
              >
                {{ tag }}
              </button>
              <button
                type="button"
                v-for="tag in item.topicTags"
                :key="`${item.id}-${tag}`"
                class="talk-tag talk-tag-topic"
                :class="{ 'talk-tag-active': isTalkTagActive('topic', tag) }"
                data-category="Main Topic"
                @click="applyTalkTagFilter('topic', tag)"
              >
                {{ tag }}
              </button>
              <button
                v-if="item.durationCategory"
                type="button"
                class="talk-tag talk-tag-duration"
                :class="{ 'talk-tag-active': isTalkTagActive('duration', item.durationCategory) }"
                data-category="Duration"
                @click="applyTalkTagFilter('duration', item.durationCategory)"
              >
                {{ item.durationCategory }}
              </button>
              <button
                v-if="item.audienceSizeCategory"
                type="button"
                class="talk-tag talk-tag-audience-size"
                :class="{ 'talk-tag-active': isTalkTagActive('audienceSize', item.audienceSizeCategory) }"
                data-category="Audience Size"
                @click="applyTalkTagFilter('audienceSize', item.audienceSizeCategory)"
              >
                {{ item.audienceSizeCategory }}
              </button>
              <button
                type="button"
                v-for="audienceGroup in item.audienceGroups"
                :key="`${item.id}-audience-${audienceGroup}`"
                class="talk-tag talk-tag-audience-group"
                :class="{ 'talk-tag-active': isTalkTagActive('audienceGroup', audienceGroup) }"
                data-category="Audience Field"
                @click="applyTalkTagFilter('audienceGroup', audienceGroup)"
              >
                {{ audienceGroup }}
              </button>
            </div>
            <p class="talk-description">{{ item.summary }}</p>

            <div class="talk-actions">
              <router-link v-if="item.detailRoute" :to="item.detailRoute" class="talk-btn primary">
                Show Details
              </router-link>
              <a :href="item.primaryPath" target="_blank" rel="noopener noreferrer" class="talk-btn">
                {{ item.primaryActionLabel }}
              </a>
              <a
                v-if="item.secondaryPosterPath"
                :href="item.secondaryPosterPath"
                target="_blank"
                rel="noopener noreferrer"
                class="talk-btn"
              >
                Open Poster PDF
              </a>
              <a
                v-for="publicationLink in item.relatedPublicationLinks"
                :key="publicationLink.key"
                :href="publicationLink.url"
                target="_blank"
                rel="noopener noreferrer"
                class="talk-btn"
              >
                {{ publicationLink.label }}
              </a>
            </div>
          </div>

          <aside class="preview-shell">
            <button
              type="button"
              class="preview-toggle-inline"
              @click="togglePreview(item.id)"
            >
              {{ isPreviewOpen(item.id) ? "Hide Preview" : "Show Preview" }}
            </button>
            <object
              v-if="isPreviewOpen(item.id)"
              :data="`${item.previewPath}#page=1&zoom=page-fit`"
              type="application/pdf"
              class="talk-preview-frame"
            >
              <div class="talk-preview-fallback">
                <i class="fa fa-file-pdf-o"></i>
                <span>Preview unavailable</span>
              </div>
            </object>
          </aside>
        </div>
      </article>

      <article v-if="filteredAndSortedItems.length === 0" class="talk-card empty-state">
        <h2>No Items Match Current Filters</h2>
        <p>Try clearing one or more filters to see more talks and posters.</p>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { talks, posters } from "../data/talksData";
import {
  DURATION_TAG_OPTIONS,
  getTalkViewEntries,
  type DurationTag,
  type TalkViewEntry,
} from "../data/talkCatalog";
import {
  AUDIENCE_GROUP_TAG_OPTIONS,
  AUDIENCE_SIZE_TAG_OPTIONS,
  TOPIC_TAG_OPTIONS,
  VENUE_TAG_OPTIONS,
  type AudienceGroupTag,
  type AudienceSizeTag,
} from "../data/talkMetadata";
import {
  getRelatedPublicationLinksForTalkSlug,
  getRelatedPublicationLinksForPresentationFile,
  type ResolvedPublicationLink,
} from "../data/publicationsData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";

type MaterialTypeTag = "Slides" | "Poster";
type TalkTagFilterKind =
  | "material"
  | "venue"
  | "topic"
  | "audienceSize"
  | "audienceGroup"
  | "duration";

interface CatalogEntry {
  id: string;
  displayTitle: string;
  summary: string;
  displayDateIso: string;
  displayDateLabel: string;
  durationCategory: DurationTag | null;
  audienceSizeCategory: AudienceSizeTag | null;
  audienceGroups: AudienceGroupTag[];
  venueTags: string[];
  topicTags: string[];
  materialTag: MaterialTypeTag;
  detailRoute?: string;
  primaryPath: string;
  primaryActionLabel: string;
  secondaryPosterPath?: string;
  relatedPublicationLinks: ResolvedPublicationLink[];
  previewPath: string;
}

const MATERIAL_TAG_OPTIONS: MaterialTypeTag[] = ["Slides", "Poster"];

export default defineComponent({
  name: "MySlides",
  data() {
    return {
      filtersOpen: false,
      selectedVenue: "All",
      selectedTopic: "All",
      selectedMaterial: "All",
      selectedAudienceSize: "All",
      selectedAudienceGroup: "All",
      selectedDuration: "All",
      selectedYear: "All",
      selectedSort: "date-desc",
      previewVisibility: {} as Record<string, boolean>,
    };
  },
  computed: {
    talkEntries(): TalkViewEntry[] {
      return getTalkViewEntries(talks);
    },
    posterEntries(): CatalogEntry[] {
      return posters.map((poster) => {
        const isEswcPoster = poster.slug === "eswc-24-poster-edc";
        const linkedTalk = isEswcPoster
          ? this.talkEntries.find((talk) => talk.slug === "eswc-phdsymp-pangquin")
          : undefined;

        return {
          id: `poster:${poster.slug}`,
          displayTitle: poster.title,
          summary: linkedTalk
            ? "Poster linked to the ESWC 2024 slide deck."
            : "Poster presentation file.",
          displayDateIso: linkedTalk?.displayDateIso ?? "1900-01-01",
          displayDateLabel: linkedTalk?.displayDateLabel ?? "Undated",
          durationCategory: linkedTalk?.durationCategory ?? null,
          audienceSizeCategory: linkedTalk?.audienceSizeCategory ?? null,
          audienceGroups: linkedTalk?.audienceGroups ?? [],
          venueTags: [],
          topicTags: [],
          materialTag: "Poster",
          detailRoute: linkedTalk ? `/talks/${linkedTalk.slug}` : undefined,
          primaryPath: resolvePublicAssetPath(poster.path),
          primaryActionLabel: "Open Poster PDF",
          relatedPublicationLinks: getRelatedPublicationLinksForPresentationFile(poster.path),
          previewPath: resolvePublicAssetPath(poster.path),
        };
      });
    },
    catalogEntries(): CatalogEntry[] {
      const slideEntries: CatalogEntry[] = this.talkEntries.map((talk) => ({
        id: `slide:${talk.slug}`,
        displayTitle: talk.displayTitle,
        summary: talk.summary,
        displayDateIso: talk.displayDateIso,
        displayDateLabel: talk.displayDateLabel,
        durationCategory: talk.durationCategory,
        audienceSizeCategory: talk.audienceSizeCategory,
        audienceGroups: [...talk.audienceGroups],
        venueTags: [...talk.venueTags],
        topicTags: [...talk.topicTags],
        materialTag: "Slides",
        detailRoute: `/talks/${talk.slug}`,
        primaryPath: resolvePublicAssetPath(talk.slidePath),
        primaryActionLabel: "Open Slides PDF",
        secondaryPosterPath: talk.posterPath
          ? resolvePublicAssetPath(talk.posterPath)
          : undefined,
        relatedPublicationLinks: getRelatedPublicationLinksForTalkSlug(talk.slug),
        previewPath: resolvePublicAssetPath(talk.slidePath),
      }));

      return [...slideEntries, ...this.posterEntries];
    },
    availableVenueTags(): string[] {
      const tags = new Set<string>(VENUE_TAG_OPTIONS);
      this.talkEntries.forEach((talk) => {
        talk.venueTags.forEach((tag) => tags.add(String(tag)));
      });
      return Array.from(tags).sort((a, b) => a.localeCompare(b));
    },
    availableTopicTags(): string[] {
      const tags = new Set<string>(TOPIC_TAG_OPTIONS);
      this.talkEntries.forEach((talk) => {
        talk.topicTags.forEach((tag) => tags.add(String(tag)));
      });
      return Array.from(tags).sort((a, b) => a.localeCompare(b));
    },
    availableMaterialTags(): MaterialTypeTag[] {
      return MATERIAL_TAG_OPTIONS;
    },
    availableDurationTags(): DurationTag[] {
      const tags = new Set<DurationTag>(DURATION_TAG_OPTIONS);
      this.talkEntries.forEach((talk) => {
        tags.add(talk.durationCategory);
      });
      return Array.from(tags);
    },
    availableAudienceSizeTags(): AudienceSizeTag[] {
      const tags = new Set<AudienceSizeTag>(AUDIENCE_SIZE_TAG_OPTIONS);
      this.talkEntries.forEach((talk) => {
        tags.add(talk.audienceSizeCategory);
      });
      return Array.from(tags);
    },
    availableAudienceGroupTags(): AudienceGroupTag[] {
      const tags = new Set<AudienceGroupTag>(AUDIENCE_GROUP_TAG_OPTIONS);
      this.talkEntries.forEach((talk) => {
        talk.audienceGroups.forEach((group) => tags.add(group));
      });
      return Array.from(tags).sort((a, b) => String(a).localeCompare(String(b)));
    },
    availableYears(): string[] {
      const years = new Set<string>();
      this.catalogEntries.forEach((entry) => {
        if (entry.displayDateIso === "1900-01-01") {
          years.add("Undated");
          return;
        }
        years.add(entry.displayDateIso.slice(0, 4));
      });
      return Array.from(years).sort((a, b) => {
        if (a === "Undated") {
          return 1;
        }
        if (b === "Undated") {
          return -1;
        }
        return Number(b) - Number(a);
      });
    },
    hasActiveFilters(): boolean {
      return (
        this.selectedVenue !== "All" ||
        this.selectedTopic !== "All" ||
        this.selectedMaterial !== "All" ||
        this.selectedDuration !== "All" ||
        this.selectedAudienceSize !== "All" ||
        this.selectedAudienceGroup !== "All" ||
        this.selectedYear !== "All" ||
        this.selectedSort !== "date-desc"
      );
    },
    filteredAndSortedItems(): CatalogEntry[] {
      const collator = new Intl.Collator(undefined, { sensitivity: "base" });

      const filtered = this.catalogEntries.filter((entry) => {
        const venueMatch =
          this.selectedVenue === "All" || entry.venueTags.includes(this.selectedVenue);
        const topicMatch =
          this.selectedTopic === "All" || entry.topicTags.includes(this.selectedTopic);
        const materialMatch =
          this.selectedMaterial === "All" || entry.materialTag === this.selectedMaterial;
        const durationMatch =
          this.selectedDuration === "All" ||
          entry.durationCategory === this.selectedDuration;
        const audienceSizeMatch =
          this.selectedAudienceSize === "All" ||
          entry.audienceSizeCategory === this.selectedAudienceSize;
        const audienceGroupMatch =
          this.selectedAudienceGroup === "All" ||
          entry.audienceGroups.includes(this.selectedAudienceGroup);
        const yearMatch =
          this.selectedYear === "All" ||
          (this.selectedYear === "Undated"
            ? entry.displayDateIso === "1900-01-01"
            : entry.displayDateIso.startsWith(`${this.selectedYear}-`));
        return (
          venueMatch &&
          topicMatch &&
          materialMatch &&
          durationMatch &&
          audienceSizeMatch &&
          audienceGroupMatch &&
          yearMatch
        );
      });

      return filtered.sort((a, b) => {
        if (this.selectedSort === "date-asc") {
          return a.displayDateIso.localeCompare(b.displayDateIso);
        }
        if (this.selectedSort === "title-asc") {
          return collator.compare(a.displayTitle, b.displayTitle);
        }
        if (this.selectedSort === "title-desc") {
          return collator.compare(b.displayTitle, a.displayTitle);
        }
        return b.displayDateIso.localeCompare(a.displayDateIso);
      });
    },
  },
  methods: {
    clearTalkFilters() {
      this.selectedVenue = "All";
      this.selectedTopic = "All";
      this.selectedMaterial = "All";
      this.selectedDuration = "All";
      this.selectedAudienceSize = "All";
      this.selectedAudienceGroup = "All";
      this.selectedYear = "All";
      this.selectedSort = "date-desc";
    },
    parseTagFilterKind(raw: string): TalkTagFilterKind | null {
      if (
        raw === "material" ||
        raw === "venue" ||
        raw === "topic" ||
        raw === "duration" ||
        raw === "audienceSize" ||
        raw === "audienceGroup"
      ) {
        return raw;
      }
      return null;
    },
    applyRouteTagFilter() {
      const rawTag = this.$route.query.tag;
      const rawValue = this.$route.query.value;
      if (typeof rawTag !== "string" || typeof rawValue !== "string") {
        return;
      }

      const parsedKind = this.parseTagFilterKind(rawTag);
      if (!parsedKind || !rawValue.trim()) {
        return;
      }

      this.applyTalkTagFilter(parsedKind, rawValue.trim());
    },
    applyTalkTagFilter(
      kind: TalkTagFilterKind,
      value: string
    ) {
      if (kind === "material") {
        this.selectedMaterial = value;
        this.selectedVenue = "All";
        this.selectedTopic = "All";
        this.selectedDuration = "All";
        this.selectedAudienceSize = "All";
        this.selectedAudienceGroup = "All";
      } else if (kind === "venue") {
        this.selectedVenue = value;
        this.selectedMaterial = "All";
        this.selectedTopic = "All";
        this.selectedDuration = "All";
        this.selectedAudienceSize = "All";
        this.selectedAudienceGroup = "All";
      } else if (kind === "duration") {
        this.selectedDuration = value;
        this.selectedMaterial = "All";
        this.selectedVenue = "All";
        this.selectedTopic = "All";
        this.selectedAudienceSize = "All";
        this.selectedAudienceGroup = "All";
      } else if (kind === "audienceSize") {
        this.selectedAudienceSize = value;
        this.selectedMaterial = "All";
        this.selectedVenue = "All";
        this.selectedTopic = "All";
        this.selectedDuration = "All";
        this.selectedAudienceGroup = "All";
      } else if (kind === "audienceGroup") {
        this.selectedAudienceGroup = value;
        this.selectedMaterial = "All";
        this.selectedVenue = "All";
        this.selectedTopic = "All";
        this.selectedDuration = "All";
        this.selectedAudienceSize = "All";
      } else {
        this.selectedTopic = value;
        this.selectedMaterial = "All";
        this.selectedVenue = "All";
        this.selectedDuration = "All";
        this.selectedAudienceSize = "All";
        this.selectedAudienceGroup = "All";
      }

      this.selectedYear = "All";
      this.filtersOpen = true;
    },
    isTalkTagActive(
      kind: TalkTagFilterKind,
      value: string
    ): boolean {
      if (kind === "material") {
        return this.selectedMaterial === value;
      }
      if (kind === "venue") {
        return this.selectedVenue === value;
      }
      if (kind === "duration") {
        return this.selectedDuration === value;
      }
      if (kind === "audienceSize") {
        return this.selectedAudienceSize === value;
      }
      if (kind === "audienceGroup") {
        return this.selectedAudienceGroup === value;
      }
      return this.selectedTopic === value;
    },
    isPreviewOpen(id: string): boolean {
      return Boolean(this.previewVisibility[id]);
    },
    togglePreview(id: string) {
      this.previewVisibility[id] = !this.isPreviewOpen(id);
    },
  },
  watch: {
    "$route.query": {
      handler() {
        this.applyRouteTagFilter();
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

<style scoped>
#talks {
  padding: 0 16px 140px;
  font-size: var(--font-size-body-lg);
}

.talks-shell {
  display: grid;
  gap: 18px;
}

.talks-header {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 18px 22px;
}

.talks-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.talks-header p {
  margin: 8px 0 0;
  color: var(--page-text);
  opacity: 0.9;
  line-height: 1.45;
}

.talk-filters {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--surface-outline);
}

[data-theme="light"] .talk-filters {
  border-top-color: rgba(16, 36, 59, 0.24);
}

.filter-toggle {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: var(--page-text);
  font: inherit;
  line-height: 1;
}

.filter-toggle-title {
  font-family: var(--content-heading-font);
  font-size: var(--font-size-label);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.86;
}

.filter-toggle-state {
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: var(--font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.68;
  background: transparent;
}

.filter-panel {
  margin-top: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 7px;
  align-items: end;
}

.filter-control {
  display: grid;
  gap: 5px;
  min-width: 0;
  color: var(--page-text);
  font-weight: 600;
  font-size: var(--font-size-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.85;
}

.filter-control select {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 38px;
  border-radius: 999px;
  border: 1px solid var(--surface-outline);
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  background-size: 10px 6px;
  color: var(--page-text);
  padding: 7px 30px 7px 12px;
  font-size: var(--font-size-meta);
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.filter-control select:hover {
  border-color: rgba(80, 203, 255, 0.46);
  background-color: rgba(80, 203, 255, 0.06);
}

.filter-control select:focus-visible {
  outline: none;
  border-color: rgba(80, 203, 255, 0.72);
  box-shadow: 0 0 0 1px rgba(80, 203, 255, 0.25);
}

.filter-result {
  margin: 0;
  opacity: 0.72;
  font-size: var(--font-size-caption);
  letter-spacing: 0.03em;
}

.filter-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.filter-clear-btn {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  padding: 4px 11px;
  font-size: var(--font-size-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.16s ease, opacity 0.16s ease;
}

.filter-clear-btn:hover:not(:disabled) {
  background: var(--nav-hover-bg);
}

.filter-clear-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.talk-card {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
  overflow: visible;
}

.talk-card-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(250px, 31vw, 390px);
  gap: 6px;
  align-items: start;
}

.talk-card-layout > div {
  position: relative;
  z-index: 0;
}

.talk-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.talk-date {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: var(--font-size-body);
  font-weight: 750;
  letter-spacing: 0.01em;
}

.talk-card h2 {
  margin: 10px 0 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  position: relative;
  z-index: 1;
}

.talk-description {
  margin: 10px 0 0;
  line-height: 1.5;
  color: var(--page-text);
  opacity: 0.92;
}

.talk-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.talk-tag {
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px 11px;
  font-size: var(--font-size-body-sm);
  color: var(--page-text);
  appearance: none;
  -webkit-appearance: none;
  background: rgba(148, 163, 184, 0.12);
  cursor: pointer;
  line-height: 1.2;
  position: relative;
  z-index: 0;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.talk-tag::after {
  content: attr(data-category);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translate(-50%, 4px);
  border: 1px solid var(--tag-tooltip-border);
  border-radius: 7px;
  padding: 3px 7px;
  background: var(--tag-tooltip-bg);
  color: var(--tag-tooltip-text);
  box-shadow: 0 8px 18px rgba(8, 15, 31, 0.24);
  font-size: var(--font-size-micro);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
  z-index: 1001;
}

.talk-tag:hover {
  transform: translateY(-1px);
  z-index: 1000;
}

.talk-tag:hover::after,
.talk-tag:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.talk-tag:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(80, 203, 255, 0.35);
  z-index: 1000;
}

.talk-tag-active {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
}

.talk-tag-material {
  background: rgba(245, 158, 11, 0.18);
  --tag-tooltip-bg: rgba(245, 158, 11, 0.96);
  --tag-tooltip-border: rgba(161, 98, 7, 0.96);
  --tag-tooltip-text: #251401;
}

.talk-tag-venue {
  background: rgba(56, 189, 248, 0.16);
  --tag-tooltip-bg: rgba(56, 189, 248, 0.96);
  --tag-tooltip-border: rgba(2, 132, 199, 0.96);
  --tag-tooltip-text: #052634;
}

.talk-tag-topic {
  background: rgba(20, 184, 166, 0.16);
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

.talk-tag-duration {
  background: rgba(168, 85, 247, 0.16);
  --tag-tooltip-bg: rgba(168, 85, 247, 0.96);
  --tag-tooltip-border: rgba(147, 51, 234, 0.96);
  --tag-tooltip-text: #12031f;
}

.talk-tag-audience-size {
  background: rgba(249, 115, 22, 0.16);
  --tag-tooltip-bg: rgba(249, 115, 22, 0.96);
  --tag-tooltip-border: rgba(194, 65, 12, 0.96);
  --tag-tooltip-text: #2b0c01;
}

.talk-tag-audience-group {
  background: rgba(100, 116, 139, 0.18);
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(71, 85, 105, 0.96);
  --tag-tooltip-text: #f8fafc;
}

[data-theme="dark"] .talk-tag-material {
  background: rgba(245, 158, 11, 0.28);
  border-color: rgba(245, 158, 11, 0.62);
  color: #ffe7a8;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.98);
  --tag-tooltip-border: rgba(251, 191, 36, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .talk-tag-venue {
  background: rgba(56, 189, 248, 0.26);
  border-color: rgba(56, 189, 248, 0.6);
  color: #d3f4ff;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.98);
  --tag-tooltip-border: rgba(125, 211, 252, 0.98);
  --tag-tooltip-text: #041b25;
}

[data-theme="dark"] .talk-tag-topic {
  background: rgba(20, 184, 166, 0.26);
  border-color: rgba(20, 184, 166, 0.58);
  color: #d2fff4;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(45, 212, 191, 0.98);
  --tag-tooltip-text: #021413;
}

[data-theme="dark"] .talk-tag-duration {
  background: rgba(168, 85, 247, 0.26);
  border-color: rgba(168, 85, 247, 0.58);
  color: #ece4ff;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.98);
  --tag-tooltip-border: rgba(192, 132, 252, 0.98);
  --tag-tooltip-text: #11021f;
}

[data-theme="dark"] .talk-tag-audience-size {
  background: rgba(249, 115, 22, 0.26);
  border-color: rgba(249, 115, 22, 0.58);
  color: #ffe0c2;
  --tag-tooltip-bg: rgba(249, 115, 22, 0.98);
  --tag-tooltip-border: rgba(251, 146, 60, 0.98);
  --tag-tooltip-text: #200700;
}

[data-theme="dark"] .talk-tag-audience-group {
  background: rgba(100, 116, 139, 0.26);
  border-color: rgba(100, 116, 139, 0.58);
  color: #e4ebf4;
  --tag-tooltip-bg: rgba(100, 116, 139, 0.98);
  --tag-tooltip-border: rgba(148, 163, 184, 0.98);
  --tag-tooltip-text: #f8fafc;
}

.talk-actions {
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
  margin-top: 16px;
}

.talk-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--page-text);
  border: 1px solid var(--surface-outline);
  background: rgba(148, 163, 184, 0.07);
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 600;
  min-width: 0;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.16s ease, box-shadow 0.2s ease;
}

.talk-btn.primary {
  border-color: rgba(80, 203, 255, 0.5);
  background: rgba(80, 203, 255, 0.13);
}

.talk-btn:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(80, 203, 255, 0.45);
  box-shadow: 0 4px 12px rgba(8, 15, 31, 0.12);
  transform: translateY(-1px);
}

.talk-btn:focus-visible {
  outline: none;
  border-color: rgba(80, 203, 255, 0.78);
  box-shadow: 0 0 0 2px rgba(80, 203, 255, 0.24);
}

[data-theme="light"] .talk-btn {
  background: rgba(16, 36, 59, 0.04);
}

[data-theme="light"] .talk-btn.primary {
  background: rgba(80, 203, 255, 0.1);
}

.preview-shell {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-right: clamp(12px, 2.6vw, 24px);
}

.preview-toggle-inline {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: var(--page-text);
  opacity: 0.72;
  font-size: var(--font-size-micro);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 2px 0;
  line-height: 1;
}

.preview-toggle-inline:hover {
  opacity: 0.98;
  text-decoration: underline;
}

.preview-toggle-inline:focus-visible {
  outline: 1px solid var(--surface-outline);
  outline-offset: 3px;
  border-radius: 4px;
}

.talk-preview-frame {
  margin-top: 6px;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
  background: var(--toggle-bg);
}

.talk-preview-fallback {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--page-text);
  opacity: 0.85;
}

.talk-preview-fallback i {
  font-size: var(--font-size-card-title);
}

.empty-state h2 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
}

@media (max-width: 1320px) {
  .filter-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 1080px) {
  .filter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 500px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  #talks {
    padding: 0 10px 132px;
  }

  .talks-header,
  .talk-card {
    padding: 14px;
  }

  .talk-btn {
    width: 100%;
  }

  .talk-card-layout {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .preview-shell {
    padding-right: 0;
  }

  .preview-toggle-inline {
    align-self: flex-start;
  }

}
</style>
