import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";

export type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask };

type PdfJsModule = typeof import("pdfjs-dist");

let pdfJsPromise: Promise<PdfJsModule> | null = null;

/**
 * Load PDF.js and its worker only when a PDF viewer is actually opened.
 * The cached promise also makes all viewers share one worker configuration.
 */
export function loadPdfJs(): Promise<PdfJsModule> {
  pdfJsPromise ??= initializePdfJs();
  return pdfJsPromise;
}

async function initializePdfJs(): Promise<PdfJsModule> {
  const pdfJs = await import("pdfjs-dist/build/pdf.mjs");

  if (!pdfJs.GlobalWorkerOptions.workerPort) {
    try {
      const workerModule = await import("pdfjs-dist/build/pdf.worker.mjs?worker");
      const WorkerConstructor = workerModule.default as unknown as new () => Worker;
      pdfJs.GlobalWorkerOptions.workerPort = new WorkerConstructor();
    } catch {
      const workerUrlModule = await import("pdfjs-dist/build/pdf.worker.mjs?url");
      pdfJs.GlobalWorkerOptions.workerSrc = workerUrlModule.default;
    }
  }

  return pdfJs;
}
