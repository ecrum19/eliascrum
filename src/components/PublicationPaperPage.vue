<template>
  <section id="publication-paper-page" class="w3-content w3-margin-top" style="max-width: min(1720px, 97vw)">
    <div class="paper-layout">
      <work-toc v-if="publication" :entries="tocEntries" title="Paper" />

      <div class="paper-main">
        <section v-if="publication" id="paper-overview" class="paper-section">
          <header class="paper-header">
            <p class="paper-kicker">{{ publication.type }} • {{ publication.venue }}</p>
            <h1>{{ publication.title }}</h1>
            <p class="paper-authors">{{ publication.authors }}</p>
            <p class="paper-meta">{{ publication.year }} • {{ publicationDateLabel }}</p>
            <div class="paper-actions">
              <router-link to="/publications" class="paper-action-btn btn-back">Back to Publications</router-link>
              <a
                v-if="paperOpenHref"
                :href="normalizeLinkUrl(paperOpenHref)"
                :target="linkTarget(paperOpenHref)"
                :rel="linkRel(paperOpenHref)"
                :class="['paper-action-btn', paperOpenButtonClass]"
              >
                {{ paperOpenLabel }}
              </a>
            </div>
            <div class="paper-tags-footer" v-if="detailTags.length">
              <span class="paper-tags-label">Tags:</span>
              <div class="paper-tags-list">
                <router-link
                  v-for="tag in detailTags"
                  :key="tag.key"
                  class="paper-tag paper-tag-link"
                  :class="tag.className"
                  :title="`${tag.category}: ${tag.label}`"
                  :data-category="tag.category"
                  :to="{ path: '/publications', query: { tag: tag.kind, value: tag.value } }"
                >
                  {{ tag.label }}
                </router-link>
              </div>
            </div>
          </header>
        </section>

        <template v-if="publication">
          <section id="paper-summary" class="paper-section">
            <div class="paper-panel">
              <h2>Summary</h2>
              <p>{{ publication.summary }}</p>
            </div>
          </section>

          <section v-if="publication.abstract" id="paper-abstract" class="paper-section">
            <div class="paper-panel">
              <h2>Abstract</h2>
              <p>{{ publication.abstract }}</p>
            </div>
          </section>

          <section id="paper-details" class="paper-section">
            <div class="paper-panel">
              <h2>Details</h2>
              <ul class="paper-details-list">
                <li v-for="(detail, detailIndex) in publication.details" :key="`${publication.id}-paper-detail-${detailIndex}`">
                  <span class="paper-detail-label">{{ detail.label }}:</span>
                  <a
                    v-if="detail.href"
                    :href="normalizeLinkUrl(detail.href)"
                    :target="linkTarget(detail.href)"
                    :rel="linkRel(detail.href)"
                  >
                    {{ detail.value }}
                  </a>
                  <span v-else>{{ detail.value }}</span>
                </li>
                <li>
                  <span class="paper-detail-label">{{ metricLabel }}:</span>
                  <span>{{ metricValue }}</span>
                </li>
              </ul>
            </div>
          </section>

          <section id="paper-citation" class="paper-section">
            <div class="paper-panel">
              <div class="paper-panel-header">
                <h2>BibTeX</h2>
                <button
                  type="button"
                  class="paper-copy-btn"
                  :title="copied ? 'Copied' : 'Copy BibTeX citation'"
                  :aria-label="copied ? 'BibTeX copied to clipboard' : 'Copy BibTeX citation'"
                  @click="copyBibtex"
                >
                  <i class="fa" :class="copied ? 'fa-check' : 'fa-files-o'"></i>
                </button>
              </div>
              <pre class="paper-bibtex"><code>{{ publication.bibtex }}</code></pre>
            </div>
          </section>

          <section id="paper-pdf" class="paper-section">
            <div class="paper-panel">
              <div class="paper-panel-header">
                <h2>PDF</h2>
                <div class="paper-panel-tools">
                  <div v-if="paperPreviewUrl" class="paper-zoom-controls" aria-label="Paper zoom controls">
                    <button
                      type="button"
                      class="paper-zoom-btn"
                      aria-label="Zoom out"
                      @click="zoomOutPaper"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      class="paper-zoom-reset"
                      @click="resetPaperZoom"
                    >
                      {{ paperZoomPercentage }}
                    </button>
                    <button
                      type="button"
                      class="paper-zoom-btn"
                      aria-label="Zoom in"
                      @click="zoomInPaper"
                    >
                      +
                    </button>
                  </div>
                  <a
                    v-if="paperOpenHref"
                    :href="normalizeLinkUrl(paperOpenHref)"
                    :target="linkTarget(paperOpenHref)"
                    :rel="linkRel(paperOpenHref)"
                    class="paper-inline-link"
                  >
                    {{ paperOpenLabel }}
                  </a>
                </div>
              </div>

              <div v-if="paperPreviewUrl" class="paper-frame-shell">
                <div
                  ref="paperCanvasShell"
                  class="paper-canvas-shell"
                  @wheel="onPaperViewerWheel"
                >
                  <div class="paper-canvas-stage">
                    <canvas ref="paperCanvas" class="paper-canvas"></canvas>
                  </div>
                  <div v-if="isPdfLoading" class="paper-canvas-overlay">
                    Loading paper...
                  </div>
                  <div v-else-if="isPdfRenderError" class="paper-canvas-overlay">
                    <span>Preview unavailable.</span>
                    <span v-if="pdfRenderErrorMessage" class="paper-error-text">{{ pdfRenderErrorMessage }}</span>
                    <a
                      v-if="paperOpenHref"
                      :href="normalizeLinkUrl(paperOpenHref)"
                      :target="linkTarget(paperOpenHref)"
                      :rel="linkRel(paperOpenHref)"
                    >
                      {{ paperOpenLabel }}
                    </a>
                  </div>
                </div>
                <div class="paper-pagination paper-pagination-footer" aria-label="Paper page navigation controls">
                  <button
                    type="button"
                    class="paper-page-btn"
                    @click="goToPreviousPaperPage"
                    :disabled="currentPaperPage <= 1"
                  >
                    Previous
                  </button>
                  <label class="paper-page-label" for="paper-page-input">
                    <input
                      id="paper-page-input"
                      class="paper-page-input"
                      type="number"
                      min="1"
                      :max="maxPaperPage ?? undefined"
                      inputmode="numeric"
                      :value="currentPaperPage"
                      :style="paperPageInputStyle"
                      aria-label="Current paper page"
                      @change="onPaperPageInputChange"
                    />
                    <span v-if="maxPaperPage" class="paper-page-total">/ {{ maxPaperPage }}</span>
                  </label>
                  <button
                    type="button"
                    class="paper-page-btn"
                    @click="goToNextPaperPage"
                    :disabled="maxPaperPage !== null && currentPaperPage >= maxPaperPage"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div v-else class="paper-preview-empty">
                <p>{{ previewUnavailableLabel }}</p>
                <a
                  v-if="paperOpenHref"
                  :href="normalizeLinkUrl(paperOpenHref)"
                  :target="linkTarget(paperOpenHref)"
                  :rel="linkRel(paperOpenHref)"
                  :class="['paper-action-btn', paperOpenButtonClass]"
                >
                  {{ paperOpenLabel }}
                </a>
              </div>
            </div>
          </section>
        </template>

        <section v-else class="paper-section">
          <div class="paper-panel">
            <h1>Publication Not Found</h1>
            <p>The requested publication paper page could not be resolved.</p>
            <router-link to="/publications" class="paper-action-btn btn-back">Back to Publications</router-link>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import {
  getPublicationBySlug,
  type Publication,
} from "../data/publicationsData";
import {
  publicationDownloadsByPublicationId,
  scholarCitationsByPublicationId,
} from "../data/scholarCitations";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";
import {
  loadPdfJs,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask,
} from "../utils/pdfJs";
import WorkToc from "./WorkToc.vue";

interface TocEntry {
  id: string;
  label: string;
  level?: number;
}

type PublicationDetailFilterKind = "type" | "venue" | "topic";

interface PublicationDetailTag {
  key: string;
  kind: PublicationDetailFilterKind;
  value: string;
  category: string;
  label: string;
  className: string;
}

function isLikelyPdfUrl(url: string): boolean {
  const normalizedUrl = url.trim().toLowerCase();
  if (!normalizedUrl) {
    return false;
  }

  return normalizedUrl.split(/[?#]/, 1)[0].endsWith(".pdf");
}

export default defineComponent({
  name: "PublicationPaperPage",
  components: {
    WorkToc,
  },
  data() {
    return {
      copied: false,
      copiedResetTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      currentPaperPage: 1,
      paperZoomScale: 1,
      maxPaperPage: null as number | null,
      isPdfLoading: false,
      isPdfRenderError: false,
      pdfRenderErrorMessage: "",
      pdfLoadingTask: null as PDFDocumentLoadingTask | null,
      pdfDocument: null as PDFDocumentProxy | null,
      pdfRenderTask: null as RenderTask | null,
      pdfLoadToken: 0,
      paperRenderToken: 0,
      pendingPaperRenderFrame: null as number | null,
      paperResizeObserver: null as ResizeObserver | null,
      scholarCitationsByPublicationId,
      publicationDownloadsByPublicationId,
    };
  },
  computed: {
    publication(): Publication | undefined {
      const slug = String(this.$route.params.slug || "");
      return getPublicationBySlug(slug);
    },
    paperPreviewUrl(): string | undefined {
      if (!this.publication) {
        return undefined;
      }

      if (this.publication.paperPdfPath) {
        return resolvePublicAssetPath(this.publication.paperPdfPath);
      }

      if (isLikelyPdfUrl(this.publication.url)) {
        return this.publication.url;
      }

      return undefined;
    },
    paperOpenHref(): string | undefined {
      if (this.paperPreviewUrl) {
        return this.paperPreviewUrl;
      }

      if (this.publication?.url) {
        return this.publication.url;
      }

      return undefined;
    },
    paperOpenLabel(): string {
      if (this.paperPreviewUrl) {
        return "Open Paper PDF";
      }

      return "Open Publication Page";
    },
    paperOpenButtonClass(): string {
      return this.paperPreviewUrl ? "btn-pdf" : "btn-external";
    },
    previewUnavailableLabel(): string {
      if (this.publication?.url) {
        return "A direct PDF preview is not available for this publication source.";
      }

      return "A hosted PDF has not been added for this publication yet.";
    },
    publicationDateLabel(): string {
      return this.publication?.sortDate || "Date unavailable";
    },
    detailTags(): PublicationDetailTag[] {
      if (!this.publication) {
        return [];
      }

      const tags: PublicationDetailTag[] = [];
      const pushTag = (
        kind: PublicationDetailFilterKind,
        category: string,
        label: string,
        className: string,
      ) => {
        tags.push({
          key: `${kind}:${label}`,
          kind,
          value: label,
          category,
          label,
          className,
        });
      };

      pushTag("type", "Type", this.publication.type, "paper-tag-type");
      this.publication.venueTags.forEach((venueTag) => {
        pushTag("venue", "Venue", venueTag, "paper-tag-venue");
      });
      this.publication.topicTags.forEach((topicTag) => {
        pushTag("topic", "Main Topic", topicTag, "paper-tag-topic");
      });

      return tags;
    },
    tocEntries(): TocEntry[] {
      if (!this.publication) {
        return [];
      }

      const entries: TocEntry[] = [
        { id: "paper-overview", label: "Overview", level: 1 },
        { id: "paper-summary", label: "Summary", level: 2 },
      ];

      if (this.publication.abstract) {
        entries.push({ id: "paper-abstract", label: "Abstract", level: 2 });
      }

      entries.push(
        { id: "paper-details", label: "Details", level: 2 },
        { id: "paper-citation", label: "BibTeX", level: 2 },
        { id: "paper-pdf", label: "PDF", level: 1 },
      );

      return entries;
    },
    paperPageInputStyle(): Record<string, string> {
      const digitCount = String(Math.max(1, this.currentPaperPage)).length;
      const widthCh = Math.min(4.4, Math.max(1.7, digitCount + 0.35));
      return {
        width: `${widthCh}ch`,
      };
    },
    paperZoomPercentage(): string {
      return `${Math.round(this.paperZoomScale * 100)}%`;
    },
    metricLabel(): string {
      if (this.publication?.type === "Thesis") {
        return "Loyola eCommons Downloads";
      }
      return "Google Scholar Citations";
    },
    metricValue(): string {
      const publicationId = this.publication?.id;
      if (!publicationId) {
        return "N/A";
      }

      if (this.publication?.type === "Thesis") {
        const count = this.publicationDownloadsByPublicationId[publicationId];
        return count === null || typeof count === "undefined" ? "N/A" : String(count);
      }

      const count = this.scholarCitationsByPublicationId[publicationId];
      return count === null || typeof count === "undefined" ? "N/A" : String(count);
    },
  },
  watch: {
    paperPreviewUrl: {
      immediate: true,
      handler(nextUrl: string | undefined) {
        this.currentPaperPage = 1;
        this.paperZoomScale = 1;
        this.maxPaperPage = null;
        void this.loadPaperPdfDocument(nextUrl || "");
      },
    },
    "$route.params.slug"() {
      this.currentPaperPage = 1;
      this.paperZoomScale = 1;
    },
    currentPaperPage() {
      this.resetPaperScrollPosition();
      this.queuePaperRender();
    },
    paperZoomScale() {
      this.queuePaperRender();
    },
  },
  beforeUnmount() {
    if (this.copiedResetTimer) {
      clearTimeout(this.copiedResetTimer);
    }
    if (this.pendingPaperRenderFrame !== null) {
      window.cancelAnimationFrame(this.pendingPaperRenderFrame);
      this.pendingPaperRenderFrame = null;
    }
    if (this.paperResizeObserver) {
      this.paperResizeObserver.disconnect();
      this.paperResizeObserver = null;
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
  mounted() {
    this.$nextTick(() => {
      this.initPaperResizeObserver();
      this.queuePaperRender();
    });
  },
  methods: {
    isExternalUrl(url: string): boolean {
      return /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(url);
    },
    normalizeLinkUrl(url: string): string {
      if (!url || this.isExternalUrl(url)) {
        return url;
      }

      const baseUrl = import.meta.env.BASE_URL || "/";
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      if (url.startsWith(normalizedBase)) {
        return url;
      }

      return resolvePublicAssetPath(url);
    },
    linkTarget(url: string): string | undefined {
      return this.isExternalUrl(url) ? "_blank" : undefined;
    },
    linkRel(url: string): string | undefined {
      return this.isExternalUrl(url) ? "noopener noreferrer" : undefined;
    },
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
    initPaperResizeObserver() {
      if (typeof ResizeObserver === "undefined") {
        return;
      }
      const shell = this.$refs.paperCanvasShell as HTMLElement | undefined;
      if (!shell) {
        return;
      }
      if (this.paperResizeObserver) {
        this.paperResizeObserver.disconnect();
      }
      this.paperResizeObserver = markRaw(new ResizeObserver(() => {
        this.queuePaperRender();
      }));
      this.paperResizeObserver.observe(shell);
    },
    clampPaperZoom(scale: number): number {
      return Math.min(3.5, Math.max(0.8, scale));
    },
    setPaperZoom(scale: number) {
      this.paperZoomScale = this.clampPaperZoom(scale);
    },
    zoomInPaper() {
      this.setPaperZoom(this.paperZoomScale * 1.18);
    },
    zoomOutPaper() {
      this.setPaperZoom(this.paperZoomScale / 1.18);
    },
    resetPaperZoom() {
      this.paperZoomScale = 1;
    },
    onPaperViewerWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomInPaper();
        return;
      }

      if (event.deltaY > 0) {
        this.zoomOutPaper();
      }
    },
    resetPaperScrollPosition() {
      const shell = this.$refs.paperCanvasShell as HTMLElement | undefined;
      if (!shell) {
        return;
      }

      shell.scrollTop = 0;
      shell.scrollLeft = 0;
    },
    async loadPaperPdfDocument(pdfUrl: string) {
      const loadToken = ++this.pdfLoadToken;
      this.isPdfLoading = Boolean(pdfUrl);
      this.isPdfRenderError = false;
      this.pdfRenderErrorMessage = "";
      this.maxPaperPage = null;
      this.paperRenderToken += 1;

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
        this.maxPaperPage = nextDocument.numPages;
        this.currentPaperPage = Math.min(Math.max(1, this.currentPaperPage), nextDocument.numPages);
        this.$nextTick(() => {
          this.initPaperResizeObserver();
          this.queuePaperRender();
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
        console.error("Paper preview load failed:", error);
      } finally {
        if (this.pdfLoadingTask === loadingTask) {
          this.pdfLoadingTask = null;
        }
        if (loadToken === this.pdfLoadToken) {
          this.isPdfLoading = false;
        }
      }
    },
    queuePaperRender() {
      if (!this.pdfDocument || this.isPdfLoading) {
        return;
      }

      const nextRenderToken = ++this.paperRenderToken;
      if (this.pendingPaperRenderFrame !== null) {
        window.cancelAnimationFrame(this.pendingPaperRenderFrame);
      }
      this.pendingPaperRenderFrame = window.requestAnimationFrame(() => {
        this.pendingPaperRenderFrame = null;
        void this.renderCurrentPaperPage(nextRenderToken);
      });
    },
    async renderCurrentPaperPage(renderToken: number) {
      const activeDocument = this.pdfDocument;
      if (!activeDocument || renderToken !== this.paperRenderToken) {
        return;
      }

      const canvasShell = this.$refs.paperCanvasShell as HTMLElement | undefined;
      const canvas = this.$refs.paperCanvas as HTMLCanvasElement | undefined;
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
      const normalizedPage = Math.min(maxPage, Math.max(1, this.currentPaperPage));
      if (normalizedPage !== this.currentPaperPage) {
        this.currentPaperPage = normalizedPage;
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
            console.error("Paper preview cancellation failed:", error);
            return;
          }
        } finally {
          if (this.pdfRenderTask === runningTask) {
            this.pdfRenderTask = null;
          }
        }
      }

      if (renderToken !== this.paperRenderToken || this.pdfDocument !== activeDocument) {
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
        console.error("Paper preview getPage failed:", error);
        return;
      }

      if (renderToken !== this.paperRenderToken || this.pdfDocument !== activeDocument) {
        return;
      }

      const viewportBase = page.getViewport({ scale: 1 });
      const widthScale = shellWidth / viewportBase.width;
      const heightScale = shellHeight / viewportBase.height;
      const fitScale = Math.max(0.1, Math.min(widthScale, heightScale));
      const effectiveScale = fitScale * this.paperZoomScale;
      const devicePixelRatio = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));

      const cssViewport = page.getViewport({ scale: effectiveScale });
      const renderViewport = page.getViewport({ scale: effectiveScale * devicePixelRatio });

      canvas.width = Math.max(1, Math.floor(renderViewport.width));
      canvas.height = Math.max(1, Math.floor(renderViewport.height));
      canvas.style.width = `${Math.floor(cssViewport.width)}px`;
      canvas.style.height = `${Math.floor(cssViewport.height)}px`;

      const context = canvas.getContext("2d");
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
          console.error("Paper preview render failed:", error);
        }
      } finally {
        if (this.pdfRenderTask === renderTask) {
          this.pdfRenderTask = null;
        }
      }
    },
    goToPreviousPaperPage() {
      this.currentPaperPage = Math.max(1, this.currentPaperPage - 1);
    },
    goToNextPaperPage() {
      if (this.maxPaperPage !== null) {
        this.currentPaperPage = Math.min(this.maxPaperPage, this.currentPaperPage + 1);
        return;
      }
      this.currentPaperPage += 1;
    },
    onPaperPageInputChange(event: Event) {
      const target = event.target as HTMLInputElement | null;
      const parsed = Number.parseInt(target?.value ?? "1", 10);
      const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      const maxPage = this.maxPaperPage;
      this.currentPaperPage = maxPage !== null ? Math.min(maxPage, normalized) : normalized;
      if (target) {
        target.value = String(this.currentPaperPage);
      }
    },
    async copyBibtex() {
      if (!this.publication) {
        return;
      }

      const bibtex = this.publication.bibtex;
      const setCopiedState = () => {
        this.copied = true;
        if (this.copiedResetTimer) {
          clearTimeout(this.copiedResetTimer);
        }
        this.copiedResetTimer = setTimeout(() => {
          this.copied = false;
          this.copiedResetTimer = undefined;
        }, 1800);
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(bibtex);
          setCopiedState();
          return;
        }
      } catch {
        // Fallback path below.
      }

      const textarea = document.createElement("textarea");
      textarea.value = bibtex;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) {
        setCopiedState();
      }
    },
  },
});
</script>

<style scoped>
#publication-paper-page {
  padding: 0 12px 118px;
  font-size: var(--font-size-body-lg);
}

.paper-layout {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.paper-main {
  min-width: 0;
  display: grid;
  gap: 18px;
}

.paper-section {
  min-width: 0;
  display: grid;
  gap: 12px;
  scroll-margin-top: 92px;
}

.paper-header,
.paper-panel {
  width: 100%;
  background: var(--surface-elevated);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 18px;
}

.paper-header {
  background: var(--surface-elevated);
}

[data-theme="light"] .paper-header {
  background: linear-gradient(180deg, rgba(var(--accent-secondary-rgb), 0.6), rgba(var(--accent-rgb), 0.18));
  border-color: rgba(16, 36, 59, 0.14);
}

.paper-kicker {
  margin: 0;
  color: var(--text-soft);
  opacity: 1;
  font-size: var(--font-size-meta);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.paper-header h1,
.paper-panel h2 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
}

.paper-header h1 {
  margin-top: 8px;
  font-size: var(--content-h1-size);
  line-height: 1.12;
}

.paper-authors,
.paper-meta,
.paper-panel p {
  margin: 8px 0 0;
  color: var(--page-text);
}

.paper-authors {
  font-size: var(--font-size-body-lg);
}

.paper-meta {
  color: var(--text-muted);
  opacity: 1;
  font-size: var(--font-size-body);
}

.paper-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
}

.paper-tags-footer {
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.paper-tags-label {
  padding: 6px 0;
  font-size: var(--font-size-meta);
  font-weight: 800;
  line-height: 1.2;
}

.paper-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.paper-tag {
  --tag-bg: rgba(148, 163, 184, 0.16);
  --tag-border: rgba(148, 163, 184, 0.38);
  --tag-text: var(--page-text);
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  display: inline-flex;
  align-items: center;
  border: 1px solid var(--tag-border);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: var(--font-size-meta);
  font-weight: 650;
  line-height: 1.2;
  color: var(--tag-text);
  background: var(--tag-bg);
}

.paper-tag-link {
  position: relative;
  text-decoration: none;
  z-index: 0;
  transition: transform 0.16s ease, box-shadow 0.18s ease;
}

.paper-tag-link::after {
  content: attr(data-category);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translate(-50%, 4px);
  border: 1px solid var(--tag-tooltip-border);
  border-radius: 7px;
  padding: 3px 7px;
  background: var(--tag-tooltip-bg);
  color: var(--tag-tooltip-text);
  box-shadow: 0 8px 18px rgba(8, 15, 31, 0.24);
  font-size: var(--font-size-micro);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
  z-index: 1001;
}

.paper-tag-link:hover,
.paper-tag-link:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(8, 15, 31, 0.12);
  z-index: 1000;
}

.paper-tag-link:hover::after,
.paper-tag-link:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.paper-tag-link:focus-visible {
  outline: none;
}

.paper-tag-type {
  --tag-bg: rgba(245, 158, 11, 0.18);
  --tag-border: rgba(245, 158, 11, 0.44);
  --tag-text: #5f3a00;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.96);
  --tag-tooltip-border: rgba(161, 98, 7, 0.96);
  --tag-tooltip-text: #251401;
}

.paper-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.16);
  --tag-border: rgba(56, 189, 248, 0.44);
  --tag-text: #053a52;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.96);
  --tag-tooltip-border: rgba(2, 132, 199, 0.96);
  --tag-tooltip-text: #052634;
}

.paper-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.16);
  --tag-border: rgba(20, 184, 166, 0.44);
  --tag-text: #06453f;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

[data-theme="dark"] .paper-tag-type {
  --tag-bg: rgba(245, 158, 11, 0.28);
  --tag-border: rgba(245, 158, 11, 0.62);
  --tag-text: #ffe7a8;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.98);
  --tag-tooltip-border: rgba(251, 191, 36, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .paper-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.26);
  --tag-border: rgba(56, 189, 248, 0.6);
  --tag-text: #d3f4ff;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.98);
  --tag-tooltip-border: rgba(125, 211, 252, 0.98);
  --tag-tooltip-text: #041b25;
}

[data-theme="dark"] .paper-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.26);
  --tag-border: rgba(20, 184, 166, 0.58);
  --tag-text: #d2fff4;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(var(--accent-secondary-rgb), 0.98);
  --tag-tooltip-text: #021413;
}

.paper-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--page-text);
  border: 1px solid var(--surface-outline);
  background: rgba(148, 163, 184, 0.07);
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 600;
  min-width: 0;
  line-height: 1.2;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.16s ease, box-shadow 0.2s ease;
}

.paper-action-btn:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.45);
  box-shadow: 0 4px 12px rgba(8, 15, 31, 0.12);
  transform: translateY(-1px);
}

.paper-action-btn:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.78);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24);
}

[data-theme="light"] .paper-action-btn {
  background: rgba(16, 36, 59, 0.04);
}

.paper-panel {
  display: grid;
  gap: 10px;
}

.paper-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.paper-panel-tools {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.paper-zoom-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.paper-zoom-btn,
.paper-zoom-reset {
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
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.16s ease;
}

.paper-zoom-btn {
  width: 32px;
  padding: 0;
}

.paper-zoom-reset {
  min-width: 72px;
  padding: 0 12px;
}

.paper-zoom-btn:hover,
.paper-zoom-reset:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.45);
  transform: translateY(-1px);
}

.paper-zoom-btn:focus-visible,
.paper-zoom-reset:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.78);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24);
}

.paper-inline-link {
  color: var(--link-color);
  text-decoration: none;
  font-size: var(--font-size-body);
}

.paper-inline-link:hover {
  text-decoration: underline;
}

.paper-details-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.paper-detail-label {
  font-weight: 700;
  margin-right: 6px;
}

.paper-bibtex {
  margin: 0;
  overflow-x: auto;
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: var(--font-size-label);
  line-height: 1.4;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--surface-outline);
  background: rgba(0, 0, 0, 0.28);
}

[data-theme="light"] .paper-bibtex {
  background: rgba(16, 36, 59, 0.08);
}

.paper-copy-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.18s ease, opacity 0.18s ease;
}

.paper-copy-btn:hover {
  background: var(--nav-hover-bg);
}

.paper-pagination {
  display: grid;
  grid-template-columns: minmax(92px, 132px) auto minmax(92px, 132px);
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: 12px 14px 14px;
  border-top: 1px solid var(--surface-outline);
  background: var(--surface-bg);
}

.paper-pagination-footer {
  flex: 0 0 auto;
}

.paper-page-btn {
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

.paper-page-btn:hover:not(:disabled) {
  background: rgba(var(--accent-rgb), 0.24);
  border-color: rgba(var(--accent-rgb), 0.54);
  box-shadow: 0 3px 10px rgba(8, 15, 31, 0.28);
  transform: translateY(-1px);
}

.paper-page-btn:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.86);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.28);
}

.paper-page-btn:disabled {
  opacity: 0.48;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.paper-page-label {
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

.paper-page-input {
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
}

.paper-page-input::-webkit-outer-spin-button,
.paper-page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.paper-page-input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.paper-page-total {
  opacity: 0.88;
  font-weight: 650;
  white-space: nowrap;
}

.paper-page-input:focus-visible {
  outline: none;
}

.paper-page-label:focus-within {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.86);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.28);
}

.paper-frame-shell {
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

.paper-canvas-shell {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  overflow: auto;
  background: #0f0f0f;
  padding: 16px;
  overscroll-behavior: contain;
}

.paper-canvas-stage {
  width: max-content;
  min-width: 100%;
  min-height: 100%;
  display: grid;
  place-items: center;
}

.paper-canvas {
  display: block;
  max-width: none;
  max-height: none;
  border: 0;
}

.paper-canvas-overlay {
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

.paper-canvas-overlay a {
  color: #9adfff;
  text-decoration: underline;
}

.paper-error-text {
  font-size: var(--font-size-micro);
  opacity: 0.84;
}

.paper-preview-empty {
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

[data-theme="light"] .paper-preview-empty {
  background: rgba(16, 36, 59, 0.035);
}

@media (max-width: 1080px) {
  .paper-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  #publication-paper-page {
    padding: 0 8px 118px;
  }

  .paper-header,
  .paper-panel {
    padding: 12px;
  }

  .paper-action-btn {
    width: 100%;
  }

  .paper-tags-footer {
    flex-direction: column;
    gap: 6px;
  }

  .paper-tags-label {
    padding: 0;
  }

  .paper-panel-tools {
    width: 100%;
    justify-content: space-between;
  }

  .paper-pagination {
    padding: 10px;
    gap: 8px;
    grid-template-columns: minmax(78px, 1fr) auto minmax(78px, 1fr);
  }

  .paper-page-btn {
    padding: 6px 10px;
    font-size: var(--font-size-micro);
  }

  .paper-page-label {
    padding: 5px 9px;
    gap: 5px;
  }

  .paper-frame-shell {
    min-height: 56vh;
    height: 62vh;
    max-height: 78vh;
    resize: none;
  }

  .paper-canvas-shell {
    min-height: 0;
    padding: 10px;
  }

  .paper-pagination {
    padding: 8px 10px calc(10px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
