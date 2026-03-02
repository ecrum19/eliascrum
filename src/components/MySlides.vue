<template>
  <section id="talks" class="w3-content w3-margin-top" style="max-width: 1400px">
    <div class="talks-shell">
      <header class="talks-header">
        <h1>Talks and Posters</h1>
        <p>
          Slides and posters are listed together for quick scanning, with metadata tags and optional previews.
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
            <p class="filter-result">
              Showing {{ filteredAndSortedItems.length }} of {{ catalogEntries.length }} items.
            </p>
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
              <span class="talk-date">{{ item.displayDateLabel }}</span>
              <span class="talk-file">{{ item.sourceFile }}</span>
            </div>

            <h2>{{ item.displayTitle }}</h2>
            <p class="talk-description">{{ item.description }}</p>

            <div class="talk-tags">
              <span class="talk-tag talk-tag-material">{{ item.materialTag }}</span>
              <span
                v-for="tag in item.venueTags"
                :key="`${item.id}-${tag}`"
                class="talk-tag talk-tag-venue"
              >
                {{ tag }}
              </span>
              <span
                v-for="tag in item.topicTags"
                :key="`${item.id}-${tag}`"
                class="talk-tag talk-tag-topic"
              >
                {{ tag }}
              </span>
            </div>

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
import { getTalkViewEntries, type TalkViewEntry } from "../data/talkCatalog";
import { TOPIC_TAG_OPTIONS, VENUE_TAG_OPTIONS } from "../data/talkMetadata";
import {
  getRelatedPublicationLinksForTalkSlug,
  getRelatedPublicationLinksForPresentationFile,
  type ResolvedPublicationLink,
} from "../data/publicationsData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";

type MaterialTypeTag = "Slides" | "Poster";

interface CatalogEntry {
  id: string;
  displayTitle: string;
  description: string;
  displayDateIso: string;
  displayDateLabel: string;
  sourceFile: string;
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

function sourceFileFromPath(filePath: string): string {
  const segments = filePath.split("/");
  return decodeURIComponent(segments[segments.length - 1] || filePath);
}

export default defineComponent({
  name: "MySlides",
  data() {
    return {
      filtersOpen: false,
      selectedVenue: "All",
      selectedTopic: "All",
      selectedMaterial: "All",
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
          ? this.talkEntries.find((talk) => talk.slug === "pengquin-eswc-2024")
          : undefined;

        return {
          id: `poster:${poster.slug}`,
          displayTitle: poster.title,
          description: linkedTalk
            ? "Poster linked to the ESWC 2024 slide deck."
            : "Poster presentation file.",
          displayDateIso: linkedTalk?.displayDateIso ?? "1900-01-01",
          displayDateLabel: linkedTalk?.displayDateLabel ?? "Undated",
          sourceFile: sourceFileFromPath(poster.path),
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
        description: talk.description,
        displayDateIso: talk.displayDateIso,
        displayDateLabel: talk.displayDateLabel,
        sourceFile: talk.sourceFile,
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
    filteredAndSortedItems(): CatalogEntry[] {
      const collator = new Intl.Collator(undefined, { sensitivity: "base" });

      const filtered = this.catalogEntries.filter((entry) => {
        const venueMatch =
          this.selectedVenue === "All" || entry.venueTags.includes(this.selectedVenue);
        const topicMatch =
          this.selectedTopic === "All" || entry.topicTags.includes(this.selectedTopic);
        const materialMatch =
          this.selectedMaterial === "All" || entry.materialTag === this.selectedMaterial;
        const yearMatch =
          this.selectedYear === "All" ||
          (this.selectedYear === "Undated"
            ? entry.displayDateIso === "1900-01-01"
            : entry.displayDateIso.startsWith(`${this.selectedYear}-`));
        return venueMatch && topicMatch && materialMatch && yearMatch;
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
    isPreviewOpen(id: string): boolean {
      return Boolean(this.previewVisibility[id]);
    },
    togglePreview(id: string) {
      this.previewVisibility[id] = !this.isPreviewOpen(id);
    },
  },
});
</script>

<style scoped>
#talks {
  padding: 0 16px 140px;
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
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.86;
}

.filter-toggle-state {
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: 0.72rem;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 9px;
}

.filter-control {
  display: grid;
  gap: 5px;
  color: var(--page-text);
  font-weight: 600;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.85;
}

.filter-control select {
  appearance: none;
  -webkit-appearance: none;
  border-radius: 999px;
  border: 1px solid var(--surface-outline);
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  background-size: 10px 6px;
  color: var(--page-text);
  padding: 7px 30px 7px 12px;
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
  cursor: pointer;
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
  margin: 10px 0 0;
  opacity: 0.72;
  font-size: 0.78rem;
  letter-spacing: 0.03em;
}

.talk-card {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
}

.talk-card-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(250px, 31vw, 390px);
  gap: 6px;
  align-items: start;
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
  padding: 2px 10px;
  font-size: 0.85rem;
  font-weight: 700;
}

.talk-file {
  opacity: 0.75;
  font-size: 0.9rem;
}

.talk-card h2 {
  margin: 10px 0 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
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
}

.talk-tag {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.82rem;
  color: var(--page-text);
}

.talk-tag-material {
  background: rgba(244, 208, 63, 0.16);
}

.talk-tag-venue {
  background: rgba(80, 203, 255, 0.14);
}

.talk-tag-topic {
  background: rgba(45, 212, 191, 0.14);
}

[data-theme="dark"] .talk-tag-material {
  background: rgba(244, 208, 63, 0.28);
  border-color: rgba(244, 208, 63, 0.62);
  color: #ffe7a8;
}

[data-theme="dark"] .talk-tag-venue {
  background: rgba(80, 203, 255, 0.26);
  border-color: rgba(80, 203, 255, 0.6);
  color: #d3f4ff;
}

[data-theme="dark"] .talk-tag-topic {
  background: rgba(45, 212, 191, 0.26);
  border-color: rgba(45, 212, 191, 0.58);
  color: #d2fff4;
}

.talk-actions {
  display: flex;
  flex-wrap: wrap;
  row-gap: 12px;
  column-gap: 22px;
  margin-top: 16px;
}

.talk-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--page-text);
  border: 1px solid var(--surface-outline);
  background: transparent;
  border-radius: 999px;
  padding: 7px 14px;
  font-weight: 600;
  min-width: 0;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.talk-btn.primary {
  border-color: rgba(80, 203, 255, 0.42);
  background: rgba(80, 203, 255, 0.08);
}

.talk-btn:hover {
  background: var(--nav-hover-bg);
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
  font-size: 0.72rem;
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
  font-size: 2rem;
}

.empty-state h2 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
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
