<template>
  <detail-page
    :found="Boolean(poster)"
    toc-title="Poster"
    :toc-entries="tocEntries"
    :back="back"
    not-found-title="Poster not found"
    not-found-message="No poster is recorded under this address."
  >
    <template v-if="poster">
      <detail-header
        :kicker="['Poster', ...poster.venueTags].join(' • ')"
        :title="poster.title"
        :date="dateLabel(poster.date)"
        :back="back"
        :actions="[{ label: 'Open Poster PDF', href: posterPdfUrl }]"
        :tags="tags"
      />
      <highlight-callout v-if="highlight" :highlight="highlight" />
      <detail-section id="detail-summary" title="Summary">
        <p>{{ poster.summary }}</p>
      </detail-section>
      <detail-section v-if="hasDistinctAbstract" id="detail-abstract" title="Abstract">
        <p>{{ poster.abstract }}</p>
      </detail-section>
      <detail-section v-if="detailRows.length" id="detail-metadata" title="Details">
        <metadata-list :rows="detailRows" />
      </detail-section>
      <detail-section v-if="related.length" id="detail-related" title="Related">
        <related-links :items="related" />
      </detail-section>
      <detail-section id="detail-poster" title="Poster">
        <poster-preview :url="posterPdfUrl" />
      </detail-section>
    </template>
  </detail-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { dateLabel, posterCatalog } from "../content/catalog";
import {
  audienceSizeCategory,
  durationCategory,
  posterPdfPath,
  presentationDetailRows,
} from "../content/presentationDetails";
import { detailRelated, resolveHighlight } from "../content/relations";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import DetailPage from "./detail/DetailPage.vue";
import DetailHeader from "./detail/DetailHeader.vue";
import DetailSection from "./detail/DetailSection.vue";
import HighlightCallout from "./detail/HighlightCallout.vue";
import MetadataList from "./detail/MetadataList.vue";
import PosterPreview from "./detail/PosterPreview.vue";
import RelatedLinks from "./detail/RelatedLinks.vue";
import { detailToc, listingTag } from "./detail/detail";

const back = { to: "/talks", label: "Back to Talks" };
const route = useRoute();
const poster = computed(() => posterCatalog.bySlug(String(route.params.slug || "")));
const posterPdfUrl = computed(() => (poster.value ? resolvePublicAssetPath(posterPdfPath(poster.value)) : ""));
const tags = computed(() => {
  if (!poster.value) return [];
  const size = audienceSizeCategory(poster.value);
  const duration = durationCategory(poster.value);
  return [
    listingTag("/talks", "material", "Poster", "Type", "type"),
    ...poster.value.venueTags.map((venue) => listingTag("/talks", "venue", venue, "Venue", "venue")),
    ...poster.value.topics.map((topic) => listingTag("/talks", "topic", topic, "Main Topic", "topic")),
    ...poster.value.audienceGroups.map((group) =>
      listingTag("/talks", "audienceGroup", group, "Audience Field", "audience"),
    ),
    ...(size ? [listingTag("/talks", "audienceSize", size, "Audience Size", "size")] : []),
    ...(duration ? [listingTag("/talks", "duration", duration, "Duration", "duration")] : []),
  ];
});
const hasDistinctAbstract = computed(
  () => poster.value?.abstract && poster.value.abstract.trim() !== poster.value.summary.trim(),
);
const detailRows = computed(() => (poster.value ? presentationDetailRows(poster.value) : []));
const highlight = computed(() => resolveHighlight(poster.value?.highlight));
const related = computed(() =>
  poster.value ? detailRelated(`poster:${poster.value.id}`, poster.value.related, poster.value.highlight) : [],
);
const tocEntries = computed(() =>
  detailToc([
    { id: "detail-highlight", label: "Highlight", show: highlight.value },
    { id: "detail-summary", label: "Summary" },
    { id: "detail-abstract", label: "Abstract", show: hasDistinctAbstract.value },
    { id: "detail-metadata", label: "Details", show: detailRows.value.length },
    { id: "detail-related", label: "Related", show: related.value.length },
    { id: "detail-poster", label: "Poster", level: 1 },
  ]),
);
</script>
