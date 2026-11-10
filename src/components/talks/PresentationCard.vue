<template>
  <entry-card :id="presentationAnchor(entry)" class="presentation-card toc-anchor">
    <div class="presentation-layout">
      <div class="presentation-main">
        <div class="presentation-meta">
          <span class="presentation-date">{{ dateLabel(entry.date) }}</span>
        </div>
        <h2 class="presentation-title">
          <router-link :to="path">{{ entry.title }}</router-link>
        </h2>
        <div class="presentation-tags">
          <tag-chip
            v-for="tag in tags"
            :key="`${tag.kind}-${tag.value}`"
            :kind="tag.color"
            :category="tag.category"
            :active="filters[tag.kind] === tag.value"
            @click="$emit('tag', tag.kind, tag.value)"
            >{{ tag.value }}</tag-chip
          >
        </div>
        <p class="presentation-summary">{{ entry.summary }}</p>
        <div class="presentation-actions">
          <action-link :to="path" intent="detail">Show Details</action-link>
          <action-link :href="primary.href" intent="pdf">{{ primary.label }}</action-link>
          <action-link
            v-for="poster in posters"
            :key="poster.id"
            :href="posterPdfPath(poster)"
            intent="pdf"
            >Open Poster PDF</action-link
          >
          <action-link v-for="paper in papers" :key="paper.key" :to="paper.to" intent="detail"
            >Related Paper</action-link
          >
        </div>
      </div>

      <aside class="preview-shell">
        <button type="button" class="preview-toggle" @click="previewOpen = !previewOpen">
          {{ previewOpen ? "Hide Preview" : "Show Preview" }}
        </button>
        <template v-if="previewOpen">
          <iframe
            v-if="embedUrl"
            :src="embedUrl"
            :title="`${entry.title} — slide preview`"
            class="preview-frame"
            loading="lazy"
            allowfullscreen
          ></iframe>
          <object
            v-else
            :data="`${resolvePublicAssetPath(primary.href)}#page=1&zoom=page-fit`"
            type="application/pdf"
            class="preview-frame"
          >
            <div class="preview-fallback">
              <i class="fa fa-file-pdf-o"></i>
              <span>Preview unavailable</span>
            </div>
          </object>
        </template>
      </aside>
    </div>
  </entry-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { dateLabel, entryPath } from "../../content/catalog";
import {
  posterPdfPath,
  slidesUrl,
  talkPosters,
  type PresentationRecord,
} from "../../content/presentationDetails";
import {
  presentationAnchor,
  presentationTags,
  type PresentationFilters,
  type PresentationTagKind,
} from "../../content/presentationFilters";
import { relatedItems, splitRef } from "../../content/relations";
import { resolvePublicAssetPath } from "../../utils/publicAssetPath";
import ActionLink from "../ui/ActionLink.vue";
import EntryCard from "../ui/EntryCard.vue";
import TagChip from "../ui/TagChip.vue";
import type { TagColor } from "../ui/tagColors";

const props = defineProps<{ entry: PresentationRecord; filters: PresentationFilters }>();
defineEmits<{ tag: [kind: PresentationTagKind, value: string] }>();

const TAG_STYLES: Record<PresentationTagKind, { color: TagColor; category: string }> = {
  material: { color: "type", category: "Type" },
  venue: { color: "venue", category: "Venue" },
  topic: { color: "topic", category: "Main Topic" },
  duration: { color: "duration", category: "Duration" },
  audienceSize: { color: "size", category: "Audience Size" },
  audienceGroup: { color: "audience", category: "Audience Field" },
};

const previewOpen = ref(false);
const path = computed(() => entryPath(props.entry));
const tags = computed(() =>
  Object.entries(presentationTags(props.entry)).flatMap(([kind, values]) =>
    values.map((value) => ({ kind: kind as PresentationTagKind, value, ...TAG_STYLES[kind as PresentationTagKind] })),
  ),
);
const primary = computed(() => {
  const { entry } = props;
  if (entry.kind === "poster") return { href: posterPdfPath(entry), label: "Open Poster PDF" };
  const label = entry.slides.format === "html" ? "Open HTML Slides" : "Open Slides PDF";
  return { href: slidesUrl(entry), label };
});
const posters = computed(() => (props.entry.kind === "talk" ? talkPosters(props.entry) : []));
/** HTML decks preview through their player; PDFs (even with a Google Slides embed) as a PDF. */
const embedUrl = computed(() => {
  const { entry } = props;
  return entry.kind === "talk" && entry.slides.format === "html"
    ? (entry.slides.embedUrl ?? entry.slides.url)
    : undefined;
});
const papers = computed(() =>
  relatedItems(`${props.entry.kind}:${props.entry.id}`, props.entry.related).filter(
    (item) => splitRef(item.key)[0] === "publication",
  ),
);
</script>

<style scoped>
.presentation-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(250px, 31vw, 390px);
  gap: 6px;
  align-items: start;
}

.presentation-main {
  position: relative;
  z-index: 0;
}

.presentation-meta {
  display: flex;
}

.presentation-date {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: var(--list-date-size);
  font-weight: 750;
  letter-spacing: 0.01em;
}

.presentation-title {
  margin: 10px 0 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--list-title-size);
  position: relative;
  z-index: 1;
}

.presentation-title a {
  color: var(--link-color);
  text-decoration: none;
}

.presentation-title a:hover {
  text-decoration: underline;
}

.presentation-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.presentation-summary {
  margin: 10px 0 0;
  line-height: 1.5;
  color: var(--text-muted);
  font-size: var(--list-summary-size);
  opacity: 1;
}

.presentation-actions {
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
  margin-top: 16px;
}

.preview-shell {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-right: clamp(12px, 2.6vw, 24px);
}

.preview-toggle {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: var(--text-soft);
  opacity: 1;
  font-size: var(--font-size-micro);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 2px 0;
  line-height: 1;
}

.preview-toggle:hover {
  text-decoration: underline;
}

.preview-toggle:focus-visible {
  outline: 1px solid var(--surface-outline);
  outline-offset: 3px;
  border-radius: 4px;
}

.preview-frame {
  margin-top: 6px;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
  background: var(--toggle-bg);
}

.preview-fallback {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}

.preview-fallback i {
  font-size: var(--font-size-card-title);
}

@media (max-width: 768px) {
  .presentation-card {
    padding: 14px;
  }

  .presentation-actions a {
    width: 100%;
  }

  .presentation-layout {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .preview-shell {
    padding-right: 0;
  }

  .preview-toggle {
    align-self: flex-start;
  }
}
</style>
