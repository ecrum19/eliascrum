<template>
  <work-page-layout
    id="poster-detail"
    :toc-entries="tocEntries"
    toc-title="Poster"
    :show-toc="Boolean(poster)"
    max-width="min(1780px, 97vw)"
    page-padding="0 16px 140px"
  >
    <template v-if="poster">
      <section id="poster-detail-overview" class="work-section">
        <header class="poster-header toc-anchor">
            <div class="poster-header-top">
              <h1>{{ poster.displayTitle }}</h1>
              <p class="poster-date-detailed">{{ headerDateLabel }}</p>
            </div>

            <div class="poster-actions">
              <router-link to="/talks" class="action-btn btn-back">Back to Talks</router-link>
              <a :href="posterPdfUrl" class="action-btn btn-pdf">
                Open Poster PDF
              </a>
              <router-link
                v-if="poster.linkedTalkSlug"
                :to="`/talks/${poster.linkedTalkSlug}`"
                class="action-btn btn-detail"
              >
                Related Talk
              </router-link>
              <a
                v-for="publicationLink in relatedPublicationLinks"
                :key="publicationLink.key"
                :href="toNavigableUrl(publicationLink.url)"
                class="action-btn btn-external"
              >
                {{ publicationLink.label }}
              </a>
            </div>

            <section id="poster-detail-summary" class="poster-abstract-block toc-anchor" v-if="poster.summary">
              <h2 class="poster-detail-heading">Summary</h2>
              <p class="poster-summary">{{ poster.summary }}</p>
            </section>

            <section
              v-if="hasDistinctAbstract"
              id="poster-detail-abstract"
              class="poster-abstract-block toc-anchor"
            >
              <h2 class="poster-detail-heading">Abstract</h2>
              <p class="poster-summary">{{ poster.abstract }}</p>
            </section>

            <dl
              v-if="detailRows.length"
              id="poster-detail-metadata"
              class="poster-details-list toc-anchor"
            >
              <div v-for="row in detailRows" :key="row.label" class="poster-detail-row">
                <dt>{{ row.label }}</dt>
                <dd>
                  <a
                    v-if="row.href"
                    :href="toNavigableUrl(row.href)"
                    :target="linkTarget(row.href)"
                    :rel="linkRel(row.href)"
                  >
                    {{ row.value }}
                  </a>
                  <span v-else>{{ row.value }}</span>
                </dd>
              </div>
            </dl>

            <div id="poster-detail-tags" class="poster-tags-footer toc-anchor" v-if="detailTags.length">
              <span class="poster-tags-label">Tags:</span>
              <div class="poster-tags-list">
                <router-link
                  v-for="tag in detailTags"
                  :key="tag.key"
                  class="talk-tag talk-tag-link"
                  :class="tag.className"
                  :title="`${tag.category}: ${tag.label}`"
                  :data-category="tag.category"
                  :to="{ path: '/talks', query: { tag: tag.kind, value: tag.value } }"
                >
                  {{ tag.label }}
                </router-link>
              </div>
            </div>
        </header>
      </section>

      <section id="poster-detail-pdf" class="work-section">
        <article class="poster-panel toc-anchor">
          <h2>Poster</h2>
          <object v-if="posterPreviewRequested" :data="`${posterPdfUrl}#page=1&zoom=page-fit`" type="application/pdf" class="poster-frame">
            <p>
              Your browser cannot render the PDF inline.
              <a :href="posterPdfUrl">Open the poster</a>.
            </p>
          </object>
          <deferred-preview-notice
            v-else
            message="Lite mode pauses poster previews until you choose to load one."
            action-label="Load Poster Preview"
            @load="requestPosterPreview"
          />
        </article>
      </section>
    </template>

    <div v-else class="poster-shell">
      <article class="poster-panel">
        <h1>Poster not found</h1>
        <p>This poster slug does not exist in the generated poster data.</p>
        <router-link to="/talks" class="action-btn btn-back">Back to Talks</router-link>
      </article>
    </div>
  </work-page-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getPosterViewBySlug, type PosterViewEntry } from "../data/posterCatalog";
import {
  getRelatedPublicationLinksForPresentationFile,
  type ResolvedPublicationLink,
} from "../data/publicationsData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import { shouldDeferPdfPreviews } from "../utils/performanceMode";
import DeferredPreviewNotice from "./layout/DeferredPreviewNotice.vue";
import WorkPageLayout from "./layout/WorkPageLayout.vue";

type PosterDetailFilterKind =
  | "material"
  | "venue"
  | "topic"
  | "audienceGroup";

interface PosterDetailTag {
  key: string;
  kind: PosterDetailFilterKind;
  value: string;
  category: string;
  label: string;
  className: string;
}

interface PosterDetailRow {
  label: string;
  value: string;
  href?: string;
}

interface WorkTocEntry {
  id: string;
  label: string;
  level?: number;
}

export default defineComponent({
  name: "PosterDetail",
  components: {
    DeferredPreviewNotice,
    WorkPageLayout,
  },
  data() {
    return {
      // Native PDF embedding is also delayed so Lite mode avoids PDF network requests.
      posterPreviewRequested: !shouldDeferPdfPreviews(),
    };
  },
  methods: {
    requestPosterPreview() {
      this.posterPreviewRequested = true;
    },
    isExternalUrl(url: string): boolean {
      return /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(url);
    },
    toNavigableUrl(url: string): string {
      return this.isExternalUrl(url) ? url : resolvePublicAssetPath(url);
    },
    linkTarget(url: string): string | undefined {
      return this.isExternalUrl(url) ? "_blank" : undefined;
    },
    linkRel(url: string): string | undefined {
      return this.isExternalUrl(url) ? "noopener noreferrer" : undefined;
    },
  },
  computed: {
    tocEntries(): WorkTocEntry[] {
      if (!this.poster) {
        return [];
      }

      const entries: WorkTocEntry[] = [{ id: "poster-detail-overview", label: "Overview", level: 1 }];

      if (this.poster.summary) {
        entries.push({ id: "poster-detail-summary", label: "Summary", level: 2 });
      }
      if (this.hasDistinctAbstract) {
        entries.push({ id: "poster-detail-abstract", label: "Abstract", level: 2 });
      }
      if (this.detailRows.length) {
        entries.push({ id: "poster-detail-metadata", label: "Details", level: 2 });
      }
      if (this.detailTags.length) {
        entries.push({ id: "poster-detail-tags", label: "Tags", level: 2 });
      }

      entries.push({ id: "poster-detail-pdf", label: "Poster", level: 1 });
      return entries;
    },
    poster(): PosterViewEntry | undefined {
      const routeSlug = String(this.$route.params.slug || "");
      return getPosterViewBySlug(routeSlug);
    },
    headerDateLabel(): string {
      if (!this.poster || this.poster.displayDateIso === "1900-01-01") {
        return "Undated";
      }
      return this.poster.displayDateIso;
    },
    posterPdfUrl(): string {
      return this.poster ? resolvePublicAssetPath(this.poster.path) : "";
    },
    relatedPublicationLinks(): ResolvedPublicationLink[] {
      if (!this.poster) {
        return [];
      }
      return getRelatedPublicationLinksForPresentationFile(this.poster.path);
    },
    hasDistinctAbstract(): boolean {
      if (!this.poster?.abstract) {
        return false;
      }
      return this.poster.abstract.trim() !== this.poster.summary.trim();
    },
    detailRows(): PosterDetailRow[] {
      if (!this.poster) {
        return [];
      }

      const rows: PosterDetailRow[] = [];
      if (this.poster.goal) {
        rows.push({ label: "Goal", value: this.poster.goal });
      }
      if (this.poster.audienceExpertise) {
        rows.push({ label: "Audience Expertise", value: this.poster.audienceExpertise });
      }
      if (this.poster.linkedTalkTitle) {
        rows.push({ label: "Linked Talk", value: this.poster.linkedTalkTitle });
      }
      this.poster.relatedResources.forEach((resource) => {
        rows.push({
          label: resource.label,
          value: resource.url,
          href: resource.url,
        });
      });
      return rows;
    },
    detailTags(): PosterDetailTag[] {
      if (!this.poster) {
        return [];
      }

      const tags: PosterDetailTag[] = [];
      const pushTag = (
        kind: PosterDetailFilterKind,
        category: string,
        label: string,
        className: string,
      ) => {
        tags.push({
          key: `${kind}:${label}`,
          kind,
          value: label,
          category,
          label,
          className,
        });
      };

      pushTag("material", "Type", "Poster", "talk-tag-material");
      this.poster.venueTags.forEach((venueTag) => {
        pushTag("venue", "Venue", String(venueTag), "talk-tag-venue");
      });
      this.poster.topicTags.forEach((topicTag) => {
        pushTag("topic", "Main Topic", String(topicTag), "talk-tag-topic");
      });
      this.poster.audienceGroups.forEach((audienceGroupTag) => {
        pushTag("audienceGroup", "Audience Field", String(audienceGroupTag), "talk-tag-audience-group");
      });

      return tags;
    },
  },
});
</script>

<style scoped>
#poster-detail {
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

.poster-shell {
  display: grid;
  gap: 18px;
}

.poster-header,
.poster-panel {
  background: var(--surface-elevated);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
}

.poster-header {
  display: grid;
  gap: 12px;
}

.poster-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.poster-header h1 {
  margin: 0;
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
}

.poster-date-detailed {
  margin: 0;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: var(--toggle-bg);
  padding: 7px 14px;
  font-size: var(--font-size-body);
  font-weight: 700;
  white-space: nowrap;
  line-height: 1.2;
  opacity: 0.94;
}

.poster-actions {
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
}

.action-btn {
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
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.16s ease, box-shadow 0.2s ease;
}

.action-btn:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.45);
  box-shadow: 0 4px 12px rgba(8, 15, 31, 0.12);
  transform: translateY(-1px);
}

.action-btn:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.78);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24);
}

[data-theme="light"] .action-btn {
  background: rgba(16, 36, 59, 0.04);
}

.poster-detail-heading {
  margin: 0;
  color: var(--text-muted);
  font-family: var(--content-heading-font);
  font-size: var(--font-size-label);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  opacity: 1;
}

.poster-abstract-block {
  margin: 0;
  display: grid;
  gap: 8px;
}

.poster-summary {
  margin: 0;
  width: 100%;
  line-height: 1.56;
  padding-left: 12px;
  border-left: 3px solid rgba(var(--accent-rgb), 0.45);
  opacity: 0.96;
}

.poster-details-list {
  margin: 0;
  display: grid;
  gap: 0;
}

.poster-detail-row {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(170px, 0.32fr) minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.poster-detail-row:last-child {
  border-bottom: none;
}

.poster-detail-row dt {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-meta);
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 1;
}

.poster-detail-row dd {
  margin: 2px 0 0;
  font-size: var(--font-size-body);
  font-weight: 430;
  line-height: 1.48;
}

[data-theme="light"] .poster-detail-row {
  border-bottom-color: rgba(16, 36, 59, 0.16);
}

.poster-tags-footer {
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.poster-tags-label {
  padding: 6px 0;
  font-size: var(--font-size-meta);
  font-weight: 800;
  line-height: 1.2;
}

.poster-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.talk-tag {
  --tag-bg: rgba(148, 163, 184, 0.16);
  --tag-border: rgba(148, 163, 184, 0.38);
  --tag-text: var(--page-text);
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  display: inline-flex;
  align-items: center;
  border: 1px solid var(--tag-border);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: var(--font-size-meta);
  font-weight: 650;
  line-height: 1.2;
  color: var(--tag-text);
  background: var(--tag-bg);
}

.talk-tag-link {
  position: relative;
  text-decoration: none;
  z-index: 0;
  transition: transform 0.16s ease, box-shadow 0.18s ease;
}

.talk-tag-link::after {
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

.talk-tag-link:hover,
.talk-tag-link:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(8, 15, 31, 0.12);
  z-index: 1000;
}

.talk-tag-link:hover::after,
.talk-tag-link:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.talk-tag-link:focus-visible {
  outline: none;
}

.talk-tag-material {
  --tag-bg: rgba(245, 158, 11, 0.18);
  --tag-border: rgba(245, 158, 11, 0.44);
  --tag-text: #5f3a00;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.96);
  --tag-tooltip-border: rgba(161, 98, 7, 0.96);
  --tag-tooltip-text: #251401;
}

.talk-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.16);
  --tag-border: rgba(56, 189, 248, 0.44);
  --tag-text: #053a52;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.96);
  --tag-tooltip-border: rgba(2, 132, 199, 0.96);
  --tag-tooltip-text: #052634;
}

.talk-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.16);
  --tag-border: rgba(20, 184, 166, 0.44);
  --tag-text: #06453f;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

.talk-tag-audience-size {
  --tag-bg: rgba(249, 115, 22, 0.16);
  --tag-border: rgba(249, 115, 22, 0.44);
  --tag-text: #6d2600;
  --tag-tooltip-bg: rgba(249, 115, 22, 0.96);
  --tag-tooltip-border: rgba(194, 65, 12, 0.96);
  --tag-tooltip-text: #2b0c01;
}

.talk-tag-audience-group {
  --tag-bg: rgba(100, 116, 139, 0.18);
  --tag-border: rgba(100, 116, 139, 0.44);
  --tag-text: #1f334f;
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(71, 85, 105, 0.96);
  --tag-tooltip-text: #f8fafc;
}

.talk-tag-duration {
  --tag-bg: rgba(168, 85, 247, 0.16);
  --tag-border: rgba(168, 85, 247, 0.44);
  --tag-text: #3d1362;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.96);
  --tag-tooltip-border: rgba(147, 51, 234, 0.96);
  --tag-tooltip-text: #12031f;
}

[data-theme="dark"] .talk-tag-material {
  --tag-bg: rgba(245, 158, 11, 0.3);
  --tag-border: rgba(245, 158, 11, 0.62);
  --tag-text: #ffe7a8;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.98);
  --tag-tooltip-border: rgba(251, 191, 36, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .talk-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.3);
  --tag-border: rgba(56, 189, 248, 0.62);
  --tag-text: #d3f4ff;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.98);
  --tag-tooltip-border: rgba(125, 211, 252, 0.98);
  --tag-tooltip-text: #041b25;
}

[data-theme="dark"] .talk-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.3);
  --tag-border: rgba(20, 184, 166, 0.62);
  --tag-text: #d2fff4;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(var(--accent-secondary-rgb), 0.98);
  --tag-tooltip-text: #021413;
}

[data-theme="dark"] .talk-tag-audience-size {
  --tag-bg: rgba(249, 115, 22, 0.3);
  --tag-border: rgba(249, 115, 22, 0.64);
  --tag-text: #ffe0c2;
  --tag-tooltip-bg: rgba(249, 115, 22, 0.98);
  --tag-tooltip-border: rgba(251, 146, 60, 0.98);
  --tag-tooltip-text: #200700;
}

[data-theme="dark"] .talk-tag-audience-group {
  --tag-bg: rgba(100, 116, 139, 0.3);
  --tag-border: rgba(100, 116, 139, 0.62);
  --tag-text: #e4ebf4;
  --tag-tooltip-bg: rgba(100, 116, 139, 0.98);
  --tag-tooltip-border: rgba(148, 163, 184, 0.98);
  --tag-tooltip-text: #f8fafc;
}

[data-theme="dark"] .talk-tag-duration {
  --tag-bg: rgba(168, 85, 247, 0.3);
  --tag-border: rgba(168, 85, 247, 0.62);
  --tag-text: #ece4ff;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.98);
  --tag-tooltip-border: rgba(192, 132, 252, 0.98);
  --tag-tooltip-text: #11021f;
}

.poster-panel h2 {
  margin: 0 0 10px;
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
}

.poster-frame {
  width: 100%;
  min-height: clamp(720px, 82vh, 1400px);
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
  background: #0f0f0f;
}

@media (max-width: 768px) {
  #poster-detail {
    padding: 0 10px 132px;
  }

  .poster-header,
  .poster-panel {
    padding: 14px;
  }

  .poster-header-top {
    flex-direction: column;
    gap: 8px;
  }

  .poster-date-detailed {
    white-space: normal;
  }

  .poster-detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 9px 0;
  }

  .poster-detail-row dd {
    margin-top: 0;
  }

  .poster-tags-footer {
    flex-direction: column;
    gap: 6px;
  }

  .poster-tags-label {
    padding: 0;
  }

  .action-btn {
    width: 100%;
  }

  .poster-frame {
    min-height: 62vh;
  }
}

</style>
