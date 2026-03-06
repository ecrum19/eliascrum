<template>
  <section id="publications" class="w3-content w3-margin-top" style="max-width: min(1920px, 97vw)">
    <div class="work-layout">
      <work-toc :entries="tocEntries" />

      <div class="work-main">
        <section id="publications-overview" class="work-section">
          <header class="publications-header">
            <div class="publications-intro">
              <h1>Publications</h1>
              <p>
                Publications are shown from most recent to oldest, with short summaries and linked presentation material.
              </p>
              <p class="citation-update-note">
                Google Scholar citation counts last updated: <strong>{{ scholarCitationLastUpdatedLabel }}</strong>
              </p>
            </div>
            <div class="profile-links">
              <a
                class="profile-link scholar"
                :href="scholarProfileUrl"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Scholar"
                title="Google Scholar"
              >
                <img
                  class="profile-icon"
                  src="https://freepngimg.com/download/science/63222-google-scholar-doctor-science-university-philosophy-computer.png"
                  alt=""
                />
              </a>
              <a
                class="profile-link semantic"
                :href="semanticScholarUrl"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Semantic Scholar"
                title="Semantic Scholar"
              >
                <img
                  class="profile-icon"
                  src="https://api.iconify.design/academicons/semantic-scholar.svg?color=%23000"
                  alt=""
                />
              </a>
            </div>
          </header>
        </section>

        <section id="publications-content" class="work-section">
          <div class="work-section-block">
            <header class="work-section-header">
              <h2>Publications</h2>
              <p>Chronological list with filterable tags and expandable publication metadata.</p>
            </header>

            <section id="publications-filters" class="publication-filters">
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
                    <select v-model="selectedType">
                      <option value="All">All</option>
                      <option v-for="publicationType in availableTypeTags" :key="publicationType" :value="publicationType">
                        {{ publicationType }}
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
                    Showing {{ filteredAndSortedPublications.length }} of {{ publicationEntries.length }} publications.
                  </p>
                  <button
                    type="button"
                    class="filter-clear-btn"
                    :disabled="!hasActiveFilters"
                    @click="clearPublicationFilters"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </section>

            <div class="publications-list">
            <article
              v-for="publication in filteredAndSortedPublications"
              :key="publication.id"
              :id="publicationSectionId(publication.id)"
              class="publication-card"
            >
              <div class="publication-title-row">
                <h2 class="publication-title">
                  <a :href="publication.url" target="_blank" rel="noopener noreferrer">
                    {{ publication.title }}
                  </a>
                </h2>
                <span class="publication-date">{{ publication.year }}</span>
              </div>

              <p class="publication-authors">{{ publication.authors }}</p>
              <p class="publication-venue">{{ publication.venue }}</p>

              <div class="publication-tags">
                <button
                  type="button"
                  class="publication-tag publication-tag-type"
                  :class="{ 'publication-tag-active': isPublicationTagActive('type', publication.type) }"
                  data-category="Type"
                  @click="applyPublicationTagFilter('type', publication.type)"
                >
                  {{ publication.type }}
                </button>
                <button
                  type="button"
                  v-for="tag in publication.venueTags"
                  :key="`${publication.id}-venue-${tag}`"
                  class="publication-tag publication-tag-venue"
                  :class="{ 'publication-tag-active': isPublicationTagActive('venue', tag) }"
                  data-category="Venue"
                  @click="applyPublicationTagFilter('venue', tag)"
                >
                  {{ tag }}
                </button>
                <button
                  type="button"
                  v-for="tag in publication.topicTags"
                  :key="`${publication.id}-topic-${tag}`"
                  class="publication-tag publication-tag-topic"
                  :class="{ 'publication-tag-active': isPublicationTagActive('topic', tag) }"
                  data-category="Main Topic"
                  @click="applyPublicationTagFilter('topic', tag)"
                >
                  {{ tag }}
                </button>
              </div>

              <p class="publication-summary">{{ publication.summary }}</p>

              <button
                type="button"
                class="publication-expand-toggle"
                @click="togglePublicationExpanded(publication.id)"
              >
                {{ isPublicationExpanded(publication.id) ? "Hide Details" : "Show Details" }}
              </button>

              <div
                v-show="isPublicationExpanded(publication.id)"
                class="publication-expanded"
              >
                <section class="publication-expanded-block">
                  <button
                    type="button"
                    class="publication-subsection-toggle"
                    @click="togglePublicationSection(publication.id, 'abstract')"
                    :aria-expanded="isPublicationSectionExpanded(publication.id, 'abstract')"
                  >
                    <span class="publication-subsection-label">Abstract</span>
                    <span class="publication-subsection-state">
                      {{ isPublicationSectionExpanded(publication.id, "abstract") ? "Hide" : "Show" }}
                    </span>
                  </button>
                  <div
                    v-show="isPublicationSectionExpanded(publication.id, 'abstract')"
                    class="publication-subsection-content"
                  >
                    <p v-if="publication.abstract">{{ publication.abstract }}</p>
                    <p v-else class="publication-empty">No abstract is currently recorded for this item.</p>
                  </div>
                </section>

                <section class="publication-expanded-block">
                  <button
                    type="button"
                    class="publication-subsection-toggle"
                    @click="togglePublicationSection(publication.id, 'details')"
                    :aria-expanded="isPublicationSectionExpanded(publication.id, 'details')"
                  >
                    <span class="publication-subsection-label">Additional Details</span>
                    <span class="publication-subsection-state">
                      {{ isPublicationSectionExpanded(publication.id, "details") ? "Hide" : "Show" }}
                    </span>
                  </button>
                  <div
                    v-show="isPublicationSectionExpanded(publication.id, 'details')"
                    class="publication-subsection-content"
                  >
                    <ul class="publication-details-list">
                      <li
                        v-for="(detail, detailIndex) in publication.details"
                        :key="`${publication.id}-detail-${detailIndex}`"
                      >
                        <span class="detail-label">{{ detail.label }}:</span>
                        <a
                          v-if="detail.href"
                          :href="detail.href"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {{ detail.value }}
                        </a>
                        <span v-else>{{ detail.value }}</span>
                      </li>
                      <li>
                        <span class="detail-label">{{ metricLabel(publication) }}:</span>
                        <span>{{ metricValue(publication) }}</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section class="publication-expanded-block">
                  <button
                    type="button"
                    class="publication-subsection-toggle"
                    @click="togglePublicationSection(publication.id, 'bibtex')"
                    :aria-expanded="isPublicationSectionExpanded(publication.id, 'bibtex')"
                  >
                    <span class="publication-subsection-label">BibTeX</span>
                    <span class="publication-subsection-state">
                      {{ isPublicationSectionExpanded(publication.id, "bibtex") ? "Hide" : "Show" }}
                    </span>
                  </button>
                  <div
                    v-show="isPublicationSectionExpanded(publication.id, 'bibtex')"
                    class="publication-subsection-content publication-bibtex-shell"
                  >
                    <button
                      type="button"
                      class="bibtex-copy-btn"
                      :aria-label="
                        isBibtexCopied(publication.id)
                          ? 'BibTeX copied to clipboard'
                          : 'Copy BibTeX citation to clipboard'
                      "
                      :title="
                        isBibtexCopied(publication.id)
                          ? 'Copied'
                          : 'Copy BibTeX citation'
                      "
                      @click="copyBibtexCitation(publication.id, publication.bibtex)"
                    >
                      <i class="fa" :class="isBibtexCopied(publication.id) ? 'fa-check' : 'fa-files-o'"></i>
                    </button>
                    <pre class="publication-bibtex"><code>{{ publication.bibtex }}</code></pre>
                  </div>
                </section>
              </div>

              <div
                v-if="publication.resolvedPresentationLinks.length"
                class="publication-links"
              >
                <template
                  v-for="link in publication.resolvedPresentationLinks"
                  :key="link.key"
                >
                  <router-link
                    v-if="link.to"
                    :to="link.to"
                    class="publication-action-btn primary"
                  >
                    {{ link.label }}
                  </router-link>
                  <a
                    v-else
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="publication-action-btn"
                  >
                    {{ link.label }}
                  </a>
                </template>
              </div>
            </article>

            <article v-if="filteredAndSortedPublications.length === 0" class="publication-card empty-state">
              <h2>No Publications Match Current Filters</h2>
              <p>Try clearing one or more filters to see more entries.</p>
            </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  PUBLICATION_TYPE_TAG_OPTIONS,
  publications,
  publicationPresentationLinksById,
  scholarProfileUrl,
  semanticScholarUrl,
  type PublicationPresentationLink,
  type Publication,
  type PublicationTypeTag,
} from "../data/publicationsData";
import {
  scholarCitationLastUpdatedIso,
  scholarCitationsByPublicationId,
  publicationDownloadsByPublicationId,
} from "../data/scholarCitations";
import { getTalkViewBySlug } from "../data/talkCatalog";
import { TOPIC_TAG_OPTIONS, VENUE_TAG_OPTIONS } from "../data/talkMetadata";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import WorkToc from "./WorkToc.vue";

interface ResolvedPresentationLink {
  key: string;
  label: string;
  to?: string;
  href?: string;
}

interface PublicationView extends Publication {
  resolvedPresentationLinks: ResolvedPresentationLink[];
}

type PublicationDetailSection = "abstract" | "details" | "bibtex";
type PublicationTagFilterKind = "type" | "venue" | "topic";

interface WorkTocEntry {
  id: string;
  label: string;
}

const DEFAULT_SECTION_EXPANDED: Record<PublicationDetailSection, boolean> = {
  abstract: true,
  details: false,
  bibtex: false,
};

function resolvePublicationPresentationLinks(
  publicationId: string,
  links: PublicationPresentationLink[]
): ResolvedPresentationLink[] {
  return links.reduce<ResolvedPresentationLink[]>((acc, link, index) => {
    if (link.kind === "talk") {
      const talk = getTalkViewBySlug(link.talkSlug);
      if (!talk) {
        return acc;
      }

      acc.push({
        key: `${publicationId}:talk:${link.talkSlug}:${index}`,
        label: link.label ?? `Related Presentation: ${talk.displayTitle}`,
        to: `/talks/${talk.slug}`,
      });
      return acc;
    }

    acc.push({
      key: `${publicationId}:file:${link.filePath}:${index}`,
      label: link.label ?? "Open Related Presentation Material",
      href: resolvePublicAssetPath(link.filePath),
    });
    return acc;
  }, []);
}

export default defineComponent({
  name: "MyPublications",
  components: {
    WorkToc,
  },
  data() {
    return {
      publications,
      publicationPresentationLinksById,
      scholarProfileUrl,
      semanticScholarUrl,
      filtersOpen: false,
      selectedVenue: "All",
      selectedTopic: "All",
      selectedType: "All",
      selectedYear: "All",
      selectedSort: "date-desc",
      expandedPublications: {} as Record<string, boolean>,
      expandedPublicationSections: {} as Record<string, boolean>,
      copiedBibtexByPublicationId: {} as Record<string, boolean>,
      copyResetTimers: {} as Record<string, ReturnType<typeof setTimeout> | undefined>,
      scholarCitationLastUpdatedIso,
      scholarCitationsByPublicationId,
      publicationDownloadsByPublicationId,
    };
  },
  computed: {
    tocEntries(): WorkTocEntry[] {
      const publicationEntries = this.filteredAndSortedPublications.map((publication) => ({
        id: this.publicationSectionId(publication.id),
        label: publication.title,
      }));

      return [
        { id: "publications-overview", label: "Overview" },
        { id: "publications-filters", label: "Filters" },
        ...publicationEntries,
      ];
    },
    publicationEntries(): PublicationView[] {
      return this.publications.map((publication) => ({
        ...publication,
        resolvedPresentationLinks: resolvePublicationPresentationLinks(
          publication.id,
          this.publicationPresentationLinksById[publication.id] ?? []
        ),
      }));
    },
    availableVenueTags(): string[] {
      const tags = new Set<string>(VENUE_TAG_OPTIONS);
      this.publicationEntries.forEach((publication) => {
        publication.venueTags.forEach((tag) => tags.add(String(tag)));
      });
      return Array.from(tags).sort((a, b) => a.localeCompare(b));
    },
    availableTopicTags(): string[] {
      const tags = new Set<string>(TOPIC_TAG_OPTIONS);
      this.publicationEntries.forEach((publication) => {
        publication.topicTags.forEach((tag) => tags.add(String(tag)));
      });
      return Array.from(tags).sort((a, b) => a.localeCompare(b));
    },
    availableTypeTags(): PublicationTypeTag[] {
      const tags = new Set<PublicationTypeTag>(PUBLICATION_TYPE_TAG_OPTIONS);
      this.publicationEntries.forEach((publication) => {
        tags.add(publication.type);
      });
      return Array.from(tags).sort((a, b) => String(a).localeCompare(String(b)));
    },
    availableYears(): string[] {
      const years = new Set<string>();
      this.publicationEntries.forEach((publication) => {
        if (!publication.sortDate) {
          years.add("Undated");
          return;
        }

        const year = publication.sortDate.slice(0, 4);
        years.add(year || "Undated");
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
        this.selectedType !== "All" ||
        this.selectedYear !== "All" ||
        this.selectedSort !== "date-desc"
      );
    },
    filteredAndSortedPublications(): PublicationView[] {
      const collator = new Intl.Collator(undefined, { sensitivity: "base" });

      const filtered = this.publicationEntries.filter((publication) => {
        const venueMatch =
          this.selectedVenue === "All" || publication.venueTags.includes(this.selectedVenue);
        const topicMatch =
          this.selectedTopic === "All" || publication.topicTags.includes(this.selectedTopic);
        const typeMatch =
          this.selectedType === "All" || publication.type === this.selectedType;
        const yearMatch =
          this.selectedYear === "All" ||
          (this.selectedYear === "Undated"
            ? !publication.sortDate
            : publication.sortDate.startsWith(`${this.selectedYear}-`));

        return venueMatch && topicMatch && typeMatch && yearMatch;
      });

      return filtered.sort((a, b) => {
        if (this.selectedSort === "date-asc") {
          return a.sortDate.localeCompare(b.sortDate);
        }
        if (this.selectedSort === "title-asc") {
          return collator.compare(a.title, b.title);
        }
        if (this.selectedSort === "title-desc") {
          return collator.compare(b.title, a.title);
        }
        return b.sortDate.localeCompare(a.sortDate);
      });
    },
    scholarCitationLastUpdatedLabel(): string {
      if (!this.scholarCitationLastUpdatedIso) {
        return "Not yet updated";
      }

      const date = new Date(this.scholarCitationLastUpdatedIso);
      if (Number.isNaN(date.getTime())) {
        return this.scholarCitationLastUpdatedIso;
      }

      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  },
  methods: {
    publicationSectionId(publicationId: string): string {
      return `publication-${publicationId}`;
    },
    publicationSectionKey(
      publicationId: string,
      section: PublicationDetailSection
    ): string {
      return `${publicationId}:${section}`;
    },
    isPublicationExpanded(publicationId: string): boolean {
      return Boolean(this.expandedPublications[publicationId]);
    },
    togglePublicationExpanded(publicationId: string) {
      this.expandedPublications[publicationId] = !this.isPublicationExpanded(publicationId);
    },
    clearPublicationFilters() {
      this.selectedVenue = "All";
      this.selectedTopic = "All";
      this.selectedType = "All";
      this.selectedYear = "All";
      this.selectedSort = "date-desc";
    },
    applyPublicationTagFilter(
      kind: PublicationTagFilterKind,
      value: string
    ) {
      if (kind === "type") {
        this.selectedType = value;
        this.selectedVenue = "All";
        this.selectedTopic = "All";
      } else if (kind === "venue") {
        this.selectedVenue = value;
        this.selectedType = "All";
        this.selectedTopic = "All";
      } else {
        this.selectedTopic = value;
        this.selectedType = "All";
        this.selectedVenue = "All";
      }

      this.selectedYear = "All";
      this.filtersOpen = true;
    },
    isPublicationTagActive(
      kind: PublicationTagFilterKind,
      value: string
    ): boolean {
      if (kind === "type") {
        return this.selectedType === value;
      }
      if (kind === "venue") {
        return this.selectedVenue === value;
      }
      return this.selectedTopic === value;
    },
    isPublicationSectionExpanded(
      publicationId: string,
      section: PublicationDetailSection
    ): boolean {
      const key = this.publicationSectionKey(publicationId, section);
      if (typeof this.expandedPublicationSections[key] === "boolean") {
        return this.expandedPublicationSections[key];
      }
      return DEFAULT_SECTION_EXPANDED[section];
    },
    togglePublicationSection(
      publicationId: string,
      section: PublicationDetailSection
    ) {
      const key = this.publicationSectionKey(publicationId, section);
      this.expandedPublicationSections[key] =
        !this.isPublicationSectionExpanded(publicationId, section);
    },
    isBibtexCopied(publicationId: string): boolean {
      return Boolean(this.copiedBibtexByPublicationId[publicationId]);
    },
    async copyBibtexCitation(publicationId: string, bibtex: string) {
      const setCopiedState = () => {
        this.copiedBibtexByPublicationId[publicationId] = true;
        const existingTimer = this.copyResetTimers[publicationId];
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        this.copyResetTimers[publicationId] = setTimeout(() => {
          this.copiedBibtexByPublicationId[publicationId] = false;
          this.copyResetTimers[publicationId] = undefined;
        }, 1800);
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(bibtex);
          setCopiedState();
          return;
        }
      } catch {
        // Fallback path below.
      }

      const textarea = document.createElement("textarea");
      textarea.value = bibtex;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) {
        setCopiedState();
      }
    },
    citationCountLabel(publicationId: string): string {
      const count = this.scholarCitationsByPublicationId[publicationId];
      if (count === null || typeof count === "undefined") {
        return "N/A";
      }
      return String(count);
    },
    downloadCountLabel(publicationId: string): string {
      const count = this.publicationDownloadsByPublicationId[publicationId];
      if (count === null || typeof count === "undefined") {
        return "N/A";
      }
      return String(count);
    },
    metricLabel(publication: Publication): string {
      if (publication.type === "Thesis") {
        return "Loyola eCommons Downloads";
      }
      return "Google Scholar Citations";
    },
    metricValue(publication: Publication): string {
      if (publication.type === "Thesis") {
        return this.downloadCountLabel(publication.id);
      }
      return this.citationCountLabel(publication.id);
    },
  },
  beforeUnmount() {
    Object.values(this.copyResetTimers).forEach((timer) => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  },
});
</script>

<style scoped>
#publications {
  --work-content-max: 100%;
  padding: 0 12px 118px;
  font-size: var(--font-size-body-lg);
}

.work-layout {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.work-main {
  min-width: 0;
  display: grid;
  gap: 20px;
}

.work-section {
  min-width: 0;
  display: grid;
  gap: 12px;
  scroll-margin-top: 92px;
}

.work-section-block {
  max-width: var(--work-content-max);
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(80, 203, 255, 0.08), rgba(45, 212, 191, 0.04));
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 18px;
  display: grid;
  gap: 14px;
}

[data-theme="light"] .work-section-block {
  background: linear-gradient(180deg, rgba(80, 203, 255, 0.12), rgba(16, 36, 59, 0.05));
}

#publications-overview {
  margin-bottom: 2px;
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

.publications-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.publications-header p {
  margin: 6px 0 0;
  color: var(--page-text);
  opacity: 0.88;
  font-size: var(--font-size-body-xl);
}

.citation-update-note {
  margin: 6px 0 0;
  opacity: 0.76;
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
  transition: transform 0.18s ease, background-color 0.18s ease;
}

.profile-link:hover {
  transform: translateY(-1px);
  background: var(--nav-hover-bg);
}

.profile-link.scholar {
  box-shadow: inset 0 0 0 1px rgba(80, 203, 255, 0.35);
}

.profile-link.semantic {
  box-shadow: inset 0 0 0 1px rgba(45, 212, 191, 0.35);
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

.work-section-header {
  margin: 0;
}

.work-section-header h2 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  font-weight: 600;
}

.work-section-header p {
  margin: 5px 0 0;
  color: var(--page-text);
  opacity: 0.8;
  font-size: var(--font-size-body);
}

.publication-filters {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
  padding: 8px 10px;
}

[data-theme="light"] .publication-filters {
  background: rgba(16, 36, 59, 0.035);
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
  margin-top: 9px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 7px;
}

.filter-control {
  display: grid;
  gap: 4px;
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
  border-radius: 999px;
  border: 1px solid var(--surface-outline);
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  background-size: 10px 6px;
  color: var(--page-text);
  padding: 6px 30px 6px 10px;
  font-size: var(--font-size-meta);
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
  margin: 0;
  opacity: 0.72;
  font-size: var(--font-size-caption);
  letter-spacing: 0.03em;
}

.filter-footer {
  margin-top: 8px;
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
  padding: 3px 10px;
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

.publications-list {
  display: grid;
  gap: 16px;
}

.publication-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--surface-outline);
  border-radius: 12px;
  padding: 12px 14px;
}

[data-theme="light"] .publication-card {
  background: rgba(255, 255, 255, 0.52);
}

.publication-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.publication-date {
  font-weight: 700;
  color: var(--page-text);
  opacity: 0.9;
}

.publication-title {
  margin: 0;
  font-size: var(--font-size-card-title);
  line-height: 1.35;
}

.publication-title a {
  color: var(--link-color);
  text-decoration: none;
}

.publication-title a:hover {
  text-decoration: underline;
}

.publication-authors {
  margin: 8px 0 0;
  color: var(--page-text);
  opacity: 0.95;
  line-height: 1.5;
  font-size: var(--font-size-body-lg);
}

.publication-venue {
  margin: 4px 0 0;
  color: var(--page-text);
  opacity: 0.82;
  font-size: var(--font-size-body);
}

.publication-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.publication-tag {
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: var(--font-size-body-sm);
  color: var(--page-text);
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  line-height: 1.2;
  position: relative;
  z-index: 0;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.publication-tag::after {
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

.publication-tag:hover {
  transform: translateY(-1px);
  z-index: 1000;
}

.publication-tag:hover::after,
.publication-tag:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.publication-tag:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(80, 203, 255, 0.35);
  z-index: 1000;
}

.publication-tag-active {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
}

.publication-tag-type {
  background: rgba(244, 208, 63, 0.16);
  --tag-tooltip-bg: rgba(244, 208, 63, 0.96);
  --tag-tooltip-border: rgba(202, 138, 4, 0.96);
  --tag-tooltip-text: #281b00;
}

.publication-tag-venue {
  background: rgba(80, 203, 255, 0.14);
  --tag-tooltip-bg: rgba(80, 203, 255, 0.96);
  --tag-tooltip-border: rgba(14, 165, 233, 0.96);
  --tag-tooltip-text: #052634;
}

.publication-tag-topic {
  background: rgba(45, 212, 191, 0.14);
  --tag-tooltip-bg: rgba(45, 212, 191, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

[data-theme="dark"] .publication-tag-type {
  background: rgba(244, 208, 63, 0.28);
  border-color: rgba(244, 208, 63, 0.62);
  color: #ffe7a8;
  --tag-tooltip-bg: rgba(244, 208, 63, 0.98);
  --tag-tooltip-border: rgba(250, 204, 21, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .publication-tag-venue {
  background: rgba(80, 203, 255, 0.26);
  border-color: rgba(80, 203, 255, 0.6);
  color: #d3f4ff;
  --tag-tooltip-bg: rgba(80, 203, 255, 0.98);
  --tag-tooltip-border: rgba(125, 211, 252, 0.98);
  --tag-tooltip-text: #041b25;
}

[data-theme="dark"] .publication-tag-topic {
  background: rgba(45, 212, 191, 0.26);
  border-color: rgba(45, 212, 191, 0.58);
  color: #d2fff4;
  --tag-tooltip-bg: rgba(45, 212, 191, 0.98);
  --tag-tooltip-border: rgba(45, 212, 191, 0.98);
  --tag-tooltip-text: #021413;
}

.publication-summary {
  margin: 10px 0 0;
  padding-left: 12px;
  border-left: 3px solid rgba(80, 203, 255, 0.45);
  color: var(--page-text);
  line-height: 1.6;
  font-size: var(--font-size-body-lg);
}

[data-theme="light"] .publication-summary {
  border-left-color: rgba(13, 79, 136, 0.4);
}

.publication-expand-toggle {
  margin-top: 8px;
  display: block;
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--page-text);
  opacity: 0.74;
  font-size: var(--font-size-caption);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.publication-expand-toggle:hover {
  opacity: 1;
  text-decoration: underline;
}

.publication-expand-toggle:focus-visible {
  outline: 1px solid var(--surface-outline);
  outline-offset: 4px;
  border-radius: 4px;
}

.publication-expanded {
  margin-top: 9px;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.publication-expanded-block {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--surface-outline);
  border-radius: 8px;
  padding: 8px 10px;
  min-width: 0;
  overflow-x: hidden;
}

[data-theme="light"] .publication-expanded-block {
  background: rgba(16, 36, 59, 0.035);
}

.publication-subsection-toggle {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--page-text);
  padding: 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  cursor: pointer;
}

.publication-subsection-label {
  margin: 0;
  font-size: var(--font-size-meta);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.82;
}

.publication-subsection-state {
  font-size: var(--font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.72;
}

.publication-subsection-content {
  margin-top: 6px;
}

.publication-expanded-block p {
  margin: 0;
  line-height: 1.55;
}

.publication-empty {
  opacity: 0.78;
}

.publication-details-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 5px;
}

.publication-details-list li {
  line-height: 1.45;
}

.publication-details-list a {
  color: var(--link-color);
}

.detail-label {
  font-weight: 700;
  margin-right: 6px;
}

.publication-bibtex {
  margin: 0;
  overflow-x: auto;
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: var(--font-size-label);
  line-height: 1.4;
  padding: 7px 34px 7px 7px;
  border-radius: 8px;
  border: 1px solid var(--surface-outline);
  background: rgba(0, 0, 0, 0.18);
}

[data-theme="light"] .publication-bibtex {
  background: rgba(16, 36, 59, 0.08);
}

.publication-bibtex code {
  white-space: inherit;
  overflow-wrap: inherit;
  word-break: inherit;
}

.publication-bibtex-shell {
  position: relative;
}

.bibtex-copy-btn {
  position: absolute;
  top: 7px;
  right: 5px;
  width: 24px;
  height: 24px;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  font-size: var(--font-size-caption);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.82;
  transition: background-color 0.18s ease, opacity 0.18s ease;
}

.bibtex-copy-btn:hover {
  opacity: 1;
  background: var(--nav-hover-bg);
}

.publication-links {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 10px;
}

.publication-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--page-text);
  border: 1px solid var(--surface-outline);
  background: transparent;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: var(--font-size-body);
  min-width: 0;
  line-height: 1.2;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.publication-action-btn.primary {
  border-color: rgba(80, 203, 255, 0.42);
  background: rgba(80, 203, 255, 0.08);
}

.publication-action-btn:hover {
  background: var(--nav-hover-bg);
}

.empty-state h2,
.empty-state h3 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
}

@media (max-width: 1080px) {
  .work-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .work-main {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  #publications {
    padding: 0 8px 118px;
  }

  .work-section-block {
    padding: 10px 11px;
    gap: 10px;
  }

  .publications-header,
  .publication-card,
  .publication-filters {
    padding: 12px;
  }

  .publications-intro {
    padding-right: 0;
  }

  .profile-links {
    position: static;
    gap: 10px;
  }

  .profile-link {
    width: 44px;
    height: 44px;
  }

  .filter-footer {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .publication-action-btn {
    width: 100%;
  }
}
</style>
