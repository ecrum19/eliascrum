<template>
  <detail-page
    :found="Boolean(software)"
    toc-title="Software"
    :toc-entries="tocEntries"
    :back="back"
    not-found-title="Software item not found"
    not-found-message="This software slug does not exist in the current software data."
  >
    <template v-if="software">
      <detail-header
        :kicker="sectionTitle"
        :title="software.title"
        :date="dateLabel(software.date)"
        :back="back"
        :actions="actions"
        :tags="tags"
      />
      <highlight-callout v-if="highlight" :highlight="highlight" />
      <detail-section id="detail-summary" title="Summary">
        <p>{{ software.summary }}</p>
      </detail-section>
      <detail-section v-if="hasDistinctDescription" id="detail-description" title="Description">
        <p>{{ software.description }}</p>
      </detail-section>
      <detail-section id="detail-metadata" title="Details">
        <metadata-list :rows="detailRows" />
      </detail-section>
      <detail-section v-if="related.length" id="detail-related" title="Related">
        <related-links :items="related" />
      </detail-section>
    </template>
  </detail-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { softwareCatalog } from "../content/catalog";
import { dateLabel } from "../content/dates";
import { relatedItems, resolveHighlight } from "../content/relations";
import { softwareDetailRows } from "../content/softwareDetails";
import { softwareReleasesBySoftwareId } from "../data/softwareReleases";
import DetailPage from "./detail/DetailPage.vue";
import DetailHeader from "./detail/DetailHeader.vue";
import DetailSection from "./detail/DetailSection.vue";
import HighlightCallout from "./detail/HighlightCallout.vue";
import MetadataList from "./detail/MetadataList.vue";
import RelatedLinks from "./detail/RelatedLinks.vue";
import { detailToc, listingTag, type DetailAction } from "./detail/detail";

const back = { to: "/software", label: "Back to Software" };
const route = useRoute();
const software = computed(() => softwareCatalog.bySlug(String(route.params.slug || "")));
const sectionTitle = computed(
  () =>
    softwareCatalog.sections.find((section) => section.id === software.value?.sectionId)?.title ??
    "Software",
);
const actions = computed<DetailAction[]>(() => {
  const { repository, website } = software.value?.links ?? {};
  return [
    ...(repository ? [{ label: "To Git Repo", href: repository }] : []),
    ...(website ? [{ label: "To Web Page", href: website }] : []),
  ];
});
const tags = computed(() =>
  software.value
    ? [
        listingTag("/software", "type", software.value.type, "Type", "type"),
        listingTag("/software", "purpose", software.value.purpose, "Purpose", "purpose"),
        ...software.value.topics.map((topic) =>
          listingTag("/software", "topic", topic, "Main Topic", "topic"),
        ),
      ]
    : [],
);
const highlight = computed(() => resolveHighlight(software.value?.highlight));
const hasDistinctDescription = computed(
  () => software.value && software.value.description.trim() !== software.value.summary.trim(),
);
const detailRows = computed(() =>
  software.value
    ? softwareDetailRows(
        software.value,
        sectionTitle.value,
        softwareReleasesBySoftwareId[software.value.id],
      )
    : [],
);
const related = computed(() =>
  software.value ? relatedItems(`software:${software.value.id}`, software.value.related) : [],
);
const tocEntries = computed(() =>
  detailToc([
    { id: "detail-highlight", label: "Highlight", show: highlight.value },
    { id: "detail-summary", label: "Summary" },
    { id: "detail-description", label: "Description", show: hasDistinctDescription.value },
    { id: "detail-metadata", label: "Details" },
    { id: "detail-related", label: "Related", show: related.value.length },
  ]),
);
</script>
