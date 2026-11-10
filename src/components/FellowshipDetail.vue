<template>
  <work-page-layout
    id="fellowship-detail"
    :toc-entries="tocEntries"
    toc-title="Fellowship"
    max-width="min(1780px, 97vw)"
    page-padding="0 16px 140px"
  >
    <section id="fellowship-overview" class="work-section toc-anchor">
      <header class="fellowship-header">
        <p class="fellowship-kicker">{{ fellowship.subtitle }}</p>
        <h1>{{ fellowship.title }}</h1>
        <p class="fellowship-summary">{{ fellowship.summary }}</p>
        <div class="fellowship-actions">
          <router-link to="/about" class="fellowship-action-btn btn-back">Back to About</router-link>
          <a
            :href="projectDescriptionPdfHref"
            target="_blank"
            rel="noopener noreferrer"
            class="fellowship-action-btn btn-pdf"
          >
            Open Project Description PDF
          </a>
          <component
            :is="isDefenseSlidesInternal ? 'router-link' : 'a'"
            :to="isDefenseSlidesInternal ? fellowship.defenseSlidesUrl : undefined"
            :href="!isDefenseSlidesInternal ? fellowship.defenseSlidesUrl : undefined"
            :target="!isDefenseSlidesInternal ? '_blank' : undefined"
            :rel="!isDefenseSlidesInternal ? 'noopener noreferrer' : undefined"
            class="fellowship-action-btn btn-external"
          >
            FWO Fellowship Defense Slides
          </component>
        </div>
      </header>
    </section>

    <section id="fellowship-details" class="work-section toc-anchor">
      <article class="fellowship-panel">
        <h2>Fellowship Details</h2>
        <dl class="fellowship-detail-list">
          <div v-for="detail in fellowship.details" :key="detail.label" class="fellowship-detail-row">
            <dt>{{ detail.label }}</dt>
            <dd>{{ detail.value }}</dd>
          </div>
        </dl>
      </article>
    </section>

    <section id="fellowship-description-pdf" class="work-section toc-anchor">
      <article class="fellowship-panel">
        <h2>Project Description PDF</h2>
        <pdf-viewer
          :url="projectDescriptionPdfHref"
          :open-href="projectDescriptionPdfHref"
          open-label="Open Project Description PDF"
          defer-message="Lite mode pauses inline PDF previews until you choose to load one."
          defer-action-label="Load Project Description Preview"
        />
      </article>
    </section>
  </work-page-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WorkPageLayout from "./layout/WorkPageLayout.vue";
import { fwoPhdFellowship } from "../data/fellowshipData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import PdfViewer from "./detail/PdfViewer.vue";

interface WorkTocEntry {
  id: string;
  label: string;
  level?: number;
}

export default defineComponent({
  name: "FellowshipDetail",
  components: {
    PdfViewer,
    WorkPageLayout,
  },
  computed: {
    fellowship() {
      return fwoPhdFellowship;
    },
    projectDescriptionPdfHref(): string {
      return resolvePublicAssetPath(this.fellowship.projectDescriptionPdfUrl);
    },
    isDefenseSlidesInternal(): boolean {
      return this.fellowship.defenseSlidesUrl.startsWith("/");
    },
    tocEntries(): WorkTocEntry[] {
      return [
        { id: "fellowship-overview", label: "Overview", level: 1 },
        { id: "fellowship-details", label: "Details", level: 2 },
        { id: "fellowship-description-pdf", label: "Project PDF", level: 2 },
      ];
    },
  },
});
</script>

<style scoped>
#fellowship-detail {
  --work-main-gap: 16px;
}

.work-section {
  min-width: 0;
}

.toc-anchor {
  scroll-margin-top: 92px;
}

.fellowship-header,
.fellowship-panel {
  background: var(--surface-elevated);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
  display: grid;
  gap: 10px;
}

.fellowship-kicker {
  margin: 0;
  color: var(--text-soft);
  font-size: var(--font-size-meta);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fellowship-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.fellowship-summary {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.55;
}

.fellowship-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fellowship-action-btn {
  padding: 7px 14px;
  cursor: pointer;
}

.fellowship-panel h2 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  font-weight: 600;
}






.fellowship-detail-list {
  margin: 0;
  display: grid;
  gap: 8px;
}

.fellowship-detail-row {
  display: grid;
  grid-template-columns: minmax(170px, 230px) minmax(0, 1fr);
  gap: 12px;
}

.fellowship-detail-row dt {
  font-weight: 700;
  color: var(--page-text);
}

.fellowship-detail-row dd {
  margin: 0;
  color: var(--text-muted);
}

























































@media (max-width: 780px) {
  #fellowship-detail {
    padding: 0 10px 118px;
  }

  .fellowship-header,
  .fellowship-panel {
    padding: 14px;
  }

  .fellowship-detail-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }

}
</style>
