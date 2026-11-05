<template>
  <component
    :is="as"
    class="entry-card"
    :class="{ 'entry-card-panel': variant === 'panel' }"
    ><slot
  /></component>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "article" | "header" | "section";
    variant?: "card" | "panel";
  }>(),
  { as: "article", variant: "card" },
);
</script>
<style scoped>
.entry-card {
  background: var(--surface-elevated);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
  position: relative;
}

@media (max-width: 768px) {
  .entry-card {
    padding: 12px;
  }
}
@media (max-width: 780px) {
  .entry-card-panel {
    padding: 14px;
  }
}
</style>
