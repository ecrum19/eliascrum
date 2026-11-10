<template>
  <dl class="metadata-list">
    <div v-for="row in rows" :key="row.label" class="metadata-row">
      <dt>{{ row.label }}</dt>
      <dd>
        <a
          v-if="row.href"
          :href="normalizeLinkUrl(row.href)"
          :target="linkTarget(row.href)"
          :rel="linkRel(row.href)"
          >{{ row.value }}</a
        >
        <span v-else>{{ row.value }}</span>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { DetailField } from "../../content/types";
import { linkRel, linkTarget, normalizeLinkUrl } from "../../utils/links";

defineProps<{ rows: DetailField[] }>();
</script>

<style scoped>
.metadata-list {
  margin: 0;
  display: grid;
  gap: 8px;
}

.metadata-row {
  display: grid;
  grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
  gap: 14px;
}

.metadata-row dt {
  font-weight: 700;
  color: var(--page-text);
}

.metadata-row dd {
  margin: 0;
  color: var(--text-muted);
  min-width: 0;
  overflow-wrap: anywhere;
}

.metadata-row a {
  color: var(--link-color);
}

@media (max-width: 780px) {
  .metadata-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }
}
</style>
