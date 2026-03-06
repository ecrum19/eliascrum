<template>
  <section id="slide-detail" class="w3-content w3-margin-top" style="max-width: 1400px">
    <div v-if="talk" class="slide-shell">
      <header class="slide-header">
        <div class="slide-header-top">
          <h1>{{ talk.displayTitle }}</h1>
          <p class="talk-date-detailed">{{ talk.displayDateIso }}</p>
        </div>
        <div class="slide-actions">
          <router-link to="/talks" class="action-btn">Back to Talks</router-link>
          <a :href="slidePdfUrl" target="_blank" rel="noopener noreferrer" class="action-btn primary">
            Open Slides PDF
          </a>
          <a
            v-for="publicationLink in relatedPublicationLinks"
            :key="publicationLink.key"
            :href="publicationLink.url"
            target="_blank"
            rel="noopener noreferrer"
            class="action-btn"
          >
            {{ publicationLink.label }}
          </a>
        </div>
        <section class="talk-abstract-block">
          <h2 class="talk-detail-heading">Abstract</h2>
          <p class="talk-summary">{{ talk.abstract }}</p>
        </section>
        <dl class="talk-details-list">
          <div class="talk-detail-row">
            <dt>Goal</dt>
            <dd>{{ talk.goal }}</dd>
          </div>
          <div class="talk-detail-row">
            <dt>Audience Expertise</dt>
            <dd>{{ talk.audienceExpertise }}</dd>
          </div>
          <div class="talk-detail-row">
            <dt>Duration</dt>
            <dd>~ {{ talk.durationMinutes }} minutes</dd>
          </div>
          <div class="talk-detail-row">
            <dt>Audience Size</dt>
            <dd>{{ talk.audienceSizeEstimate.replace(/^Approx\.?\s*/i, "~ ") }}</dd>
          </div>
        </dl>
        <div class="talk-tags-footer" v-if="detailTags.length">
          <span class="talk-tags-label">Tags:</span>
          <div class="talk-tags-list">
            <router-link
              v-for="tag in detailTags"
              :key="tag.key"
              class="talk-tag talk-tag-link"
              :class="tag.className"
              :title="`${tag.category}: ${tag.label}`"
              :data-category="tag.category"
              :to="{ path: '/talks', query: { tag: tag.kind, value: tag.value } }"
            >
              {{ tag.label }}
            </router-link>
          </div>
        </div>
      </header>

      <article class="slide-panel">
        <h2>Slides</h2>
        <div
          ref="slideFrameShell"
          class="slide-frame-shell"
        >
          <div ref="slideCanvasShell" class="slide-canvas-shell">
            <canvas ref="slideCanvas" class="slide-canvas"></canvas>
            <div v-if="isPdfLoading" class="slide-canvas-overlay">
              Loading slides...
            </div>
            <div v-else-if="isPdfRenderError" class="slide-canvas-overlay">
              <span>Preview unavailable.</span>
              <span v-if="pdfRenderErrorMessage" class="slide-error-text">{{ pdfRenderErrorMessage }}</span>
              <a :href="slidePdfUrl" target="_blank" rel="noopener noreferrer">Open the slides</a>
            </div>
          </div>
          <div class="slide-pagination slide-pagination-footer" aria-label="Slide navigation controls">
            <button
              type="button"
              class="slide-page-btn"
              @click="goToPreviousSlidePage"
              :disabled="currentSlidePage <= 1"
            >
              Previous
            </button>
            <label class="slide-page-label" for="slide-page-input">
              <input
                id="slide-page-input"
                class="slide-page-input"
                type="number"
                min="1"
                :max="maxSlidePage ?? undefined"
                inputmode="numeric"
                :value="currentSlidePage"
                :style="slidePageInputStyle"
                aria-label="Current slide page"
                @change="onSlidePageInputChange"
              />
              <span v-if="maxSlidePage" class="slide-page-total">/ {{ maxSlidePage }}</span>
            </label>
            <button
              type="button"
              class="slide-page-btn"
              @click="goToNextSlidePage"
              :disabled="maxSlidePage !== null && currentSlidePage >= maxSlidePage"
            >
              Next
            </button>
          </div>
        </div>
      </article>

      <article v-if="talk.posterPath" class="slide-panel">
        <h2>Poster</h2>
        <p class="poster-name">{{ talk.posterTitle || "Poster PDF" }}</p>
        <object :data="posterPdfUrl" type="application/pdf" class="poster-frame">
          <p>
            Your browser cannot render the PDF inline.
            <a :href="posterPdfUrl" target="_blank" rel="noopener noreferrer">Open the poster</a>.
          </p>
        </object>
      </article>

      <article v-else class="slide-panel muted-panel">
        <h2>Poster</h2>
        <p>No poster is currently linked to this talk.</p>
      </article>
    </div>

    <div v-else class="slide-shell">
      <article class="slide-panel">
        <h1>Talk not found</h1>
        <p>This talk slug does not exist in the generated talks data.</p>
        <router-link to="/talks" class="action-btn">Back to Talks</router-link>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type RenderTask,
} from "pdfjs-dist/build/pdf.mjs";
import PdfJsWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import { getTalkViewBySlug, type TalkViewEntry } from "../data/talkCatalog";
import {
  getRelatedPublicationLinksForPresentationFile,
  getRelatedPublicationLinksForTalkSlug,
  type ResolvedPublicationLink,
} from "../data/publicationsData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";

if (!GlobalWorkerOptions.workerPort) {
  try {
    GlobalWorkerOptions.workerPort = new PdfJsWorker();
  } catch {
    GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  }
}

type TalkDetailFilterKind =
  | "venue"
  | "topic"
  | "audienceGroup"
  | "audienceSize"
  | "duration";

interface TalkDetailTag {
  key: string;
  kind: TalkDetailFilterKind;
  value: string;
  category: string;
  label: string;
  className: string;
}

export default defineComponent({
  name: "SlideDetail",
  data() {
    return {
      currentSlidePage: 1,
      maxSlidePage: null as number | null,
      isPdfLoading: false,
      isPdfRenderError: false,
      pdfRenderErrorMessage: "",
      pdfLoadingTask: null as PDFDocumentLoadingTask | null,
      pdfDocument: null as PDFDocumentProxy | null,
      pdfRenderTask: null as RenderTask | null,
      pdfLoadToken: 0,
      slideRenderToken: 0,
      pendingSlideRenderFrame: null as number | null,
      slideResizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    talk(): TalkViewEntry | undefined {
      const routeSlug = String(this.$route.params.slug || "");
      return getTalkViewBySlug(routeSlug);
    },
    relatedPublicationLinks(): ResolvedPublicationLink[] {
      if (!this.talk) {
        return [];
      }

      const talkLinks = getRelatedPublicationLinksForTalkSlug(this.talk.slug);
      const fileLinks = getRelatedPublicationLinksForPresentationFile(this.talk.slidePath);
      const uniqueByPublicationId = new Map<string, ResolvedPublicationLink>();

      [...talkLinks, ...fileLinks].forEach((link) => {
        if (!uniqueByPublicationId.has(link.publicationId)) {
          uniqueByPublicationId.set(link.publicationId, link);
        }
      });

      return Array.from(uniqueByPublicationId.values());
    },
    detailTags(): TalkDetailTag[] {
      if (!this.talk) {
        return [];
      }

      const tags: TalkDetailTag[] = [];
      const pushTag = (
        kind: TalkDetailFilterKind,
        category: string,
        label: string,
        className: string
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

      this.talk.venueTags.forEach((venueTag) => {
        pushTag("venue", "Venue", venueTag, "talk-tag-venue");
      });
      this.talk.topicTags.forEach((topicTag) => {
        pushTag("topic", "Main Topic", topicTag, "talk-tag-topic");
      });
      this.talk.audienceGroups.forEach((audienceGroupTag) => {
        pushTag("audienceGroup", "Audience Field", audienceGroupTag, "talk-tag-audience-group");
      });
      pushTag("audienceSize", "Audience Size", this.talk.audienceSizeCategory, "talk-tag-audience-size");
      pushTag("duration", "Duration", this.talk.durationCategory, "talk-tag-duration");

      return tags;
    },
    slidePdfUrl(): string {
      return this.talk ? resolvePublicAssetPath(this.talk.slidePath) : "";
    },
    slidePageInputStyle(): Record<string, string> {
      const digitCount = String(Math.max(1, this.currentSlidePage)).length;
      const widthCh = Math.min(4.4, Math.max(1.7, digitCount + 0.35));
      return {
        width: `${widthCh}ch`,
      };
    },
    posterPdfUrl(): string {
      return this.talk?.posterPath ? resolvePublicAssetPath(this.talk.posterPath) : "";
    },
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onSlideKeyboardNav);
    if (this.pendingSlideRenderFrame !== null) {
      window.cancelAnimationFrame(this.pendingSlideRenderFrame);
      this.pendingSlideRenderFrame = null;
    }
    if (this.slideResizeObserver) {
      this.slideResizeObserver.disconnect();
      this.slideResizeObserver = null;
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
    window.addEventListener("keydown", this.onSlideKeyboardNav);
    this.$nextTick(() => {
      this.initSlideResizeObserver();
      this.queueSlideRender();
    });
  },
  watch: {
    slidePdfUrl: {
      immediate: true,
      handler(nextUrl: string) {
        this.currentSlidePage = 1;
        this.maxSlidePage = null;
        void this.loadSlidePdfDocument(nextUrl);
      },
    },
    "$route.params.slug"() {
      this.currentSlidePage = 1;
    },
    currentSlidePage() {
      this.queueSlideRender();
    },
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
    initSlideResizeObserver() {
      if (typeof ResizeObserver === "undefined") {
        return;
      }
      const shell = this.$refs.slideCanvasShell as HTMLElement | undefined;
      if (!shell) {
        return;
      }
      if (this.slideResizeObserver) {
        this.slideResizeObserver.disconnect();
      }
      this.slideResizeObserver = markRaw(new ResizeObserver(() => {
        this.queueSlideRender();
      }));
      this.slideResizeObserver.observe(shell);
    },
    async loadSlidePdfDocument(pdfUrl: string) {
      const loadToken = ++this.pdfLoadToken;
      this.isPdfLoading = Boolean(pdfUrl);
      this.isPdfRenderError = false;
      this.pdfRenderErrorMessage = "";
      this.maxSlidePage = null;
      this.slideRenderToken += 1;

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
        this.maxSlidePage = nextDocument.numPages;
        this.currentSlidePage = Math.min(Math.max(1, this.currentSlidePage), nextDocument.numPages);
        this.$nextTick(() => {
          this.initSlideResizeObserver();
          this.queueSlideRender();
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
        // eslint-disable-next-line no-console
        console.error("Slide preview load failed:", error);
      } finally {
        if (this.pdfLoadingTask === loadingTask) {
          this.pdfLoadingTask = null;
        }
        if (loadToken === this.pdfLoadToken) {
          this.isPdfLoading = false;
        }
      }
    },
    queueSlideRender() {
      if (!this.pdfDocument || this.isPdfLoading) {
        return;
      }

      const nextRenderToken = ++this.slideRenderToken;
      if (this.pendingSlideRenderFrame !== null) {
        window.cancelAnimationFrame(this.pendingSlideRenderFrame);
      }
      this.pendingSlideRenderFrame = window.requestAnimationFrame(() => {
        this.pendingSlideRenderFrame = null;
        void this.renderCurrentSlidePage(nextRenderToken);
      });
    },
    async renderCurrentSlidePage(renderToken: number) {
      const activeDocument = this.pdfDocument;
      if (!activeDocument || renderToken !== this.slideRenderToken) {
        return;
      }

      const canvasShell = this.$refs.slideCanvasShell as HTMLElement | undefined;
      const canvas = this.$refs.slideCanvas as HTMLCanvasElement | undefined;
      if (!canvasShell || !canvas) {
        return;
      }

      const shellWidth = canvasShell.clientWidth;
      const shellHeight = canvasShell.clientHeight;
      if (shellWidth < 2 || shellHeight < 2) {
        return;
      }

      const maxPage = activeDocument.numPages;
      const normalizedPage = Math.min(maxPage, Math.max(1, this.currentSlidePage));
      if (normalizedPage !== this.currentSlidePage) {
        this.currentSlidePage = normalizedPage;
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
            // eslint-disable-next-line no-console
            console.error("Slide preview cancellation failed:", error);
            return;
          }
        } finally {
          if (this.pdfRenderTask === runningTask) {
            this.pdfRenderTask = null;
          }
        }
      }

      if (renderToken !== this.slideRenderToken || this.pdfDocument !== activeDocument) {
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
        // eslint-disable-next-line no-console
        console.error("Slide preview getPage failed:", error);
        return;
      }

      if (renderToken !== this.slideRenderToken || this.pdfDocument !== activeDocument) {
        return;
      }

      const viewportBase = page.getViewport({ scale: 1 });
      const widthScale = shellWidth / viewportBase.width;
      const heightScale = shellHeight / viewportBase.height;
      const fitScale = Math.max(0.1, Math.min(widthScale, heightScale));
      const devicePixelRatio = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));

      const cssViewport = page.getViewport({ scale: fitScale });
      const renderViewport = page.getViewport({ scale: fitScale * devicePixelRatio });

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
          // eslint-disable-next-line no-console
          console.error("Slide preview render failed:", error);
        }
      } finally {
        if (this.pdfRenderTask === renderTask) {
          this.pdfRenderTask = null;
        }
      }
    },
    goToPreviousSlidePage() {
      this.currentSlidePage = Math.max(1, this.currentSlidePage - 1);
    },
    goToNextSlidePage() {
      if (this.maxSlidePage !== null) {
        this.currentSlidePage = Math.min(this.maxSlidePage, this.currentSlidePage + 1);
        return;
      }
      this.currentSlidePage += 1;
    },
    onSlidePageInputChange(event: Event) {
      const target = event.target as HTMLInputElement | null;
      const parsed = Number.parseInt(target?.value ?? "1", 10);
      const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      const maxPage = this.maxSlidePage;
      this.currentSlidePage = maxPage !== null ? Math.min(maxPage, normalized) : normalized;
      if (target) {
        target.value = String(this.currentSlidePage);
      }
    },
    onSlideKeyboardNav(event: KeyboardEvent) {
      if (!this.talk) {
        return;
      }

      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase() || "";
      const isTypingTarget =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        Boolean(target?.isContentEditable);

      if (isTypingTarget) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.goToPreviousSlidePage();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        this.goToNextSlidePage();
      }
    },
  },
});
</script>

<style scoped>
#slide-detail {
  padding: 0 16px 140px;
}

.slide-shell {
  display: grid;
  gap: 18px;
}

.slide-header,
.slide-panel {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
}

.slide-header {
  display: grid;
  gap: 12px;
}

.slide-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.slide-header h1 {
  margin: 0;
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
}

.talk-date-detailed {
  margin: 0;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: var(--toggle-bg);
  padding: 7px 14px;
  font-size: var(--font-size-body);
  font-weight: 700;
  white-space: nowrap;
  line-height: 1.2;
  opacity: 0.94;
}

.talk-detail-heading {
  margin: 0;
  font-family: var(--content-heading-font);
  font-size: var(--font-size-label);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  opacity: 0.84;
}

.talk-abstract-block {
  margin: 0;
  display: grid;
  gap: 8px;
}

.talk-summary {
  margin: 0;
  width: 100%;
  line-height: 1.56;
  padding-left: 12px;
  border-left: 3px solid rgba(80, 203, 255, 0.45);
  opacity: 0.96;
}

.talk-details-list {
  margin: 0;
  display: grid;
  gap: 0;
}

.talk-detail-row {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(170px, 0.32fr) minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.talk-detail-row:last-child {
  border-bottom: none;
}

.talk-detail-row dt {
  margin: 0;
  font-size: var(--font-size-meta);
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.9;
}

.talk-detail-row dd {
  margin: 2px 0 0;
  font-size: var(--font-size-body);
  font-weight: 430;
  line-height: 1.48;
}

[data-theme="light"] .talk-detail-row {
  border-bottom-color: rgba(16, 36, 59, 0.16);
}

.talk-tags-footer {
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.talk-tags-label {
  padding: 6px 0;
  font-size: var(--font-size-meta);
  font-weight: 800;
  line-height: 1.2;
}

.talk-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.talk-tag {
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

.talk-tag-link {
  position: relative;
  text-decoration: none;
  z-index: 0;
  transition: transform 0.16s ease, box-shadow 0.18s ease;
}

.talk-tag-link::after {
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

.talk-tag-link:hover,
.talk-tag-link:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(8, 15, 31, 0.12);
  z-index: 1000;
}

.talk-tag-link:hover::after,
.talk-tag-link:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.talk-tag-link:focus-visible {
  outline: none;
}

.talk-tag-material {
  --tag-bg: rgba(245, 158, 11, 0.18);
  --tag-border: rgba(245, 158, 11, 0.44);
  --tag-text: #5f3a00;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.96);
  --tag-tooltip-border: rgba(161, 98, 7, 0.96);
  --tag-tooltip-text: #251401;
}

.talk-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.16);
  --tag-border: rgba(56, 189, 248, 0.44);
  --tag-text: #053a52;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.96);
  --tag-tooltip-border: rgba(2, 132, 199, 0.96);
  --tag-tooltip-text: #052634;
}

.talk-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.16);
  --tag-border: rgba(20, 184, 166, 0.44);
  --tag-text: #06453f;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

.talk-tag-audience-size {
  --tag-bg: rgba(249, 115, 22, 0.16);
  --tag-border: rgba(249, 115, 22, 0.44);
  --tag-text: #6d2600;
  --tag-tooltip-bg: rgba(249, 115, 22, 0.96);
  --tag-tooltip-border: rgba(194, 65, 12, 0.96);
  --tag-tooltip-text: #2b0c01;
}

.talk-tag-audience-group {
  --tag-bg: rgba(100, 116, 139, 0.18);
  --tag-border: rgba(100, 116, 139, 0.44);
  --tag-text: #1f334f;
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(71, 85, 105, 0.96);
  --tag-tooltip-text: #f8fafc;
}

.talk-tag-duration {
  --tag-bg: rgba(168, 85, 247, 0.16);
  --tag-border: rgba(168, 85, 247, 0.44);
  --tag-text: #3d1362;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.96);
  --tag-tooltip-border: rgba(147, 51, 234, 0.96);
  --tag-tooltip-text: #12031f;
}

[data-theme="dark"] .talk-tag-material {
  --tag-bg: rgba(245, 158, 11, 0.3);
  --tag-border: rgba(245, 158, 11, 0.62);
  --tag-text: #ffe7a8;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.98);
  --tag-tooltip-border: rgba(251, 191, 36, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .talk-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.3);
  --tag-border: rgba(56, 189, 248, 0.62);
  --tag-text: #d3f4ff;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.98);
  --tag-tooltip-border: rgba(125, 211, 252, 0.98);
  --tag-tooltip-text: #041b25;
}

[data-theme="dark"] .talk-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.3);
  --tag-border: rgba(20, 184, 166, 0.62);
  --tag-text: #d2fff4;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(45, 212, 191, 0.98);
  --tag-tooltip-text: #021413;
}

[data-theme="dark"] .talk-tag-audience-size {
  --tag-bg: rgba(249, 115, 22, 0.3);
  --tag-border: rgba(249, 115, 22, 0.64);
  --tag-text: #ffe0c2;
  --tag-tooltip-bg: rgba(249, 115, 22, 0.98);
  --tag-tooltip-border: rgba(251, 146, 60, 0.98);
  --tag-tooltip-text: #200700;
}

[data-theme="dark"] .talk-tag-audience-group {
  --tag-bg: rgba(100, 116, 139, 0.3);
  --tag-border: rgba(100, 116, 139, 0.62);
  --tag-text: #e4ebf4;
  --tag-tooltip-bg: rgba(100, 116, 139, 0.98);
  --tag-tooltip-border: rgba(148, 163, 184, 0.98);
  --tag-tooltip-text: #f8fafc;
}

[data-theme="dark"] .talk-tag-duration {
  --tag-bg: rgba(168, 85, 247, 0.3);
  --tag-border: rgba(168, 85, 247, 0.62);
  --tag-text: #ece4ff;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.98);
  --tag-tooltip-border: rgba(192, 132, 252, 0.98);
  --tag-tooltip-text: #11021f;
}

.slide-actions {
  display: flex;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 14px;
}

.action-btn {
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

.action-btn.primary {
  border-color: rgba(80, 203, 255, 0.5);
  background: rgba(80, 203, 255, 0.13);
}

.action-btn:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(80, 203, 255, 0.45);
  box-shadow: 0 4px 12px rgba(8, 15, 31, 0.12);
  transform: translateY(-1px);
}

.action-btn:focus-visible {
  outline: none;
  border-color: rgba(80, 203, 255, 0.78);
  box-shadow: 0 0 0 2px rgba(80, 203, 255, 0.24);
}

[data-theme="light"] .action-btn {
  background: rgba(16, 36, 59, 0.04);
}

[data-theme="light"] .action-btn.primary {
  background: rgba(80, 203, 255, 0.1);
}

.slide-panel h2 {
  margin: 0 0 10px;
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
}

.slide-pagination {
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

.slide-pagination-footer {
  flex: 0 0 auto;
}

.slide-page-btn {
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

.slide-page-btn:hover:not(:disabled) {
  background: rgba(80, 203, 255, 0.24);
  border-color: rgba(80, 203, 255, 0.54);
  box-shadow: 0 3px 10px rgba(8, 15, 31, 0.28);
  transform: translateY(-1px);
}

.slide-page-btn:focus-visible {
  outline: none;
  border-color: rgba(80, 203, 255, 0.86);
  box-shadow: 0 0 0 2px rgba(80, 203, 255, 0.28);
}

.slide-page-btn:disabled {
  opacity: 0.48;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.slide-page-label {
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

.slide-page-input {
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

.slide-page-input::-webkit-outer-spin-button,
.slide-page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.slide-page-input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.slide-page-total {
  opacity: 0.88;
  font-weight: 650;
  white-space: nowrap;
}

.slide-page-input:focus-visible {
  outline: none;
}

.slide-page-label:focus-within {
  outline: none;
  border-color: rgba(80, 203, 255, 0.86);
  box-shadow: 0 0 0 2px rgba(80, 203, 255, 0.28);
}

.slide-frame-shell {
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

.slide-canvas-shell {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0f0f0f;
}

.slide-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border: 0;
}

.slide-canvas-overlay {
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

.slide-canvas-overlay a {
  color: #9adfff;
  text-decoration: underline;
}

.slide-error-text {
  font-size: var(--font-size-micro);
  opacity: 0.84;
}

.poster-name {
  margin: 0 0 10px;
  opacity: 0.88;
}

.poster-frame {
  width: 100%;
  min-height: 75vh;
  border: 1px solid var(--surface-outline);
  border-radius: 10px;
}

.muted-panel p {
  margin: 0;
  opacity: 0.84;
}

@media (max-width: 768px) {
  #slide-detail {
    padding: 0 10px 132px;
  }

  .slide-header,
  .slide-panel {
    padding: 14px;
  }

  .slide-header-top {
    flex-direction: column;
    gap: 8px;
  }

  .talk-date-detailed {
    white-space: normal;
  }

  .talk-detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 9px 0;
  }

  .talk-detail-row dd {
    margin-top: 0;
  }

  .talk-tags-footer {
    flex-direction: column;
    gap: 6px;
  }

  .talk-tags-label {
    padding: 0;
  }

  .action-btn {
    width: 100%;
  }

  .slide-pagination {
    padding: 10px;
    gap: 8px;
    grid-template-columns: minmax(78px, 1fr) auto minmax(78px, 1fr);
  }

  .slide-page-btn {
    padding: 6px 10px;
    font-size: var(--font-size-micro);
  }

  .slide-page-label {
    padding: 5px 9px;
    gap: 5px;
  }

  .slide-frame-shell {
    min-height: 56vh;
    height: 62vh;
    max-height: 78vh;
    resize: none;
  }

  .slide-canvas-shell {
    min-height: 0;
  }

  .poster-frame {
    min-height: 62vh;
  }

  .slide-pagination {
    padding: 8px 10px calc(10px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
