<template>
  <entry-card as="section" variant="panel" class="detail-section toc-anchor">
    <div class="detail-section-header">
      <content-heading>{{ title }}</content-heading>
      <slot name="actions" />
    </div>
    <slot />
  </entry-card>
</template>

<script setup lang="ts">
import EntryCard from "../ui/EntryCard.vue";
import ContentHeading from "../ui/ContentHeading.vue";

defineProps<{ title: string }>();
</script>

<style scoped>
.detail-section {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.detail-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-section :slotted(p) {
  margin: 0;
  line-height: 1.6;
  color: var(--text-muted);
}
</style>
