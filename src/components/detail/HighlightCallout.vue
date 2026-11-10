<template>
  <entry-card
    id="detail-highlight"
    as="section"
    variant="panel"
    class="detail-highlight toc-anchor"
  >
    <p class="detail-highlight-kicker">Highlight</p>
    <content-heading>{{ highlight.label }}</content-heading>
    <p v-if="highlight.description" class="detail-highlight-text">
      {{ highlight.description }}
    </p>
    <div class="detail-highlight-actions">
      <action-link v-if="highlight.href" :href="highlight.href" shape="pill"
        >Open {{ highlight.label }}</action-link
      >
      <action-link
        v-if="highlight.related"
        :to="highlight.related.to"
        shape="pill"
        intent="detail"
        >{{ highlight.related.label }}</action-link
      >
    </div>
  </entry-card>
</template>

<script setup lang="ts">
import EntryCard from "../ui/EntryCard.vue";
import ContentHeading from "../ui/ContentHeading.vue";
import ActionLink from "../ui/ActionLink.vue";
import type { ResolvedHighlight } from "../../content/relations";

defineProps<{ highlight: ResolvedHighlight }>();
</script>

<style scoped>
.detail-highlight {
  display: grid;
  gap: 10px;
  outline-color: rgba(var(--accent-ink-rgb), 0.55);
  box-shadow: inset 5px 0 0 var(--accent-ink);
  background:
    linear-gradient(
      100deg,
      rgba(var(--accent-ink-rgb), 0.09),
      rgba(var(--accent-ink-rgb), 0) 60%
    ),
    var(--surface-elevated);
}

.detail-highlight-kicker {
  margin: 0;
  color: var(--accent-ink);
  font-size: var(--font-size-meta);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-highlight-text {
  margin: 0;
  line-height: 1.6;
  color: var(--text-muted);
}

.detail-highlight-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
