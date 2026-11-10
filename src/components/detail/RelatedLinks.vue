<template>
  <div class="related-links">
    <action-link
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      shape="pill"
      intent="detail"
      >{{ item.label }}</action-link
    >
  </div>
</template>

<script setup lang="ts">
import ActionLink from "../ui/ActionLink.vue";
import type { RelatedItem } from "../../content/relations";

defineProps<{ items: RelatedItem[] }>();
</script>

<style scoped>
.related-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
