<template>
  <component
    :is="tag"
    class="work-section-block"
    :class="{
      'work-section-block-tinted': tintedInLightMode,
      'work-section-block-anchor': anchor,
    }"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Shared surface container for section blocks.
 * Keeps borders, radius, and light-mode tinting consistent across list/detail pages.
 */
export default defineComponent({
  name: "WorkSectionBlock",
  props: {
    tag: {
      type: String,
      default: "div",
    },
    tintedInLightMode: {
      type: Boolean,
      default: true,
    },
    anchor: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<style scoped>
.work-section-block {
  width: 100%;
  margin: 0 auto;
  background: var(--surface-elevated);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 18px;
  display: grid;
  gap: 14px;
}

.work-section-block-anchor {
  scroll-margin-top: 92px;
}

[data-theme="light"] .work-section-block-tinted {
  background: linear-gradient(
    180deg,
    rgba(var(--accent-secondary-rgb), 0.56),
    rgba(var(--accent-rgb), 0.16)
  );
  border-color: rgba(16, 36, 59, 0.14);
}

@media (max-width: 768px) {
  .work-section-block {
    padding: 10px 11px;
    gap: 10px;
  }
}
</style>
