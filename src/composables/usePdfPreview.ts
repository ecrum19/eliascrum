import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from "vue";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";
import { loadPdfJs } from "../utils/pdfJs";
import { shouldDeferPdfPreviews } from "../utils/performanceMode";

const CANCELLATIONS = new Set([
  "RenderingCancelledException",
  "AbortException",
  "CancelledException",
]);
const isCancellation = (error: unknown) =>
  CANCELLATIONS.has((error as { name?: string } | null)?.name ?? "");

function describeError(error: unknown): string {
  if (!error) return "Unknown rendering error.";
  if (typeof error === "string") return error;
  const { message, name } = error as { message?: unknown; name?: unknown };
  for (const value of [message, name]) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "PDF preview failed to render.";
}

/**
 * One PDF.js canvas preview: deferred loading in Lite mode, fitted rendering, paging,
 * zoom, and cleanup. Pages keep their own markup and bind `shell`/`canvas` as template refs.
 * PDF.js objects stay outside Vue's reactivity; only what the template shows is reactive.
 */
export function usePdfPreview() {
  const shell = ref<HTMLElement>();
  const canvas = ref<HTMLCanvasElement>();
  const state = reactive({
    requested: !shouldDeferPdfPreviews(),
    currentPage: 1,
    maxPage: null as number | null,
    zoom: 1,
    isLoading: false,
    isRenderError: false,
    errorMessage: "",
    renderToken: 0,
  });
  let loadToken = 0;
  let loadingTask: PDFDocumentLoadingTask | null = null;
  let pdfDocument: PDFDocumentProxy | null = null;
  let renderTask: RenderTask | null = null;
  let frame: number | null = null;
  let observer: ResizeObserver | null = null;

  function fail(error: unknown, step: string) {
    state.isRenderError = true;
    state.errorMessage = describeError(error);
    console.error(`PDF preview ${step} failed:`, error);
  }

  /** Cancel rendering and dispose pending/loaded documents; cleanup failures are irrelevant. */
  async function release() {
    const [task, document] = [loadingTask, pdfDocument];
    renderTask?.cancel();
    loadingTask = null;
    pdfDocument = null;
    renderTask = null;
    // PDF.js 6 disposes a document, and its worker transport, through its loading task.
    await Promise.all([
      task?.destroy().catch(() => {}),
      document?.loadingTask.destroy().catch(() => {}),
    ]);
  }

  async function load(url: string) {
    const token = ++loadToken;
    state.isLoading = Boolean(url);
    state.isRenderError = false;
    state.errorMessage = "";
    state.maxPage = null;
    state.renderToken += 1;
    await release();
    if (!url) {
      state.isLoading = false;
      return;
    }
    let task: PDFDocumentLoadingTask | null = null;
    try {
      const { getDocument } = await loadPdfJs();
      task = getDocument({ url });
      loadingTask = task;
      const document = await task.promise;
      if (token !== loadToken) {
        void document.loadingTask.destroy();
        return;
      }
      pdfDocument = document;
      state.maxPage = document.numPages;
      state.currentPage = Math.min(Math.max(1, state.currentPage), document.numPages);
      // Runs after `finally` clears the loading state, once the canvas is in the DOM.
      void nextTick(() => {
        observeResize();
        queueRender();
      });
    } catch (error) {
      if (token === loadToken && !isCancellation(error)) fail(error, "load");
    } finally {
      if (loadingTask === task) loadingTask = null;
      if (token === loadToken) state.isLoading = false;
    }
  }

  /** Lite mode: load only after the visitor asks for the preview. */
  function request(url: string) {
    if (state.requested) return;
    state.requested = true;
    void nextTick(() => {
      observeResize();
      void load(url);
    });
  }

  function observeResize() {
    if (typeof ResizeObserver === "undefined" || !shell.value) return;
    observer?.disconnect();
    observer = new ResizeObserver(() => queueRender());
    observer.observe(shell.value);
  }

  function queueRender() {
    if (!pdfDocument || state.isLoading) return;
    const token = ++state.renderToken;
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      frame = null;
      void renderCurrentPage(token);
    });
  }

  /** The page fits inside the shell's padding. */
  function measure(element: HTMLElement) {
    const style = window.getComputedStyle(element);
    const padding = (start: string, end: string) =>
      Number.parseFloat(start || "0") + Number.parseFloat(end || "0");
    return {
      width: element.clientWidth - padding(style.paddingLeft, style.paddingRight),
      height: element.clientHeight - padding(style.paddingTop, style.paddingBottom),
    };
  }

  async function renderCurrentPage(token: number) {
    const document = pdfDocument;
    const target = canvas.value;
    if (!document || token !== state.renderToken || !shell.value || !target) return;
    const { width, height } = measure(shell.value);
    if (width < 2 || height < 2) return;
    const pageNumber = Math.min(document.numPages, Math.max(1, state.currentPage));
    if (pageNumber !== state.currentPage) {
      state.currentPage = pageNumber;
      return;
    }
    const isStale = () => token !== state.renderToken || pdfDocument !== document;
    if (renderTask) {
      const running = renderTask;
      running.cancel();
      try {
        await running.promise;
      } catch (error) {
        if (!isCancellation(error)) return fail(error, "cancellation");
      } finally {
        if (renderTask === running) renderTask = null;
      }
    }
    if (isStale()) return;
    let page;
    try {
      page = await document.getPage(pageNumber);
    } catch (error) {
      if (!isCancellation(error)) fail(error, "getPage");
      return;
    }
    if (isStale()) return;

    const base = page.getViewport({ scale: 1 });
    const scale =
      Math.max(0.1, Math.min(width / base.width, height / base.height)) * state.zoom;
    const pixelRatio = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));
    const cssViewport = page.getViewport({ scale });
    const viewport = page.getViewport({ scale: scale * pixelRatio });
    target.width = Math.max(1, Math.floor(viewport.width));
    target.height = Math.max(1, Math.floor(viewport.height));
    target.style.width = `${Math.floor(cssViewport.width)}px`;
    target.style.height = `${Math.floor(cssViewport.height)}px`;
    const context = target.getContext("2d");
    if (!context) return fail("Canvas context unavailable.", "canvas");
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, target.width, target.height);

    // PDF.js 6 requires the canvas as well as its 2D context.
    const task = page.render({ canvas: target, canvasContext: context, viewport });
    renderTask = task;
    state.isRenderError = false;
    state.errorMessage = "";
    try {
      await task.promise;
    } catch (error) {
      if (!isCancellation(error)) fail(error, "render");
    } finally {
      if (renderTask === task) renderTask = null;
    }
  }

  const setZoom = (scale: number) => {
    state.zoom = Math.min(3.5, Math.max(0.8, scale));
  };
  const zoomIn = () => setZoom(state.zoom * 1.18);
  const zoomOut = () => setZoom(state.zoom / 1.18);
  const actions = {
    load,
    request,
    observeResize,
    queueRender,
    renderCurrentPage,
    zoomIn,
    zoomOut,
    resetZoom: () => setZoom(1),
    /** Ctrl/Cmd + wheel zooms; plain wheel scrolls the page as usual. */
    onWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      if (event.deltaY < 0) zoomIn();
      else if (event.deltaY > 0) zoomOut();
    },
    previousPage() {
      state.currentPage = Math.max(1, state.currentPage - 1);
    },
    nextPage() {
      const next = state.currentPage + 1;
      state.currentPage = state.maxPage === null ? next : Math.min(state.maxPage, next);
    },
    onPageInput(event: Event) {
      const input = event.target as HTMLInputElement;
      const parsed = Number.parseInt(input.value, 10);
      const page = Number.isFinite(parsed) ? Math.max(1, parsed) : state.currentPage;
      state.currentPage = state.maxPage === null ? page : Math.min(state.maxPage, page);
      input.value = String(state.currentPage);
    },
  };

  watch(
    () => state.currentPage,
    () => {
      if (shell.value) {
        shell.value.scrollTop = 0;
        shell.value.scrollLeft = 0;
      }
      queueRender();
    },
  );
  watch(() => state.zoom, queueRender);
  onMounted(() =>
    nextTick(() => {
      if (!state.requested) return;
      observeResize();
      queueRender();
    }),
  );
  onBeforeUnmount(() => {
    if (frame !== null) window.cancelAnimationFrame(frame);
    observer?.disconnect();
    void release();
  });

  const preview = reactive({
    ...toRefs(state),
    zoomLabel: computed(() => `${Math.round(state.zoom * 100)}%`),
    pageInputStyle: computed(() => ({
      width: `${Math.min(4.4, Math.max(1.7, String(Math.max(1, state.currentPage)).length + 0.35))}ch`,
    })),
    ...actions,
  });
  return { preview, shell, canvas };
}
