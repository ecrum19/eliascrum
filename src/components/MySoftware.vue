<template>
  <work-page-layout
    id="software-page"
    :toc-entries="tocEntries"
    max-width="min(1920px, 97vw)"
    page-padding="0 12px 118px"
  >
    <section id="software-overview" class="work-section">
      <header class="software-header">
        <h1>Software</h1>
        <p class="page-subheader">Software platforms, tooling, web resources, and technical specifications.</p>

        <section id="software-filters" class="software-filters">
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
                Section
                <select v-model="selectedSection">
                  <option value="All">All</option>
                  <option v-for="section in availableSections" :key="section" :value="section">
                    {{ section }}
                  </option>
                </select>
              </label>

                  <label class="filter-control">
                    Type
                    <select v-model="selectedType">
                      <option value="All">All</option>
                      <option v-for="type in availableTypes" :key="type" :value="type">
                        {{ type }}
                      </option>
                    </select>
                  </label>

                  <label class="filter-control">
                    Purpose
                    <select v-model="selectedPurpose">
                      <option value="All">All</option>
                      <option v-for="purpose in availablePurposes" :key="purpose" :value="purpose">
                        {{ purpose }}
                      </option>
                    </select>
                  </label>

                  <label class="filter-control">
                    Main Topic
                    <select v-model="selectedTopic">
                      <option value="All">All</option>
                      <option v-for="topic in availableTopics" :key="topic" :value="topic">
                        {{ topic }}
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
                Showing {{ filteredSoftwareEntries.length }} of {{ softwareEntries.length }} software entries.
              </p>
              <button
                type="button"
                class="filter-clear-btn"
                :disabled="!hasActiveFilters"
                @click="clearSoftwareFilters"
              >
                Clear
              </button>
            </div>
          </div>
        </section>
      </header>
    </section>

    <section id="software-content" class="work-section">
      <template v-for="section in displayedSections" :key="section.id">
        <work-section-block :id="softwareBlockId(section.id)">
          <header class="work-section-header">
            <h2>{{ section.title }}</h2>
            <p>{{ section.description }}</p>
          </header>

          <div class="software-list">
            <article
              v-for="project in section.entries"
              :id="softwareSectionId(project.id)"
              :key="project.id"
              class="software-card toc-anchor"
            >
                  <div class="software-title-row">
                    <h3 class="software-title">
                      <router-link :to="softwareDetailRoute(project)">
                        {{ project.title }}
                      </router-link>
                    </h3>
                    <button
                      type="button"
                      class="software-year"
                      :class="{ 'software-year-active': isSoftwareYearActive(project) }"
                      data-category="Date"
                      @click="applySoftwareYearFilter(project)"
                    >
                      {{ project.year }}
                    </button>
                  </div>

                  <div class="software-tags">
                    <button
                      type="button"
                      class="software-tag software-tag-type"
                      :class="{ 'software-tag-active': isSoftwareTagActive('type', project.type) }"
                      data-category="Type"
                      @click="applySoftwareTagFilter('type', project.type)"
                    >
                      {{ project.type }}
                    </button>
                    <button
                      type="button"
                      class="software-tag software-tag-purpose"
                      :class="{ 'software-tag-active': isSoftwareTagActive('purpose', project.purpose) }"
                      data-category="Purpose"
                      @click="applySoftwareTagFilter('purpose', project.purpose)"
                    >
                      {{ project.purpose }}
                    </button>
                    <button
                      v-for="topic in project.mainTopics"
                      :key="`${project.id}-${topic}`"
                      type="button"
                      class="software-tag software-tag-topic"
                      :class="{ 'software-tag-active': isSoftwareTagActive('topic', topic) }"
                      data-category="Main Topic"
                      @click="applySoftwareTagFilter('topic', topic)"
                    >
                      {{ topic }}
                    </button>
                  </div>

                  <p class="software-summary">{{ project.summary }}</p>
                  <p v-if="softwareReleaseText(project)" class="software-release">
                    Latest release:
                    <a
                      v-if="softwareReleaseLink(project)"
                      :href="normalizeLinkUrl(softwareReleaseLink(project) || '')"
                      :target="linkTarget(softwareReleaseLink(project) || '')"
                      :rel="linkRel(softwareReleaseLink(project) || '')"
                    >
                      {{ softwareReleaseText(project) }}
                    </a>
                    <span v-else>{{ softwareReleaseText(project) }}</span>
                  </p>
                  <p v-if="softwareReleaseDateText(project)" class="software-release-date">
                    Latest release date: {{ softwareReleaseDateText(project) }}
                  </p>

                  <div class="software-links">
                    <router-link :to="softwareDetailRoute(project)" class="software-action-btn btn-detail">
                      Show Details
                    </router-link>
                    <a
                      v-if="project.repositoryUrl"
                      :href="normalizeLinkUrl(project.repositoryUrl)"
                      :target="linkTarget(project.repositoryUrl)"
                      :rel="linkRel(project.repositoryUrl)"
                      class="software-action-btn btn-external"
                    >
                      To Git Repo
                    </a>
                    <a
                      v-if="project.webUrl"
                      :href="normalizeLinkUrl(project.webUrl)"
                      :target="linkTarget(project.webUrl)"
                      :rel="linkRel(project.webUrl)"
                      class="software-action-btn btn-external"
                    >
                      To Web Page
                    </a>
                  </div>
            </article>
          </div>
        </work-section-block>
      </template>

      <work-section-block v-if="displayedSections.length === 0" :anchor="false">
        <article class="software-card empty-state">
          <h3>No Software Entries Yet</h3>
          <p>Add entries in <code>src/data/softwareData.ts</code> to populate this section.</p>
        </article>
      </work-section-block>
    </section>
  </work-page-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  getSoftwarePagePath,
  softwareSections,
  type SoftwareEntry,
  type SoftwareSection,
} from "../data/softwareData";
import { softwareReleasesBySoftwareId, type SoftwareReleaseInfo } from "../data/softwareReleases";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import WorkPageLayout from "./layout/WorkPageLayout.vue";
import WorkSectionBlock from "./layout/WorkSectionBlock.vue";

interface WorkTocEntry {
  id: string;
  label: string;
  level?: number;
}

interface SoftwareViewEntry extends SoftwareEntry {
  sectionId: string;
  sectionTitle: string;
  sectionDescription: string;
}

type SoftwareTagFilterKind = "section" | "type" | "purpose" | "topic";

function softwareYearSortValue(year: string): number {
  if (year === "Ongoing") {
    return 9999;
  }

  const parsed = Number.parseInt(year, 10);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return 0;
}

export default defineComponent({
  name: "MySoftware",
  components: {
    WorkPageLayout,
    WorkSectionBlock,
  },
  data() {
    return {
      softwareSections,
      filtersOpen: false,
      selectedSection: "All",
      selectedType: "All",
      selectedPurpose: "All",
      selectedTopic: "All",
      selectedYear: "All",
      selectedSort: "date-desc",
    };
  },
  computed: {
    softwareEntries(): SoftwareViewEntry[] {
      return this.softwareSections.flatMap((section) =>
        section.entries.map((entry) => ({
          ...entry,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionDescription: section.description,
        })),
      );
    },
    availableSections(): string[] {
      return this.softwareSections.map((section) => section.title);
    },
    availableTypes(): string[] {
      return Array.from(new Set(this.softwareEntries.map((entry) => entry.type))).sort((a, b) =>
        a.localeCompare(b),
      );
    },
    availablePurposes(): string[] {
      return Array.from(new Set(this.softwareEntries.map((entry) => entry.purpose))).sort((a, b) =>
        a.localeCompare(b),
      );
    },
    availableTopics(): string[] {
      const tags = new Set<string>();
      this.softwareEntries.forEach((entry) => {
        entry.mainTopics.forEach((tag) => tags.add(tag));
      });
      return Array.from(tags).sort((a, b) => a.localeCompare(b));
    },
    availableYears(): string[] {
      const years = new Set<string>();
      this.softwareEntries.forEach((entry) => {
        years.add(entry.year || "Undated");
      });
      return Array.from(years).sort((a, b) => softwareYearSortValue(b) - softwareYearSortValue(a));
    },
    hasActiveFilters(): boolean {
      return (
        this.selectedSection !== "All" ||
        this.selectedType !== "All" ||
        this.selectedPurpose !== "All" ||
        this.selectedTopic !== "All" ||
        this.selectedYear !== "All" ||
        this.selectedSort !== "date-desc"
      );
    },
    filteredSoftwareEntries(): SoftwareViewEntry[] {
      const collator = new Intl.Collator(undefined, { sensitivity: "base" });
      const filtered = this.softwareEntries.filter((entry) => {
        const sectionMatch =
          this.selectedSection === "All" || entry.sectionTitle === this.selectedSection;
        const typeMatch = this.selectedType === "All" || entry.type === this.selectedType;
        const purposeMatch =
          this.selectedPurpose === "All" || entry.purpose === this.selectedPurpose;
        const topicMatch =
          this.selectedTopic === "All" || entry.mainTopics.includes(this.selectedTopic);
        const yearMatch = this.selectedYear === "All" || entry.year === this.selectedYear;
        return sectionMatch && typeMatch && purposeMatch && topicMatch && yearMatch;
      });

      return filtered.sort((a, b) => {
        if (this.selectedSort === "date-asc") {
          return softwareYearSortValue(a.year) - softwareYearSortValue(b.year);
        }
        if (this.selectedSort === "title-asc") {
          return collator.compare(a.title, b.title);
        }
        if (this.selectedSort === "title-desc") {
          return collator.compare(b.title, a.title);
        }
        return softwareYearSortValue(b.year) - softwareYearSortValue(a.year);
      });
    },
    displayedSections(): Array<SoftwareSection & { entries: SoftwareViewEntry[] }> {
      return this.softwareSections
        .map((section) => ({
          ...section,
          entries: this.filteredSoftwareEntries.filter((entry) => entry.sectionId === section.id),
        }))
        .filter((section) => section.entries.length > 0);
    },
    tocEntries(): WorkTocEntry[] {
      const entries: WorkTocEntry[] = [
        { id: "software-overview", label: "Overview", level: 1 },
        { id: "software-filters", label: "Filters", level: 2 },
      ];

      this.displayedSections.forEach((section) => {
        entries.push({
          id: this.softwareBlockId(section.id),
          label: section.title,
          level: 1,
        });
        section.entries.forEach((project) => {
          entries.push({
            id: this.softwareSectionId(project.id),
            label: project.title,
            level: 2,
          });
        });
      });

      return entries;
    },
  },
  watch: {
    "$route.query": {
      immediate: true,
      handler() {
        this.applyRouteTagFilter();
      },
    },
  },
  methods: {
    isExternalUrl(url: string): boolean {
      return /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(url);
    },
    normalizeLinkUrl(url: string): string {
      if (!url || this.isExternalUrl(url)) {
        return url;
      }

      const baseUrl = import.meta.env.BASE_URL || "/";
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      if (url.startsWith(normalizedBase)) {
        return url;
      }

      return resolvePublicAssetPath(url);
    },
    linkTarget(url: string): string | undefined {
      return this.isExternalUrl(url) ? "_blank" : undefined;
    },
    linkRel(url: string): string | undefined {
      return this.isExternalUrl(url) ? "noopener noreferrer" : undefined;
    },
    softwareBlockId(sectionId: string): string {
      return `software-section-${sectionId}`;
    },
    softwareSectionId(projectId: string): string {
      return `software-${projectId}`;
    },
    softwareDetailRoute(project: SoftwareEntry): string {
      return getSoftwarePagePath(project);
    },
    softwareRelease(project: SoftwareEntry): SoftwareReleaseInfo | null {
      return softwareReleasesBySoftwareId[project.id] ?? null;
    },
    softwareReleaseText(project: SoftwareEntry): string | null {
      const release = this.softwareRelease(project);
      if (!release) {
        return null;
      }
      const primary = release.tagName || release.name || "Latest update";
      return primary;
    },
    softwareReleaseDateText(project: SoftwareEntry): string | null {
      const release = this.softwareRelease(project);
      if (!release?.publishedAt) {
        return null;
      }
      if (release.publishedAt.length < 10) {
        return null;
      }
      return release.publishedAt.slice(0, 10);
    },
    softwareReleaseLink(project: SoftwareEntry): string | null {
      return this.softwareRelease(project)?.url ?? null;
    },
    clearSoftwareFilters() {
      this.selectedSection = "All";
      this.selectedType = "All";
      this.selectedPurpose = "All";
      this.selectedTopic = "All";
      this.selectedYear = "All";
      this.selectedSort = "date-desc";
    },
    parseSoftwareTagFilterKind(raw: string): SoftwareTagFilterKind | null {
      if (raw === "section" || raw === "type" || raw === "purpose" || raw === "topic") {
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

      const parsedKind = this.parseSoftwareTagFilterKind(rawTag);
      if (!parsedKind || !rawValue.trim()) {
        return;
      }

      this.clearSoftwareFilters();
      this.applySoftwareTagFilter(parsedKind, rawValue.trim());
    },
    applySoftwareTagFilter(kind: SoftwareTagFilterKind, value: string) {
      if (kind === "section") {
        this.selectedSection = value;
        this.selectedType = "All";
        this.selectedPurpose = "All";
        this.selectedTopic = "All";
      } else if (kind === "type") {
        this.selectedType = value;
        this.selectedSection = "All";
        this.selectedPurpose = "All";
        this.selectedTopic = "All";
      } else if (kind === "purpose") {
        this.selectedPurpose = value;
        this.selectedSection = "All";
        this.selectedType = "All";
        this.selectedTopic = "All";
      } else {
        this.selectedTopic = value;
        this.selectedSection = "All";
        this.selectedType = "All";
        this.selectedPurpose = "All";
      }

      this.selectedYear = "All";
      this.filtersOpen = true;
    },
    softwareYearFilterValue(entry: SoftwareEntry): string {
      return entry.year || "Undated";
    },
    applySoftwareYearFilter(entry: SoftwareEntry) {
      this.selectedYear = this.softwareYearFilterValue(entry);
      this.filtersOpen = true;
    },
    isSoftwareYearActive(entry: SoftwareEntry): boolean {
      if (this.selectedYear === "All") {
        return false;
      }
      return this.selectedYear === this.softwareYearFilterValue(entry);
    },
    isSoftwareTagActive(kind: SoftwareTagFilterKind, value: string): boolean {
      if (kind === "section") {
        return this.selectedSection === value;
      }
      if (kind === "type") {
        return this.selectedType === value;
      }
      if (kind === "purpose") {
        return this.selectedPurpose === value;
      }
      return this.selectedTopic === value;
    },
  },
});
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

.software-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.page-subheader {
  margin: 0;
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body-lg);
  line-height: 1.4;
}

.software-filters {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--surface-outline);
}

[data-theme="light"] .software-filters {
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
  color: var(--text-muted);
  font-size: var(--font-size-label);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 1;
}

.filter-toggle-state {
  border: none;
  border-radius: 0;
  padding: 0;
  color: var(--text-soft);
  font-size: var(--font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 1;
  background: transparent;
}

.filter-panel {
  margin-top: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 7px;
}

.filter-control {
  display: grid;
  gap: 5px;
  min-width: 0;
  color: var(--text-muted);
  font-weight: 600;
  font-size: var(--font-size-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 1;
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
  border-color: rgba(var(--accent-rgb), 0.46);
  background-color: rgba(var(--accent-rgb), 0.06);
}

.filter-control select:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.72);
  box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.25);
}

.filter-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.filter-result {
  margin: 0;
  color: var(--text-soft);
  opacity: 1;
  font-size: var(--font-size-caption);
  letter-spacing: 0.03em;
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
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body);
}

.software-list {
  display: grid;
  gap: 16px;
}

.software-card {
  background: var(--surface-elevated);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
  position: relative;
}

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
  transition: background-color 0.16s ease, border-color 0.16s ease;
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

.software-tag {
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: var(--list-tag-size);
  color: var(--page-text);
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  line-height: 1.2;
  position: relative;
  z-index: 0;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.software-tag::after {
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

.software-tag:hover {
  transform: translateY(-1px);
  z-index: 1000;
}

.software-tag:hover::after,
.software-tag:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.software-tag:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.35);
  z-index: 1000;
}

.software-tag-active {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
}

.software-tag-type {
  background: rgba(245, 158, 11, 0.18);
  border-color: rgba(245, 158, 11, 0.44);
  color: #5f3a00;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.96);
  --tag-tooltip-border: rgba(161, 98, 7, 0.96);
  --tag-tooltip-text: #251401;
}

.software-tag-purpose {
  background: rgba(168, 85, 247, 0.16);
  border-color: rgba(168, 85, 247, 0.44);
  color: #3d1362;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.96);
  --tag-tooltip-border: rgba(147, 51, 234, 0.96);
  --tag-tooltip-text: #12031f;
}

.software-tag-topic {
  background: rgba(20, 184, 166, 0.16);
  border-color: rgba(20, 184, 166, 0.44);
  color: #06453f;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

[data-theme="dark"] .software-tag-type {
  background: rgba(245, 158, 11, 0.28);
  border-color: rgba(245, 158, 11, 0.62);
  color: #ffe7a8;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.98);
  --tag-tooltip-border: rgba(251, 191, 36, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .software-tag-purpose {
  background: rgba(168, 85, 247, 0.26);
  border-color: rgba(168, 85, 247, 0.58);
  color: #ece4ff;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.98);
  --tag-tooltip-border: rgba(192, 132, 252, 0.98);
  --tag-tooltip-text: #11021f;
}

[data-theme="dark"] .software-tag-topic {
  background: rgba(20, 184, 166, 0.26);
  border-color: rgba(20, 184, 166, 0.58);
  color: #d2fff4;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(var(--accent-secondary-rgb), 0.98);
  --tag-tooltip-text: #021413;
}

.software-links {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
}

.software-action-btn {
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
  font-size: var(--font-size-body);
  min-width: 0;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.16s ease, box-shadow 0.2s ease;
}

.software-action-btn:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.45);
  box-shadow: 0 4px 12px rgba(8, 15, 31, 0.12);
  transform: translateY(-1px);
}

.software-action-btn:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.78);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24);
}

[data-theme="light"] .software-action-btn {
  background: rgba(16, 36, 59, 0.04);
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

  .software-header,
  .software-card {
    padding: 12px;
  }

  .software-title-row {
    padding-right: 0;
  }

  .software-year {
    position: static;
    margin-top: 8px;
  }

  .software-action-btn {
    width: 100%;
  }
}
</style>
