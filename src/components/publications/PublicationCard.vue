<template>
  <listing-card
    :id="`publication-${entry.id}`"
    class="publication-card"
    :title="entry.title"
    :to="entryPath(entry)"
    :date="year"
    :date-active="filters.year === year"
    :heading-level="2"
    @date="$emit('year', year)"
  >
    <template #meta>
      <p class="publication-authors">{{ entry.authors }}</p>
      <p class="publication-venue">{{ entry.venue }}</p>
    </template>
    <template #tags>
      <tag-chip
        kind="type"
        category="Type"
        :active="filters.type === entry.type"
        @click="$emit('tag', 'type', entry.type)"
        >{{ entry.type }}</tag-chip
      >
      <tag-chip
        v-for="venue in entry.venueTags"
        :key="`venue-${venue}`"
        kind="venue"
        category="Venue"
        :active="filters.venue === venue"
        @click="$emit('tag', 'venue', venue)"
        >{{ venue }}</tag-chip
      >
      <tag-chip
        v-for="topic in entry.topics"
        :key="`topic-${topic}`"
        kind="topic"
        category="Main Topic"
        :active="filters.topic === topic"
        @click="$emit('tag', 'topic', topic)"
        >{{ topic }}</tag-chip
      >
    </template>

    <p class="publication-summary">{{ entry.summary }}</p>
    <p v-if="highlight" class="publication-highlight">
      <span class="publication-highlight-kicker">Highlight</span>
      <a
        v-if="highlight.href"
        :href="normalizeLinkUrl(highlight.href)"
        :target="linkTarget(highlight.href)"
        :rel="linkRel(highlight.href)"
        >{{ highlight.label }}</a
      >
      <router-link v-else-if="highlight.related" :to="highlight.related.to">{{
        highlight.label
      }}</router-link>
      <span v-if="highlight.description"> — {{ highlight.description }}</span>
    </p>

    <button type="button" class="publication-expand-toggle" @click="expanded = !expanded">
      {{ expanded ? "Hide Details" : "Show Details" }}
    </button>
    <div v-show="expanded" class="publication-expanded">
      <section v-for="section in sections" :key="section.id" class="publication-expanded-block">
        <button
          type="button"
          class="publication-subsection-toggle"
          :aria-expanded="open[section.id]"
          @click="open[section.id] = !open[section.id]"
        >
          <span class="publication-subsection-label">{{ section.label }}</span>
          <span class="publication-subsection-state">{{ open[section.id] ? "Hide" : "Show" }}</span>
        </button>
        <div
          v-show="open[section.id]"
          class="publication-subsection-content"
          :class="{ 'publication-bibtex-shell': section.id === 'bibtex' }"
        >
          <template v-if="section.id === 'abstract'">
            <p v-if="entry.abstract">{{ entry.abstract }}</p>
            <p v-else class="publication-empty">No abstract is currently recorded for this item.</p>
          </template>
          <ul v-else-if="section.id === 'details'" class="publication-details-list">
            <li v-for="row in detailRows" :key="row.label">
              <span class="detail-label">{{ row.label }}:</span>
              <a
                v-if="row.href"
                :href="normalizeLinkUrl(row.href)"
                :target="linkTarget(row.href)"
                :rel="linkRel(row.href)"
                >{{ row.value }}</a
              >
              <span v-else>{{ row.value }}</span>
            </li>
          </ul>
          <template v-else>
            <button
              type="button"
              class="bibtex-copy-btn"
              :aria-label="copied ? 'BibTeX copied to clipboard' : 'Copy BibTeX citation to clipboard'"
              :title="copied ? 'Copied' : 'Copy BibTeX citation'"
              @click="copyBibtex"
            >
              <i class="fa" :class="copied ? 'fa-check' : 'fa-files-o'"></i>
            </button>
            <pre class="publication-bibtex"><code>{{ entry.bibtex }}</code></pre>
          </template>
        </div>
      </section>
      <div class="publication-expanded-actions">
        <action-link :to="entryPath(entry)" shape="pill" intent="detail">More Details</action-link>
        <action-link v-if="pdfUrl" :href="pdfUrl" shape="pill" intent="pdf"
          >Open Paper PDF</action-link
        >
        <action-link
          v-for="item in presentations"
          :key="item.key"
          :to="item.to"
          shape="pill"
          intent="detail"
          >{{ item.label }}</action-link
        >
      </div>
    </div>
  </listing-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { entryPath } from "../../content/catalog";
import {
  publicationDetailRows,
  publicationMetric,
  publicationPdfUrl,
} from "../../content/publicationDetails";
import type { PublicationFilters, PublicationTagKind } from "../../content/publicationFilters";
import { publicationYear } from "../../content/publicationFilters";
import { relatedItems, resolveHighlight, splitRef } from "../../content/relations";
import type { PublicationRecord } from "../../content/types";
import { copyText } from "../../utils/clipboard";
import { linkRel, linkTarget, normalizeLinkUrl } from "../../utils/links";
import ActionLink from "../ui/ActionLink.vue";
import ListingCard from "../ui/ListingCard.vue";
import TagChip from "../ui/TagChip.vue";

const props = defineProps<{ entry: PublicationRecord; filters: PublicationFilters }>();
defineEmits<{ tag: [kind: PublicationTagKind, value: string]; year: [value: string] }>();

const sections = [
  { id: "abstract", label: "Abstract" },
  { id: "details", label: "Additional Details" },
  { id: "bibtex", label: "BibTeX" },
] as const;
const expanded = ref(false);
const open = reactive({ abstract: true, details: false, bibtex: false });

const year = computed(() => publicationYear(props.entry));
const highlight = computed(() => resolveHighlight(props.entry.highlight));
const pdfUrl = computed(() => publicationPdfUrl(props.entry));
const detailRows = computed(() => [
  ...publicationDetailRows(props.entry),
  publicationMetric(props.entry),
]);
/** The paper's own talks and posters, labelled by what they are. */
const presentations = computed(() =>
  relatedItems(`publication:${props.entry.id}`, props.entry.related)
    .filter((item) => ["talk", "poster"].includes(splitRef(item.key)[0]))
    .map((item) => ({ ...item, label: splitRef(item.key)[0] === "talk" ? "Presentation" : "Poster" })),
);

const copied = ref(false);
let copiedResetTimer: ReturnType<typeof setTimeout> | undefined;
onBeforeUnmount(() => clearTimeout(copiedResetTimer));
async function copyBibtex() {
  if (!(await copyText(props.entry.bibtex))) return;
  copied.value = true;
  clearTimeout(copiedResetTimer);
  copiedResetTimer = setTimeout(() => {
    copied.value = false;
  }, 1800);
}
</script>

<style scoped>
.publication-authors {
  margin: 8px 0 0;
  color: var(--page-text);
  opacity: 0.95;
  line-height: 1.5;
  font-size: var(--font-size-body-lg);
}

.publication-venue {
  margin: 4px 0 0;
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body);
}

.publication-summary {
  margin: 10px 0 0;
  padding-left: 12px;
  border-left: 3px solid rgba(var(--accent-rgb), 0.45);
  color: var(--text-muted);
  line-height: 1.6;
  font-size: var(--list-summary-size);
}

[data-theme="light"] .publication-summary {
  border-left-color: rgba(var(--accent-ink-rgb), 0.42);
}

.publication-highlight {
  margin: 10px 0 0;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--accent-ink-rgb), 0.45);
  background: rgba(var(--accent-ink-rgb), 0.08);
  color: var(--text-muted);
  font-size: var(--font-size-body-sm);
  line-height: 1.5;
}

.publication-highlight-kicker {
  margin-right: 8px;
  color: var(--accent-ink);
  font-size: var(--font-size-micro);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.publication-highlight a {
  color: var(--link-color);
  font-weight: 600;
}

.publication-expand-toggle {
  margin-top: 8px;
  display: block;
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--text-soft);
  opacity: 1;
  font-size: var(--font-size-caption);
  letter-spacing: 0.07em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.publication-expand-toggle:hover {
  opacity: 1;
  text-decoration: underline;
}

.publication-expand-toggle:focus-visible {
  outline: 1px solid var(--surface-outline);
  outline-offset: 4px;
  border-radius: 4px;
}

.publication-expanded {
  margin-top: 9px;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.publication-expanded-block {
  background: var(--surface-card);
  border: 1px solid var(--surface-outline);
  border-radius: 8px;
  padding: 8px 10px;
  min-width: 0;
  overflow-x: hidden;
}

[data-theme="light"] .publication-expanded-block {
  background: rgba(16, 36, 59, 0.035);
}

.publication-subsection-toggle {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--page-text);
  padding: 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  cursor: pointer;
}

.publication-subsection-label {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-meta);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 1;
}

.publication-subsection-state {
  color: var(--text-soft);
  font-size: var(--font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 1;
}

.publication-subsection-content {
  margin-top: 6px;
}

.publication-expanded-block p {
  margin: 0;
  line-height: 1.55;
}

.publication-empty {
  color: var(--text-soft);
  opacity: 1;
}

.publication-details-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 5px;
}

.publication-details-list li {
  line-height: 1.45;
}

.publication-details-list a {
  color: var(--link-color);
}

.detail-label {
  font-weight: 700;
  margin-right: 6px;
}

.publication-expanded-actions {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 10px;
  justify-content: flex-end;
}

.publication-bibtex-shell {
  position: relative;
}

.publication-bibtex {
  margin: 0;
  overflow-x: auto;
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: var(--font-size-label);
  line-height: 1.4;
  padding: 7px 34px 7px 7px;
  border-radius: 8px;
  border: 1px solid var(--surface-outline);
  background: rgba(0, 0, 0, 0.18);
}

[data-theme="light"] .publication-bibtex {
  background: rgba(16, 36, 59, 0.08);
}

.publication-bibtex code {
  white-space: inherit;
  overflow-wrap: inherit;
  word-break: inherit;
}

.bibtex-copy-btn {
  position: absolute;
  top: 7px;
  right: 5px;
  width: 24px;
  height: 24px;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  font-size: var(--font-size-caption);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.82;
  transition:
    background-color 0.18s ease,
    opacity 0.18s ease;
}

.bibtex-copy-btn:hover {
  opacity: 1;
  background: var(--nav-hover-bg);
}
</style>
