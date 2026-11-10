<template>
  <object
    v-if="requested"
    :data="`${url}#page=1&zoom=page-fit`"
    type="application/pdf"
    class="poster-frame"
  >
    <p>
      Your browser cannot render the PDF inline.
      <a :href="url">Open the poster</a>.
    </p>
  </object>
  <deferred-preview-notice
    v-else
    message="Lite mode pauses poster previews until you choose to load one."
    action-label="Load Poster Preview"
    @load="requested = true"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { shouldDeferPdfPreviews } from "../../utils/performanceMode";
import DeferredPreviewNotice from "../layout/DeferredPreviewNotice.vue";

defineProps<{ url: string }>();
// The browser's own PDF viewer renders posters; Lite mode loads it only on request.
const requested = ref(!shouldDeferPdfPreviews());
</script>

<style scoped>
.poster-frame {
  width: 100%;
  min-height: 75vh;
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
}

@media (max-width: 768px) {
  .poster-frame {
    min-height: 62vh;
  }
}
</style>
