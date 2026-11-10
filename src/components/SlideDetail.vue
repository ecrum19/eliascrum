<template>
  <detail-page
    :found="Boolean(talk)"
    toc-title="Talk"
    :toc-entries="tocEntries"
    :back="back"
    not-found-title="Talk not found"
    not-found-message="No talk is recorded under this address."
  >
    <template v-if="talk">
      <detail-header
        :kicker="['Talk', ...talk.venueTags].join(' • ')"
        :title="talk.title"
        :date="dateLabel(talk.date)"
        :back="back"
        :actions="actions"
        :tags="tags"
      />
      <highlight-callout v-if="highlight" :highlight="highlight" />
      <detail-section id="detail-summary" title="Summary">
        <p>{{ talk.summary }}</p>
      </detail-section>
      <detail-section v-if="hasDistinctAbstract" id="detail-abstract" title="Abstract">
        <p>{{ talk.abstract }}</p>
      </detail-section>
      <detail-section v-if="detailRows.length" id="detail-metadata" title="Details">
        <metadata-list :rows="detailRows" />
      </detail-section>
      <detail-section v-if="related.length" id="detail-related" title="Related">
        <related-links :items="related" />
      </detail-section>
      <detail-section id="detail-slides" title="Slides">
        <template v-if="embedUrl">
          <div v-if="embedRequested" class="slide-embed">
            <iframe
              :src="embedUrl"
              :title="`${talk.title} — slide presentation`"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
          <deferred-preview-notice
            v-else
            message="Lite mode pauses slide previews until you choose to load one."
            action-label="Load Slides Preview"
            @load="embedRequested = true"
          />
        </template>
        <pdf-viewer
          v-else
          :url="slidePdfUrl"
          :open-href="slidePdfUrl"
          open-label="Open Slides PDF"
          loading-label="Loading slides..."
          defer-message="Lite mode pauses slide previews until you choose to load one."
          defer-action-label="Load Slides Preview"
          :zoomable="false"
          variant="slides"
          keyboard-paging
        />
      </detail-section>
      <detail-section
        v-for="(poster, index) in posters"
        :id="index ? `detail-poster-${poster.id}` : 'detail-poster'"
        :key="poster.id"
        title="Poster"
      >
        <poster-preview :url="resolvePublicAssetPath(posterPdfPath(poster))" />
      </detail-section>
    </template>
  </detail-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { dateLabel, talkCatalog } from "../content/catalog";
import {
  audienceSizeCategory,
  durationCategory,
  posterPdfPath,
  presentationDetailRows,
  slidesUrl,
  talkPosters,
} from "../content/presentationDetails";
import { detailRelated, resolveHighlight } from "../content/relations";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import { shouldDeferPdfPreviews } from "../utils/performanceMode";
import DeferredPreviewNotice from "./layout/DeferredPreviewNotice.vue";
import DetailPage from "./detail/DetailPage.vue";
import DetailHeader from "./detail/DetailHeader.vue";
import DetailSection from "./detail/DetailSection.vue";
import HighlightCallout from "./detail/HighlightCallout.vue";
import MetadataList from "./detail/MetadataList.vue";
import PdfViewer from "./detail/PdfViewer.vue";
import PosterPreview from "./detail/PosterPreview.vue";
import RelatedLinks from "./detail/RelatedLinks.vue";
import { detailToc, listingTag, type DetailAction } from "./detail/detail";

const back = { to: "/talks", label: "Back to Talks" };
const route = useRoute();
const talk = computed(() => talkCatalog.bySlug(String(route.params.slug || "")));
const embedUrl = computed(() => talk.value?.slides.embedUrl?.trim() ?? "");
const slidePdfUrl = computed(() =>
  talk.value?.slides.format === "pdf" ? resolvePublicAssetPath(slidesUrl(talk.value)) : "",
);
const posters = computed(() => (talk.value ? talkPosters(talk.value) : []));
// Embedded slide providers are opt-in while Lite mode is active, like PDF.js.
const embedRequested = ref(!shouldDeferPdfPreviews());

const actions = computed<DetailAction[]>(() => [
  ...(embedUrl.value
    ? [
        {
          label: talk.value?.slides.format === "html" ? "Open HTML Slides" : "Open Google Slides",
          href: embedUrl.value,
        },
      ]
    : []),
  ...(slidePdfUrl.value ? [{ label: "Open Slides PDF", href: slidePdfUrl.value }] : []),
]);
const tags = computed(() => {
  if (!talk.value) return [];
  const tag = (filter: string, value: string, category: string, color: Parameters<typeof listingTag>[4]) =>
    listingTag("/talks", filter, value, category, color);
  const size = audienceSizeCategory(talk.value);
  const duration = durationCategory(talk.value);
  return [
    tag("material", "Slides", "Type", "type"),
    ...talk.value.venueTags.map((venue) => tag("venue", venue, "Venue", "venue")),
    ...talk.value.topics.map((topic) => tag("topic", topic, "Main Topic", "topic")),
    ...talk.value.audienceGroups.map((group) => tag("audienceGroup", group, "Audience Field", "audience")),
    ...(size ? [tag("audienceSize", size, "Audience Size", "size")] : []),
    ...(duration ? [tag("duration", duration, "Duration", "duration")] : []),
  ];
});
const hasDistinctAbstract = computed(
  () => talk.value?.abstract && talk.value.abstract.trim() !== talk.value.summary.trim(),
);
const detailRows = computed(() => (talk.value ? presentationDetailRows(talk.value) : []));
const highlight = computed(() => resolveHighlight(talk.value?.highlight));
const related = computed(() =>
  talk.value ? detailRelated(`talk:${talk.value.id}`, talk.value.related, talk.value.highlight) : [],
);
const tocEntries = computed(() =>
  detailToc([
    { id: "detail-highlight", label: "Highlight", show: highlight.value },
    { id: "detail-summary", label: "Summary" },
    { id: "detail-abstract", label: "Abstract", show: hasDistinctAbstract.value },
    { id: "detail-metadata", label: "Details", show: detailRows.value.length },
    { id: "detail-related", label: "Related", show: related.value.length },
    { id: "detail-slides", label: "Slides", level: 1 },
    ...posters.value.map((poster, index) => ({
      id: index ? `detail-poster-${poster.id}` : "detail-poster",
      label: "Poster",
      level: 1 as const,
    })),
  ]),
);
</script>

<style scoped>
.slide-embed {
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
  overflow: hidden;
  background: #0f0f0f;
}

.slide-embed iframe {
  width: 100%;
  height: clamp(560px, 80vh, 980px);
  display: block;
  border: 0;
}

@media (max-width: 768px) {
  .slide-embed iframe {
    min-height: 56vh;
    height: 62vh;
    max-height: 78vh;
  }
}
</style>
