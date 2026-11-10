<template>
  <detail-page
    :found="Boolean(publication)"
    toc-title="Paper"
    :toc-entries="tocEntries"
    :back="back"
    not-found-title="Publication not found"
    not-found-message="The requested publication paper page could not be resolved."
  >
    <template v-if="publication">
      <detail-header
        :kicker="`${publication.type} • ${publication.venue}`"
        :title="publication.title"
        :byline="publication.authors"
        :date="dateLabel(publication.date)"
        :back="back"
        :actions="paperOpenHref ? [{ label: paperOpenLabel, href: paperOpenHref }] : []"
        :tags="tags"
      />
      <highlight-callout v-if="highlight" :highlight="highlight" />
      <detail-section id="detail-summary" title="Summary">
        <p>{{ publication.summary }}</p>
      </detail-section>
      <detail-section v-if="publication.abstract" id="detail-abstract" title="Abstract">
        <p>{{ publication.abstract }}</p>
      </detail-section>
      <detail-section id="detail-metadata" title="Details">
        <metadata-list :rows="detailRows" />
      </detail-section>
      <detail-section v-if="related.length" id="detail-related" title="Related">
        <related-links :items="related" />
      </detail-section>
      <detail-section id="detail-bibtex" title="BibTeX">
        <template #actions>
          <button
            type="button"
            class="copy-btn"
            :title="copied ? 'Copied' : 'Copy BibTeX citation'"
            :aria-label="copied ? 'BibTeX copied to clipboard' : 'Copy BibTeX citation'"
            @click="copyBibtex"
          >
            <i class="fa" :class="copied ? 'fa-check' : 'fa-files-o'"></i>
          </button>
        </template>
        <pre class="bibtex"><code>{{ publication.bibtex }}</code></pre>
      </detail-section>
      <detail-section id="detail-pdf" title="Paper">
        <pdf-viewer
          :url="paperPreviewUrl"
          :open-href="paperOpenHref"
          :open-label="paperOpenLabel"
          loading-label="Loading paper..."
          defer-message="Lite mode pauses inline paper previews until you choose to load one."
          defer-action-label="Load Paper Preview"
        >
          <template #empty>
            <p>{{ previewUnavailableLabel }}</p>
            <action-link v-if="paperOpenHref" :href="paperOpenHref">{{
              paperOpenLabel
            }}</action-link>
          </template>
        </pdf-viewer>
      </detail-section>
    </template>
  </detail-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { dateLabel, publicationCatalog } from "../content/catalog";
import {
  publicationDetailRows,
  publicationMetric,
  publicationPdfUrl,
} from "../content/publicationDetails";
import { detailRelated, resolveHighlight } from "../content/relations";
import { copyText } from "../utils/clipboard";
import DetailPage from "./detail/DetailPage.vue";
import DetailHeader from "./detail/DetailHeader.vue";
import DetailSection from "./detail/DetailSection.vue";
import HighlightCallout from "./detail/HighlightCallout.vue";
import MetadataList from "./detail/MetadataList.vue";
import PdfViewer from "./detail/PdfViewer.vue";
import RelatedLinks from "./detail/RelatedLinks.vue";
import ActionLink from "./ui/ActionLink.vue";
import { detailToc, listingTag } from "./detail/detail";

const back = { to: "/publications", label: "Back to Publications" };
const route = useRoute();
const publication = computed(() => publicationCatalog.bySlug(String(route.params.slug || "")));
const paperPreviewUrl = computed(() => publication.value && publicationPdfUrl(publication.value));
const paperOpenHref = computed(() => paperPreviewUrl.value ?? publication.value?.links?.publisher);
const paperOpenLabel = computed(() =>
  paperPreviewUrl.value ? "Open Paper PDF" : "Open Publication Page",
);
const previewUnavailableLabel = computed(() =>
  publication.value?.links?.publisher
    ? "A direct PDF preview is not available for this publication source."
    : "A hosted PDF has not been added for this publication yet.",
);
const tags = computed(() =>
  publication.value
    ? [
        listingTag("/publications", "type", publication.value.type, "Type", "type"),
        ...publication.value.venueTags.map((venue) =>
          listingTag("/publications", "venue", venue, "Venue", "venue"),
        ),
        ...publication.value.topics.map((topic) =>
          listingTag("/publications", "topic", topic, "Main Topic", "topic"),
        ),
      ]
    : [],
);
const detailRows = computed(() =>
  publication.value
    ? [...publicationDetailRows(publication.value), publicationMetric(publication.value)]
    : [],
);
const highlight = computed(() => resolveHighlight(publication.value?.highlight));
const related = computed(() =>
  publication.value
    ? detailRelated(
        `publication:${publication.value.id}`,
        publication.value.related,
        publication.value.highlight,
      )
    : [],
);
const tocEntries = computed(() =>
  detailToc([
    { id: "detail-highlight", label: "Highlight", show: highlight.value },
    { id: "detail-summary", label: "Summary" },
    { id: "detail-abstract", label: "Abstract", show: publication.value?.abstract },
    { id: "detail-metadata", label: "Details" },
    { id: "detail-related", label: "Related", show: related.value.length },
    { id: "detail-bibtex", label: "BibTeX" },
    { id: "detail-pdf", label: "Paper", level: 1 },
  ]),
);

const copied = ref(false);
let copiedResetTimer: ReturnType<typeof setTimeout> | undefined;
onBeforeUnmount(() => clearTimeout(copiedResetTimer));

async function copyBibtex() {
  if (!publication.value || !(await copyText(publication.value.bibtex))) return;
  copied.value = true;
  clearTimeout(copiedResetTimer);
  copiedResetTimer = setTimeout(() => {
    copied.value = false;
  }, 1800);
}
</script>

<style scoped>
.bibtex {
  margin: 0;
  overflow-x: auto;
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: var(--font-size-label);
  line-height: 1.4;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--surface-outline);
  background: rgba(0, 0, 0, 0.28);
}

[data-theme="light"] .bibtex {
  background: rgba(16, 36, 59, 0.08);
}

.copy-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    opacity 0.18s ease;
}

.copy-btn:hover {
  background: var(--nav-hover-bg);
}
</style>
