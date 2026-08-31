<template>
  <work-page-layout
    id="fellowship-detail"
    :toc-entries="tocEntries"
    toc-title="Fellowship"
    max-width="min(1780px, 97vw)"
    page-padding="0 16px 140px"
  >
    <section id="fellowship-overview" class="work-section toc-anchor">
      <header class="fellowship-header">
        <p class="fellowship-kicker">{{ fellowship.subtitle }}</p>
        <h1>{{ fellowship.title }}</h1>
        <p class="fellowship-summary">{{ fellowship.summary }}</p>
        <div class="fellowship-actions">
          <router-link to="/about" class="fellowship-action-btn btn-back">Back to About</router-link>
          <a
            :href="projectDescriptionPdfHref"
            target="_blank"
            rel="noopener noreferrer"
            class="fellowship-action-btn btn-pdf"
          >
            Open Project Description PDF
          </a>
          <component
            :is="isDefenseSlidesInternal ? 'router-link' : 'a'"
            :to="isDefenseSlidesInternal ? fellowship.defenseSlidesUrl : undefined"
            :href="!isDefenseSlidesInternal ? fellowship.defenseSlidesUrl : undefined"
            :target="!isDefenseSlidesInternal ? '_blank' : undefined"
            :rel="!isDefenseSlidesInternal ? 'noopener noreferrer' : undefined"
            class="fellowship-action-btn btn-external"
          >
            FWO Fellowship Defense Slides
          </component>
        </div>
      </header>
    </section>

    <section id="fellowship-details" class="work-section toc-anchor">
      <article class="fellowship-panel">
        <h2>Fellowship Details</h2>
        <dl class="fellowship-detail-list">
          <div v-for="detail in fellowship.details" :key="detail.label" class="fellowship-detail-row">
            <dt>{{ detail.label }}</dt>
            <dd>{{ detail.value }}</dd>
          </div>
        </dl>
      </article>
    </section>

    <section id="fellowship-description-pdf" class="work-section toc-anchor">
      <article class="fellowship-panel">
        <div class="fellowship-panel-header">
          <h2>Project Description PDF</h2>
          <div class="fellowship-panel-tools">
            <div v-if="pdfPreviewRequested" class="fellowship-zoom-controls" aria-label="PDF zoom controls">
              <button
                type="button"
                class="fellowship-zoom-btn"
                aria-label="Zoom out"
                @click="zoomOutPdf"
              >
                -
              </button>
              <button
                type="button"
                class="fellowship-zoom-reset"
                @click="resetPdfZoom"
              >
                {{ pdfZoomPercentage }}
              </button>
              <button
                type="button"
                class="fellowship-zoom-btn"
                aria-label="Zoom in"
                @click="zoomInPdf"
              >
                +
              </button>
            </div>
            <a
              :href="projectDescriptionPdfHref"
              target="_blank"
              rel="noopener noreferrer"
              class="fellowship-inline-link"
            >
              Open Project Description PDF
            </a>
          </div>
        </div>

        <div v-if="pdfPreviewRequested" class="fellowship-frame-shell">
          <div
            ref="fellowshipCanvasShell"
            class="fellowship-canvas-shell"
            @wheel="onFellowshipViewerWheel"
          >
            <div class="fellowship-canvas-stage">
              <canvas ref="fellowshipCanvas" class="fellowship-canvas"></canvas>
            </div>
            <div v-if="isPdfLoading" class="fellowship-canvas-overlay">
              Loading PDF...
            </div>
            <div v-else-if="isPdfRenderError" class="fellowship-canvas-overlay">
              <span>Preview unavailable.</span>
              <span v-if="pdfRenderErrorMessage" class="fellowship-error-text">{{ pdfRenderErrorMessage }}</span>
              <a
                :href="projectDescriptionPdfHref"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Project Description PDF
              </a>
            </div>
          </div>
          <div class="fellowship-pagination" aria-label="PDF page navigation controls">
            <button
              type="button"
              class="fellowship-page-btn"
              @click="goToPreviousPdfPage"
              :disabled="currentPdfPage <= 1"
            >
              Previous
            </button>
            <label class="fellowship-page-label" for="fellowship-page-input">
              <input
                id="fellowship-page-input"
                class="fellowship-page-input"
                type="number"
                min="1"
                :max="maxPdfPage ?? undefined"
                inputmode="numeric"
                :value="currentPdfPage"
                :style="pdfPageInputStyle"
                aria-label="Current PDF page"
                @change="onPdfPageInputChange"
              />
              <span v-if="maxPdfPage" class="fellowship-page-total">/ {{ maxPdfPage }}</span>
            </label>
            <button
              type="button"
              class="fellowship-page-btn"
              @click="goToNextPdfPage"
              :disabled="maxPdfPage !== null && currentPdfPage >= maxPdfPage"
            >
              Next
            </button>
          </div>
        </div>
        <deferred-preview-notice
          v-else
          message="Lite mode pauses inline PDF previews until you choose to load one."
          action-label="Load Project Description Preview"
          @load="requestPdfPreview"
        />
      </article>
    </section>
  </work-page-layout>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import WorkPageLayout from "./layout/WorkPageLayout.vue";
import { fwoPhdFellowship } from "../data/fellowshipData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import {
  loadPdfJs,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask,
} from "../utils/pdfJs";
import { shouldDeferPdfPreviews } from "../utils/performanceMode";
import DeferredPreviewNotice from "./layout/DeferredPreviewNotice.vue";

interface WorkTocEntry {
  id: string;
  label: string;
  level?: number;
}

export default defineComponent({
  name: "FellowshipDetail",
  components: {
    DeferredPreviewNotice,
    WorkPageLayout,
  },
  data() {
    return {
      currentPdfPage: 1,
      pdfZoomScale: 1,
      maxPdfPage: null as number | null,
      isPdfLoading: false,
      isPdfRenderError: false,
      pdfRenderErrorMessage: "",
      pdfLoadingTask: null as PDFDocumentLoadingTask | null,
      pdfDocument: null as PDFDocumentProxy | null,
      pdfRenderTask: null as RenderTask | null,
      pdfLoadToken: 0,
      pdfRenderToken: 0,
      pendingPdfRenderFrame: null as number | null,
      pdfResizeObserver: null as ResizeObserver | null,
      // Keep the PDF.js import and PDF request behind a user action in Lite mode.
      pdfPreviewRequested: !shouldDeferPdfPreviews(),
    };
  },
  computed: {
    fellowship() {
      return fwoPhdFellowship;
    },
    projectDescriptionPdfHref(): string {
      return resolvePublicAssetPath(this.fellowship.projectDescriptionPdfUrl);
    },
    isDefenseSlidesInternal(): boolean {
      return this.fellowship.defenseSlidesUrl.startsWith("/");
    },
    pdfZoomPercentage(): string {
      return `${Math.round(this.pdfZoomScale * 100)}%`;
    },
    pdfPageInputStyle(): Record<string, string> {
      const digitCount = String(Math.max(1, this.currentPdfPage)).length;
      const widthCh = Math.min(4.4, Math.max(1.7, digitCount + 0.35));
      return {
        width: `${widthCh}ch`,
      };
    },
    tocEntries(): WorkTocEntry[] {
      return [
        { id: "fellowship-overview", label: "Overview", level: 1 },
        { id: "fellowship-details", label: "Details", level: 2 },
        { id: "fellowship-description-pdf", label: "Project PDF", level: 2 },
      ];
    },
  },
  watch: {
    projectDescriptionPdfHref: {
      immediate: true,
      handler(nextUrl: string) {
        this.currentPdfPage = 1;
        this.pdfZoomScale = 1;
        this.maxPdfPage = null;
        void this.loadPdfDocument(this.pdfPreviewRequested ? (nextUrl || "") : "");
      },
    },
    currentPdfPage() {
      this.resetPdfScrollPosition();
      this.queuePdfRender();
    },
    pdfZoomScale() {
      this.queuePdfRender();
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.pdfPreviewRequested) {
        return;
      }
      this.initPdfResizeObserver();
      this.queuePdfRender();
    });
  },
  beforeUnmount() {
    if (this.pendingPdfRenderFrame !== null) {
      window.cancelAnimationFrame(this.pendingPdfRenderFrame);
      this.pendingPdfRenderFrame = null;
    }
    if (this.pdfResizeObserver) {
      this.pdfResizeObserver.disconnect();
      this.pdfResizeObserver = null;
    }
    if (this.pdfLoadingTask) {
      void this.pdfLoadingTask.destroy();
      this.pdfLoadingTask = null;
    }
    if (this.pdfRenderTask) {
      this.pdfRenderTask.cancel();
      this.pdfRenderTask = null;
    }
    if (this.pdfDocument) {
      void this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
  },
  methods: {
    isPdfCancellationError(error: unknown): boolean {
      const errorName = (error as { name?: string })?.name;
      return (
        errorName === "RenderingCancelledException" ||
        errorName === "AbortException" ||
        errorName === "CancelledException"
      );
    },
    stringifyPdfError(error: unknown): string {
      if (!error) {
        return "Unknown rendering error.";
      }
      if (typeof error === "string") {
        return error;
      }
      if (typeof error === "object") {
        const candidate = error as { message?: unknown; name?: unknown };
        if (typeof candidate.message === "string" && candidate.message.trim().length > 0) {
          return candidate.message;
        }
        if (typeof candidate.name === "string" && candidate.name.trim().length > 0) {
          return candidate.name;
        }
      }
      return "PDF preview failed to render.";
    },
    initPdfResizeObserver() {
      if (typeof ResizeObserver === "undefined") {
        return;
      }
      const shell = this.$refs.fellowshipCanvasShell as HTMLElement | undefined;
      if (!shell) {
        return;
      }
      if (this.pdfResizeObserver) {
        this.pdfResizeObserver.disconnect();
      }
      this.pdfResizeObserver = markRaw(new ResizeObserver(() => {
        this.queuePdfRender();
      }));
      this.pdfResizeObserver.observe(shell);
    },
    clampPdfZoom(scale: number): number {
      return Math.min(3.5, Math.max(0.8, scale));
    },
    setPdfZoom(scale: number) {
      this.pdfZoomScale = this.clampPdfZoom(scale);
    },
    zoomInPdf() {
      this.setPdfZoom(this.pdfZoomScale * 1.18);
    },
    zoomOutPdf() {
      this.setPdfZoom(this.pdfZoomScale / 1.18);
    },
    resetPdfZoom() {
      this.pdfZoomScale = 1;
    },
    onFellowshipViewerWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomInPdf();
        return;
      }
      if (event.deltaY > 0) {
        this.zoomOutPdf();
      }
    },
    resetPdfScrollPosition() {
      const shell = this.$refs.fellowshipCanvasShell as HTMLElement | undefined;
      if (!shell) {
        return;
      }
      shell.scrollTop = 0;
      shell.scrollLeft = 0;
    },
    requestPdfPreview() {
      if (this.pdfPreviewRequested) {
        return;
      }

      this.pdfPreviewRequested = true;
      this.$nextTick(() => {
        this.initPdfResizeObserver();
        void this.loadPdfDocument(this.projectDescriptionPdfHref);
      });
    },
    async loadPdfDocument(pdfUrl: string) {
      const loadToken = ++this.pdfLoadToken;
      this.isPdfLoading = Boolean(pdfUrl);
      this.isPdfRenderError = false;
      this.pdfRenderErrorMessage = "";
      this.maxPdfPage = null;
      this.pdfRenderToken += 1;

      if (this.pdfLoadingTask) {
        try {
          await this.pdfLoadingTask.destroy();
        } catch {
          // Ignore cancellation cleanup errors.
        }
        this.pdfLoadingTask = null;
      }
      if (this.pdfRenderTask) {
        this.pdfRenderTask.cancel();
        this.pdfRenderTask = null;
      }
      if (this.pdfDocument) {
        try {
          await this.pdfDocument.destroy();
        } catch {
          // Ignore cleanup errors.
        }
        this.pdfDocument = null;
      }

      if (!pdfUrl) {
        this.isPdfLoading = false;
        return;
      }

      let loadingTask: PDFDocumentLoadingTask | null = null;
      try {
        const { getDocument } = await loadPdfJs();
        loadingTask = getDocument({ url: pdfUrl });
        this.pdfLoadingTask = markRaw(loadingTask);
        const nextDocument = await loadingTask.promise;
        if (this.pdfLoadingTask === loadingTask) {
          this.pdfLoadingTask = null;
        }
        if (loadToken !== this.pdfLoadToken) {
          void nextDocument.destroy();
          return;
        }

        this.pdfDocument = markRaw(nextDocument);
        this.maxPdfPage = nextDocument.numPages;
        this.currentPdfPage = Math.min(Math.max(1, this.currentPdfPage), nextDocument.numPages);
        this.$nextTick(() => {
          this.initPdfResizeObserver();
          this.queuePdfRender();
        });
      } catch (error) {
        if (loadToken !== this.pdfLoadToken) {
          return;
        }
        if (this.isPdfCancellationError(error)) {
          return;
        }
        this.isPdfRenderError = true;
        this.pdfRenderErrorMessage = this.stringifyPdfError(error);
      } finally {
        if (this.pdfLoadingTask === loadingTask) {
          this.pdfLoadingTask = null;
        }
        if (loadToken === this.pdfLoadToken) {
          this.isPdfLoading = false;
        }
      }
    },
    queuePdfRender() {
      if (!this.pdfDocument || this.isPdfLoading) {
        return;
      }

      const nextRenderToken = ++this.pdfRenderToken;
      if (this.pendingPdfRenderFrame !== null) {
        window.cancelAnimationFrame(this.pendingPdfRenderFrame);
      }
      this.pendingPdfRenderFrame = window.requestAnimationFrame(() => {
        this.pendingPdfRenderFrame = null;
        void this.renderCurrentPdfPage(nextRenderToken);
      });
    },
    async renderCurrentPdfPage(renderToken: number) {
      const activeDocument = this.pdfDocument;
      if (!activeDocument || renderToken !== this.pdfRenderToken) {
        return;
      }

      const canvasShell = this.$refs.fellowshipCanvasShell as HTMLElement | undefined;
      const canvas = this.$refs.fellowshipCanvas as HTMLCanvasElement | undefined;
      if (!canvasShell || !canvas) {
        return;
      }

      const shellStyle = window.getComputedStyle(canvasShell);
      const shellWidth =
        canvasShell.clientWidth -
        Number.parseFloat(shellStyle.paddingLeft || "0") -
        Number.parseFloat(shellStyle.paddingRight || "0");
      const shellHeight =
        canvasShell.clientHeight -
        Number.parseFloat(shellStyle.paddingTop || "0") -
        Number.parseFloat(shellStyle.paddingBottom || "0");
      if (shellWidth < 2 || shellHeight < 2) {
        return;
      }

      const maxPage = activeDocument.numPages;
      const normalizedPage = Math.min(maxPage, Math.max(1, this.currentPdfPage));
      if (normalizedPage !== this.currentPdfPage) {
        this.currentPdfPage = normalizedPage;
        return;
      }

      if (this.pdfRenderTask) {
        const runningTask = this.pdfRenderTask;
        runningTask.cancel();
        try {
          await runningTask.promise;
        } catch (error) {
          if (!this.isPdfCancellationError(error)) {
            this.isPdfRenderError = true;
            this.pdfRenderErrorMessage = this.stringifyPdfError(error);
            return;
          }
        } finally {
          if (this.pdfRenderTask === runningTask) {
            this.pdfRenderTask = null;
          }
        }
      }

      if (renderToken !== this.pdfRenderToken || this.pdfDocument !== activeDocument) {
        return;
      }

      let page;
      try {
        page = await activeDocument.getPage(normalizedPage);
      } catch (error) {
        if (this.isPdfCancellationError(error)) {
          return;
        }
        this.isPdfRenderError = true;
        this.pdfRenderErrorMessage = this.stringifyPdfError(error);
        return;
      }

      if (renderToken !== this.pdfRenderToken || this.pdfDocument !== activeDocument) {
        return;
      }

      const viewportBase = page.getViewport({ scale: 1 });
      const widthScale = shellWidth / viewportBase.width;
      const heightScale = shellHeight / viewportBase.height;
      const fitScale = Math.max(0.1, Math.min(widthScale, heightScale));
      const effectiveScale = fitScale * this.pdfZoomScale;
      const devicePixelRatio = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));

      const cssViewport = page.getViewport({ scale: effectiveScale });
      const renderViewport = page.getViewport({ scale: effectiveScale * devicePixelRatio });

      canvas.width = Math.max(1, Math.floor(renderViewport.width));
      canvas.height = Math.max(1, Math.floor(renderViewport.height));
      canvas.style.width = `${cssViewport.width}px`;
      canvas.style.height = `${cssViewport.height}px`;

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        this.isPdfRenderError = true;
        this.pdfRenderErrorMessage = "Canvas context unavailable.";
        return;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({
        canvasContext: context,
        viewport: renderViewport,
      });
      this.pdfRenderTask = markRaw(renderTask);
      this.isPdfRenderError = false;
      this.pdfRenderErrorMessage = "";

      try {
        await renderTask.promise;
      } catch (error) {
        if (!this.isPdfCancellationError(error)) {
          this.isPdfRenderError = true;
          this.pdfRenderErrorMessage = this.stringifyPdfError(error);
        }
      } finally {
        if (this.pdfRenderTask === renderTask) {
          this.pdfRenderTask = null;
        }
      }
    },
    goToPreviousPdfPage() {
      this.currentPdfPage = Math.max(1, this.currentPdfPage - 1);
    },
    goToNextPdfPage() {
      if (this.maxPdfPage !== null) {
        this.currentPdfPage = Math.min(this.maxPdfPage, this.currentPdfPage + 1);
        return;
      }
      this.currentPdfPage += 1;
    },
    onPdfPageInputChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const raw = Number.parseInt(target.value, 10);
      const normalized = Number.isFinite(raw) ? Math.max(1, raw) : this.currentPdfPage;
      const maxPage = this.maxPdfPage;
      this.currentPdfPage = maxPage !== null ? Math.min(maxPage, normalized) : normalized;
      if (target.value !== String(this.currentPdfPage)) {
        target.value = String(this.currentPdfPage);
      }
    },
  },
});
</script>

<style scoped>
#fellowship-detail {
  --work-main-gap: 16px;
}

.work-section {
  min-width: 0;
}

.toc-anchor {
  scroll-margin-top: 92px;
}

.fellowship-header,
.fellowship-panel {
  background: var(--surface-elevated);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
  display: grid;
  gap: 10px;
}

.fellowship-kicker {
  margin: 0;
  color: var(--text-soft);
  font-size: var(--font-size-meta);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fellowship-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.fellowship-summary {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.55;
}

.fellowship-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fellowship-action-btn {
  padding: 7px 14px;
  cursor: pointer;
}

.fellowship-panel h2 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  font-weight: 600;
}

.fellowship-panel-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.fellowship-panel-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.fellowship-inline-link {
  color: var(--link-color);
  font-size: var(--font-size-body-sm);
}

.fellowship-detail-list {
  margin: 0;
  display: grid;
  gap: 8px;
}

.fellowship-detail-row {
  display: grid;
  grid-template-columns: minmax(170px, 230px) minmax(0, 1fr);
  gap: 12px;
}

.fellowship-detail-row dt {
  font-weight: 700;
  color: var(--page-text);
}

.fellowship-detail-row dd {
  margin: 0;
  color: var(--text-muted);
}

.fellowship-frame-shell {
  border: 1px solid var(--surface-outline);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(10, 16, 26, 0.92);
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
}

.fellowship-canvas-shell {
  min-height: min(68vh, 920px);
  padding: 10px;
  overflow: auto;
  display: grid;
  place-items: center;
  position: relative;
}

.fellowship-canvas-stage {
  display: grid;
  place-items: center;
  min-width: 100%;
}

.fellowship-canvas {
  display: block;
  background: #0d131f;
  border-radius: 8px;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.35);
}

.fellowship-canvas-overlay {
  position: absolute;
  inset: 10px;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
  color: #d9e4f3;
  background: rgba(8, 12, 18, 0.72);
  border-radius: 8px;
}

.fellowship-error-text {
  font-size: var(--font-size-caption);
  color: #b8c9dd;
}

.fellowship-canvas-overlay a {
  color: #9fd2ff;
  font-weight: 600;
}

.fellowship-pagination {
  padding: 8px 10px 10px;
  border-top: 1px solid var(--surface-outline);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.fellowship-page-btn {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  min-width: 102px;
  padding: 6px 12px;
  font-size: var(--font-size-body);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}

.fellowship-page-btn:hover:not(:disabled) {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.45);
}

.fellowship-page-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.fellowship-page-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 4px 10px;
  color: var(--page-text);
}

.fellowship-page-input {
  border: 0;
  background: transparent;
  color: var(--page-text);
  font: inherit;
  line-height: 1.1;
  text-align: center;
  padding: 0;
  min-width: 0;
  appearance: textfield;
  -moz-appearance: textfield;
}

.fellowship-page-input::-webkit-outer-spin-button,
.fellowship-page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.fellowship-page-input:focus-visible {
  outline: none;
}

.fellowship-page-total {
  font-weight: 600;
}

.fellowship-zoom-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.fellowship-zoom-btn,
.fellowship-zoom-reset {
  border: 1px solid var(--surface-outline);
  background: transparent;
  color: var(--page-text);
  height: 30px;
  border-radius: 999px;
  font-size: var(--font-size-body-sm);
  font-weight: 600;
}

.fellowship-zoom-btn {
  width: 30px;
  padding: 0;
  cursor: pointer;
}

.fellowship-zoom-reset {
  min-width: 64px;
  padding: 0 12px;
  cursor: pointer;
}

.fellowship-zoom-btn:hover,
.fellowship-zoom-reset:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.46);
}

.fellowship-zoom-btn:focus-visible,
.fellowship-zoom-reset:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24);
}

[data-theme="light"] .fellowship-frame-shell {
  background: linear-gradient(180deg, #e6ecf5, #dde6f2);
  border-color: rgba(16, 36, 59, 0.2);
}

[data-theme="light"] .fellowship-canvas-shell {
  background: #f4f7fb;
}

[data-theme="light"] .fellowship-pagination {
  background: #e7edf6;
  border-top-color: rgba(16, 36, 59, 0.22);
}

[data-theme="light"] .fellowship-page-btn,
[data-theme="light"] .fellowship-page-label,
[data-theme="light"] .fellowship-zoom-btn,
[data-theme="light"] .fellowship-zoom-reset {
  color: #0f2a45;
  border-color: rgba(16, 36, 59, 0.34);
  background: rgba(255, 255, 255, 0.88);
}

[data-theme="light"] .fellowship-page-btn:hover:not(:disabled),
[data-theme="light"] .fellowship-zoom-btn:hover,
[data-theme="light"] .fellowship-zoom-reset:hover {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(16, 36, 59, 0.48);
}

[data-theme="light"] .fellowship-page-input,
[data-theme="light"] .fellowship-page-total {
  color: #0f2a45;
}

@media (max-width: 780px) {
  #fellowship-detail {
    padding: 0 10px 118px;
  }

  .fellowship-header,
  .fellowship-panel {
    padding: 14px;
  }

  .fellowship-detail-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }

  .fellowship-panel-tools {
    width: 100%;
  }

  .fellowship-inline-link {
    width: 100%;
  }

  .fellowship-pagination {
    flex-wrap: wrap;
  }

  .fellowship-page-btn {
    min-width: 92px;
  }
}
</style>
