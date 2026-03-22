<template>
  <work-page-layout
    id="software-detail"
    :toc-entries="tocEntries"
    toc-title="Software"
    :show-toc="Boolean(software)"
    max-width="min(1780px, 97vw)"
    page-padding="0 16px 140px"
  >
    <section v-if="software" id="software-detail-overview" class="work-section">
      <header class="software-header toc-anchor">
            <div class="software-header-top">
              <div class="software-header-copy">
                <p class="software-section-label">{{ softwareSectionTitle }}</p>
                <h1>{{ software.title }}</h1>
              </div>
              <p class="software-year">{{ software.year }}</p>
            </div>

            <div class="software-actions">
              <router-link to="/software" class="action-btn btn-back">Back to Software</router-link>
              <a
                v-if="software.repositoryUrl"
                :href="software.repositoryUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn btn-external"
              >
                To Git Repo
              </a>
              <a
                v-if="software.webUrl"
                :href="software.webUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn btn-external"
              >
                To Web Page
              </a>
            </div>

            <section id="software-detail-summary" class="software-copy-block toc-anchor" v-if="software.summary">
              <h2 class="software-detail-heading">Summary</h2>
              <p class="software-copy">{{ software.summary }}</p>
            </section>

            <section
              v-if="hasDistinctDescription"
              id="software-detail-description"
              class="software-copy-block toc-anchor"
            >
              <h2 class="software-detail-heading">Details</h2>
              <p class="software-copy">{{ software.description }}</p>
            </section>

            <dl
              v-if="detailRows.length"
              id="software-detail-metadata"
              class="software-details-list toc-anchor"
            >
              <div v-for="row in detailRows" :key="row.label" class="software-detail-row">
                <dt>{{ row.label }}</dt>
                <dd>
                  <a
                    v-if="row.href"
                    :href="row.href"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ row.value }}
                  </a>
                  <span v-else>{{ row.value }}</span>
                </dd>
              </div>
            </dl>

            <section
              v-if="relatedItems.length"
              id="software-detail-related"
              class="software-related-block toc-anchor"
            >
              <h2 class="software-detail-heading">Related Items</h2>
              <div class="software-related-links">
                <router-link
                  v-for="item in relatedItems"
                  :key="item.key"
                  :to="item.to"
                  class="action-btn btn-detail"
                >
                  {{ item.label }}
                </router-link>
              </div>
            </section>

            <div id="software-detail-tags" class="software-tags-footer toc-anchor">
              <span class="software-tags-label">Tags:</span>
              <div class="software-tags-list">
                <router-link
                  class="software-tag software-tag-type"
                  :to="{ path: '/software', query: { tag: 'type', value: software.type } }"
                  data-category="Type"
                >
                  {{ software.type }}
                </router-link>
                <router-link
                  class="software-tag software-tag-purpose"
                  :to="{ path: '/software', query: { tag: 'purpose', value: software.purpose } }"
                  data-category="Purpose"
                >
                  {{ software.purpose }}
                </router-link>
                <router-link
                  v-for="topic in software.mainTopics"
                  :key="topic"
                  class="software-tag software-tag-topic"
                  :to="{ path: '/software', query: { tag: 'topic', value: topic } }"
                  data-category="Main Topic"
                >
                  {{ topic }}
                </router-link>
              </div>
            </div>
      </header>
    </section>

    <div v-else class="software-shell">
      <article class="software-panel">
        <h1>Software item not found</h1>
        <p>This software slug does not exist in the current software data.</p>
        <router-link to="/software" class="action-btn btn-back">Back to Software</router-link>
      </article>
    </div>
  </work-page-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  getSoftwareEntryBySlug,
  softwareSections,
  type SoftwareSection,
  type SoftwareDetail as SoftwareDetailRow,
  type SoftwareEntry,
} from "../data/softwareData";
import {
  getPublicationById,
  getPublicationPagePath,
} from "../data/publicationsData";
import { getPosterViewBySlug } from "../data/posterCatalog";
import { getTalkViewBySlug } from "../data/talkCatalog";
import WorkPageLayout from "./layout/WorkPageLayout.vue";

interface WorkTocEntry {
  id: string;
  label: string;
  level?: number;
}

interface RelatedSiteItem {
  key: string;
  label: string;
  to: string;
}

export default defineComponent({
  name: "SoftwareDetail",
  components: {
    WorkPageLayout,
  },
  computed: {
    software(): SoftwareEntry | undefined {
      const routeSlug = String(this.$route.params.slug || "");
      return getSoftwareEntryBySlug(routeSlug);
    },
    softwareSection(): SoftwareSection | undefined {
      if (!this.software) {
        return undefined;
      }

      return softwareSections.find((candidateSection) =>
        candidateSection.entries.some((entry) => entry.id === this.software?.id),
      );
    },
    softwareSectionTitle(): string {
      return this.softwareSection?.title ?? "Software";
    },
    hasDistinctDescription(): boolean {
      if (!this.software?.description) {
        return false;
      }
      return this.software.description.trim() !== this.software.summary.trim();
    },
    detailRows(): SoftwareDetailRow[] {
      if (!this.software) {
        return [];
      }

      return [
        { label: "Section", value: this.softwareSectionTitle },
        { label: "Type", value: this.software.type },
        { label: "Purpose", value: this.software.purpose },
        ...(this.software.repositoryUrl
          ? [{ label: "Git Repository", value: this.software.repositoryUrl, href: this.software.repositoryUrl }]
          : []),
        ...(this.software.webUrl
          ? [{ label: "Web Page", value: this.software.webUrl, href: this.software.webUrl }]
          : []),
        ...(this.software.details ?? []),
      ];
    },
    relatedItems(): RelatedSiteItem[] {
      if (!this.software) {
        return [];
      }

      const items: RelatedSiteItem[] = [];

      (this.software.relatedPublicationIds ?? []).forEach((publicationId) => {
        const publication = getPublicationById(publicationId);
        if (!publication) {
          return;
        }
        items.push({
          key: `publication:${publicationId}`,
          label: `Publication: ${publication.title}`,
          to: getPublicationPagePath(publication),
        });
      });

      (this.software.relatedTalkSlugs ?? []).forEach((talkSlug) => {
        const talk = getTalkViewBySlug(talkSlug);
        if (!talk) {
          return;
        }
        items.push({
          key: `talk:${talkSlug}`,
          label: `Talk: ${talk.displayTitle}`,
          to: `/talks/${talk.slug}`,
        });
      });

      (this.software.relatedPosterSlugs ?? []).forEach((posterSlug) => {
        const poster = getPosterViewBySlug(posterSlug);
        if (!poster) {
          return;
        }
        items.push({
          key: `poster:${posterSlug}`,
          label: `Poster: ${poster.displayTitle}`,
          to: `/talks/posters/${poster.slug}`,
        });
      });

      return items;
    },
    tocEntries(): WorkTocEntry[] {
      if (!this.software) {
        return [];
      }

      const entries: WorkTocEntry[] = [{ id: "software-detail-overview", label: "Overview", level: 1 }];

      if (this.software.summary) {
        entries.push({ id: "software-detail-summary", label: "Summary", level: 2 });
      }
      if (this.hasDistinctDescription) {
        entries.push({ id: "software-detail-description", label: "Details", level: 2 });
      }
      if (this.detailRows.length) {
        entries.push({ id: "software-detail-metadata", label: "Metadata", level: 2 });
      }
      if (this.relatedItems.length) {
        entries.push({ id: "software-detail-related", label: "Related", level: 2 });
      }
      entries.push({ id: "software-detail-tags", label: "Tags", level: 2 });

      return entries;
    },
  },
});
</script>

<style scoped>
#software-detail {
  --work-main-gap: 18px;
}

.work-section {
  min-width: 0;
  display: grid;
  gap: 12px;
}

.toc-anchor {
  scroll-margin-top: 92px;
}

.software-header,
.software-panel {
  background: var(--surface-elevated);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
}

.software-header {
  display: grid;
  gap: 12px;
}

.software-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.software-header-copy {
  display: grid;
  gap: 6px;
}

.software-section-label {
  margin: 0;
  color: var(--text-soft);
  font-size: var(--font-size-meta);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.software-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
  line-height: 1.08;
}

.software-year {
  margin: 4px 0 0;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 6px 12px;
  color: var(--page-text);
  font-size: var(--font-size-body);
  font-weight: 700;
  white-space: nowrap;
}

.software-actions,
.software-related-links,
.software-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
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
  line-height: 1.2;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.action-btn:hover {
  background: var(--nav-hover-bg);
}

.software-copy-block,
.software-related-block {
  display: grid;
  gap: 8px;
}

.software-detail-heading {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  font-weight: 600;
}

.software-copy {
  margin: 0;
  line-height: 1.6;
  color: var(--text-muted);
}

.software-details-list {
  margin: 0;
  display: grid;
  gap: 8px;
}

.software-detail-row {
  display: grid;
  grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
  gap: 14px;
}

.software-detail-row dt {
  font-weight: 700;
  color: var(--page-text);
}

.software-detail-row dd {
  margin: 0;
  color: var(--text-muted);
  min-width: 0;
}

.software-detail-row a {
  color: var(--link-color);
}

.software-tags-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
}

.software-tags-label {
  font-weight: 700;
  color: var(--page-text);
  padding-top: 4px;
}

.software-tag {
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  display: inline-flex;
  align-items: center;
  text-decoration: none;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: var(--font-size-body-sm);
  color: var(--page-text);
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

.software-tag-type {
  background: rgba(244, 208, 63, 0.16);
  --tag-tooltip-bg: rgba(244, 208, 63, 0.96);
  --tag-tooltip-border: rgba(202, 138, 4, 0.96);
  --tag-tooltip-text: #281b00;
}

.software-tag-purpose {
  background: rgba(236, 72, 153, 0.14);
  --tag-tooltip-bg: rgba(236, 72, 153, 0.96);
  --tag-tooltip-border: rgba(190, 24, 93, 0.96);
  --tag-tooltip-text: #300518;
}

.software-tag-topic {
  background: rgba(var(--accent-secondary-rgb), 0.14);
  --tag-tooltip-bg: rgba(var(--accent-secondary-rgb), 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

[data-theme="dark"] .software-tag-type {
  background: rgba(244, 208, 63, 0.28);
  border-color: rgba(244, 208, 63, 0.62);
  color: #ffe7a8;
  --tag-tooltip-bg: rgba(244, 208, 63, 0.98);
  --tag-tooltip-border: rgba(250, 204, 21, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .software-tag-purpose {
  background: rgba(236, 72, 153, 0.28);
  border-color: rgba(236, 72, 153, 0.6);
  color: #ffd7ea;
  --tag-tooltip-bg: rgba(236, 72, 153, 0.98);
  --tag-tooltip-border: rgba(244, 114, 182, 0.98);
  --tag-tooltip-text: #2a0617;
}

[data-theme="dark"] .software-tag-topic {
  background: rgba(var(--accent-secondary-rgb), 0.26);
  border-color: rgba(var(--accent-secondary-rgb), 0.58);
  color: #d2fff4;
  --tag-tooltip-bg: rgba(var(--accent-secondary-rgb), 0.98);
  --tag-tooltip-border: rgba(var(--accent-secondary-rgb), 0.98);
  --tag-tooltip-text: #021413;
}

@media (max-width: 780px) {
  #software-detail {
    padding: 0 10px 118px;
  }

  .software-header,
  .software-panel {
    padding: 14px;
  }

  .software-header-top {
    flex-direction: column;
  }

  .software-detail-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
