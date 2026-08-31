<template>
  <section class="deferred-preview" aria-live="polite">
    <p>{{ message }}</p>
    <button type="button" class="deferred-preview__button btn-detail" @click="$emit('load')">
      {{ actionLabel }}
    </button>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DeferredPreviewNotice",
  props: {
    actionLabel: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  emits: ["load"],
});
</script>

<style scoped>
/* A shared, explicit opt-in state prevents Lite mode from requesting preview media on page load. */
.deferred-preview {
  min-height: 180px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  padding: 28px;
  border: 1px dashed var(--surface-outline);
  border-radius: 14px;
  background: var(--surface-card);
  color: var(--text-muted);
  text-align: center;
}

.deferred-preview p {
  max-width: 42rem;
  margin: 0;
}

.deferred-preview__button {
  padding: 9px 15px;
  cursor: pointer;
}
</style>
