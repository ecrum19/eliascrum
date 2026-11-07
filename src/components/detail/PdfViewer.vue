<template>
  <div class="pdf-viewer" :class="`pdf-viewer-${variant}`">
    <template v-if="url && pdf.requested">
      <div v-if="zoomable || openHref" class="pdf-toolbar">
        <div v-if="zoomable" class="pdf-zoom-controls" aria-label="Zoom controls">
          <button type="button" class="pdf-zoom-btn" aria-label="Zoom out" @click="pdf.zoomOut">
            -
          </button>
          <button type="button" class="pdf-zoom-reset" @click="pdf.resetZoom">
            {{ pdf.zoomLabel }}
          </button>
          <button type="button" class="pdf-zoom-btn" aria-label="Zoom in" @click="pdf.zoomIn">
            +
          </button>
        </div>
        <a
          v-if="openHref"
          class="pdf-open-link"
          :href="normalizeLinkUrl(openHref)"
          :target="linkTarget(openHref)"
          :rel="linkRel(openHref)"
          >{{ openLabel }}</a
        >
      </div>
      <div class="pdf-frame">
        <div ref="shell" class="pdf-canvas-shell" @wheel="onWheel">
          <div class="pdf-canvas-stage">
            <canvas ref="canvas" class="pdf-canvas"></canvas>
          </div>
          <div v-if="pdf.isLoading" class="pdf-overlay">{{ loadingLabel }}</div>
          <div v-else-if="pdf.isRenderError" class="pdf-overlay">
            <span>Preview unavailable.</span>
            <span v-if="pdf.errorMessage" class="pdf-error-text">{{ pdf.errorMessage }}</span>
            <a v-if="openHref" :href="normalizeLinkUrl(openHref)">{{ openLabel }}</a>
          </div>
        </div>
        <div class="pdf-pagination" aria-label="Page navigation controls">
          <button
            type="button"
            class="pdf-page-btn"
            :disabled="pdf.currentPage <= 1"
            @click="pdf.previousPage"
          >
            Previous
          </button>
          <label class="pdf-page-label">
            <input
              class="pdf-page-input"
              type="number"
              min="1"
              :max="pdf.maxPage ?? undefined"
              inputmode="numeric"
              :value="pdf.currentPage"
              :style="pdf.pageInputStyle"
              aria-label="Current page"
              @change="pdf.onPageInput"
            />
            <span v-if="pdf.maxPage" class="pdf-page-total">/ {{ pdf.maxPage }}</span>
          </label>
          <button
            type="button"
            class="pdf-page-btn"
            :disabled="pdf.maxPage !== null && pdf.currentPage >= pdf.maxPage"
            @click="pdf.nextPage"
          >
            Next
          </button>
        </div>
      </div>
    </template>
    <deferred-preview-notice
      v-else-if="url"
      :message="deferMessage"
      :action-label="deferActionLabel"
      @load="pdf.request(url)"
    />
    <div v-else class="pdf-empty"><slot name="empty" /></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";
import { usePdfPreview } from "../../composables/usePdfPreview";
import { linkRel, linkTarget, normalizeLinkUrl } from "../../utils/links";
import DeferredPreviewNotice from "../layout/DeferredPreviewNotice.vue";

const props = withDefaults(
  defineProps<{
    /** The PDF to render inline; without it the `empty` slot explains why. */
    url?: string;
    openHref?: string;
    openLabel?: string;
    loadingLabel?: string;
    deferMessage: string;
    deferActionLabel: string;
    zoomable?: boolean;
    /** Documents scroll inside a padded frame; slides fill a dark stage. */
    variant?: "document" | "slides";
    /** Arrow keys turn pages while the visitor is not typing. */
    keyboardPaging?: boolean;
  }>(),
  {
    url: "",
    openHref: "",
    openLabel: "Open PDF",
    loadingLabel: "Loading PDF...",
    zoomable: true,
    variant: "document",
    keyboardPaging: false,
  },
);

const { preview: pdf, shell, canvas } = usePdfPreview();
defineExpose({ pdf });

watch(
  () => props.url,
  (url) => {
    pdf.currentPage = 1;
    pdf.zoom = 1;
    void pdf.load(pdf.requested ? url : "");
  },
  { immediate: true },
);

function onWheel(event: WheelEvent) {
  if (props.zoomable) pdf.onWheel(event);
}

function onKeydown(event: KeyboardEvent) {
  if (!props.url || !pdf.requested) return;
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target as HTMLElement | null;
  const tag = target?.tagName?.toLowerCase() ?? "";
  if (["input", "textarea", "select"].includes(tag) || target?.isContentEditable) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    pdf.previousPage();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    pdf.nextPage();
  }
}

onMounted(() => {
  if (props.keyboardPaging) window.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
.pdf-viewer {
  display: grid;
  gap: 10px;
}

.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.pdf-zoom-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
}

.pdf-zoom-btn,
.pdf-zoom-reset {
  border: 1px solid var(--surface-outline);
  background: rgba(148, 163, 184, 0.07);
  color: var(--page-text);
  border-radius: 999px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-meta);
  font-weight: 650;
  line-height: 1;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.16s ease;
}

.pdf-zoom-btn {
  width: 32px;
  padding: 0;
}

.pdf-zoom-reset {
  min-width: 72px;
  padding: 0 12px;
}

.pdf-zoom-btn:hover,
.pdf-zoom-reset:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.45);
  transform: translateY(-1px);
}

.pdf-zoom-btn:focus-visible,
.pdf-zoom-reset:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.78);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24);
}

.pdf-open-link {
  color: var(--link-color);
  text-decoration: none;
  font-size: var(--font-size-body);
}

.pdf-open-link:hover {
  text-decoration: underline;
}

.pdf-frame {
  width: 100%;
  height: clamp(560px, 80vh, 980px);
  min-height: 520px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
  background: #0f0f0f;
  resize: vertical;
}

.pdf-canvas-shell {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  background: #0f0f0f;
}

.pdf-viewer-document .pdf-canvas-shell {
  overflow: auto;
  padding: 16px;
  overscroll-behavior: contain;
}

.pdf-viewer-slides .pdf-canvas-shell {
  overflow: hidden;
}

.pdf-canvas-stage {
  width: max-content;
  min-width: 100%;
  min-height: 100%;
  display: grid;
  place-items: center;
}

.pdf-viewer-slides .pdf-canvas-stage {
  width: 100%;
  height: 100%;
}

.pdf-canvas {
  display: block;
  border: 0;
}

.pdf-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(15, 15, 15, 0.68);
  color: #f0f5ff;
  font-size: var(--font-size-meta);
  text-align: center;
  padding: 14px;
}

.pdf-overlay a {
  color: #9adfff;
  text-decoration: underline;
}

.pdf-error-text {
  font-size: var(--font-size-micro);
  opacity: 0.84;
}

.pdf-pagination {
  display: grid;
  grid-template-columns: minmax(92px, 132px) auto minmax(92px, 132px);
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: 12px 14px 14px;
  border-top: 1px solid var(--surface-outline);
  background: var(--surface-bg);
  flex: 0 0 auto;
}

.pdf-page-btn {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: var(--toggle-bg);
  color: var(--page-text);
  width: 100%;
  min-width: 0;
  padding: 7px 14px;
  font-size: var(--font-size-meta);
  font-weight: 650;
  letter-spacing: 0.01em;
  line-height: 1.2;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.16s ease,
    opacity 0.2s ease;
}

.pdf-page-btn:hover:not(:disabled) {
  background: rgba(var(--accent-rgb), 0.24);
  border-color: rgba(var(--accent-rgb), 0.54);
  box-shadow: 0 3px 10px rgba(8, 15, 31, 0.28);
  transform: translateY(-1px);
}

.pdf-page-btn:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.86);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.28);
}

.pdf-page-btn:disabled {
  opacity: 0.48;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.pdf-page-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: var(--toggle-bg);
  color: var(--page-text);
  font-size: var(--font-size-meta);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.pdf-page-label:focus-within {
  border-color: rgba(var(--accent-rgb), 0.86);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.28);
}

.pdf-page-input {
  width: auto;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--page-text);
  padding: 0;
  font-size: var(--font-size-meta);
  font-weight: 700;
  line-height: 1;
  text-align: center;
  font-variant-numeric: tabular-nums;
  appearance: textfield;
  -moz-appearance: textfield;
}

.pdf-page-input::-webkit-outer-spin-button,
.pdf-page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pdf-page-input:focus-visible {
  outline: none;
}

.pdf-page-total {
  opacity: 0.88;
  font-weight: 650;
  white-space: nowrap;
}

.pdf-empty:empty {
  display: none;
}

.pdf-empty {
  min-height: 220px;
  display: grid;
  place-items: center;
  gap: 12px;
  padding: 22px 18px;
  text-align: center;
  border: 1px solid var(--surface-outline);
  border-radius: 12px;
  background: var(--surface-card);
}

[data-theme="light"] .pdf-empty {
  background: rgba(16, 36, 59, 0.035);
}

@media (max-width: 768px) {
  .pdf-toolbar {
    justify-content: space-between;
  }

  .pdf-frame {
    min-height: 56vh;
    height: 62vh;
    max-height: 78vh;
    resize: none;
  }

  .pdf-viewer-document .pdf-canvas-shell {
    padding: 10px;
  }

  .pdf-pagination {
    padding: 8px 10px calc(10px + env(safe-area-inset-bottom, 0px));
    gap: 8px;
    grid-template-columns: minmax(78px, 1fr) auto minmax(78px, 1fr);
  }

  .pdf-page-btn {
    padding: 6px 10px;
    font-size: var(--font-size-micro);
  }

  .pdf-page-label {
    padding: 5px 9px;
    gap: 5px;
  }
}
</style>
