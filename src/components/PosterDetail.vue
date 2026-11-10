<template>
  <detail-page
    :found="Boolean(poster)"
    toc-title="Poster"
    :toc-entries="tocEntries"
    :back="back"
    not-found-title="Poster not found"
    not-found-message="This poster slug does not exist in the generated poster data."
  >
    <template v-if="poster">
      <detail-header
        :kicker="['Poster', ...poster.venueTags].join(' • ')"
        :title="poster.displayTitle"
        :date="dateLabel"
        :back="back"
        :actions="[{ label: 'Open Poster PDF', href: posterPdfUrl }]"
        :tags="tags"
      />
      <highlight-callout v-if="highlight" :highlight="highlight" />
      <detail-section v-if="poster.summary" id="detail-summary" title="Summary">
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
import { getPosterViewBySlug } from "../data/posterCatalog";
import { relatedItems, resolveHighlight } from "../content/relations";
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
const poster = computed(() => getPosterViewBySlug(String(route.params.slug || "")));
const posterPdfUrl = computed(() => (poster.value ? resolvePublicAssetPath(poster.value.path) : ""));
const dateLabel = computed(() =>
  !poster.value || poster.value.displayDateIso === "1900-01-01" ? "Undated" : poster.value.displayDateIso,
);
const tags = computed(() =>
  poster.value
    ? [
        listingTag("/talks", "material", "Poster", "Type", "type"),
        ...poster.value.venueTags.map((venue) => listingTag("/talks", "venue", String(venue), "Venue", "venue")),
        ...poster.value.topicTags.map((topic) => listingTag("/talks", "topic", String(topic), "Main Topic", "topic")),
        ...poster.value.audienceGroups.map((group) =>
          listingTag("/talks", "audienceGroup", String(group), "Audience Field", "audience"),
        ),
      ]
    : [],
);
const hasDistinctAbstract = computed(
  () => poster.value?.abstract && poster.value.abstract.trim() !== poster.value.summary.trim(),
);
const detailRows = computed(() =>
  poster.value
    ? [
        ...(poster.value.goal ? [{ label: "Goal", value: poster.value.goal }] : []),
        ...(poster.value.audienceExpertise
          ? [{ label: "Audience Expertise", value: poster.value.audienceExpertise }]
          : []),
        ...poster.value.relatedResources.map(({ label, url }) => ({ label, value: url, href: url })),
      ]
    : [],
);
const highlight = computed(() => resolveHighlight(poster.value?.highlight));
const related = computed(() => (poster.value ? relatedItems(`poster:${poster.value.slug}`) : []));
const tocEntries = computed(() =>
  detailToc([
    { id: "detail-highlight", label: "Highlight", show: highlight.value },
    { id: "detail-summary", label: "Summary", show: poster.value?.summary },
    { id: "detail-abstract", label: "Abstract", show: hasDistinctAbstract.value },
    { id: "detail-metadata", label: "Details", show: detailRows.value.length },
    { id: "detail-related", label: "Related", show: related.value.length },
    { id: "detail-poster", label: "Poster", level: 1 },
  ]),
);
</script>
