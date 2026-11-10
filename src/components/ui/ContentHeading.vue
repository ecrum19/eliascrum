<template>
  <component
    :is="`h${level}`"
    class="content-heading"
    :class="{
      'content-heading-page': level === 1,
      'content-heading-compact': compact,
    }"
    ><slot
  /></component>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ level?: 1 | 2; compact?: boolean }>(), { level: 2 });
</script>
<style scoped>
.content-heading {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  font-weight: 600;
}
.content-heading-page {
  font-size: var(--content-h1-size);
}
.content-heading-compact {
  line-height: 1.08;
}
</style>
