import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { usePdfPreview } from "../../src/composables/usePdfPreview";
import { loadPdfJs } from "../../src/utils/pdfJs";

vi.mock("../../src/utils/pdfJs", () => ({ loadPdfJs: vi.fn() }));

// PDF.js and canvas are the browser boundary; the composable's lifecycle runs for real.
function pdfFixture(numPages = 3) {
  const destroy = vi.fn().mockResolvedValue(undefined);
  const render = vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() }));
  const getPage = vi.fn().mockResolvedValue({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
    render,
  });
  const document = { numPages, getPage, loadingTask: { destroy } };
  const getDocument = vi.fn(() => ({ promise: Promise.resolve(document), destroy }));
  vi.mocked(loadPdfJs).mockResolvedValue({ getDocument } as unknown as Awaited<
    ReturnType<typeof loadPdfJs>
  >);
  return { destroy, render, getPage, getDocument };
}

function mountPreview(shellStyle = "") {
  let pdf!: ReturnType<typeof usePdfPreview>["preview"];
  const Host = defineComponent({
    setup() {
      const { preview, shell, canvas } = usePdfPreview();
      pdf = preview;
      return () => h("div", { ref: shell, style: shellStyle }, [h("canvas", { ref: canvas })]);
    },
  });
  const wrapper = mount(Host);
  const render = () => pdf.renderCurrentPage(pdf.renderToken);
  return { wrapper, pdf, render, canvas: wrapper.get("canvas").element as HTMLCanvasElement };
}

beforeEach(() => {
  // Frame scheduling is not under test; renders are advanced explicitly.
  vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(900);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("usePdfPreview", () => {
  it("loads, renders with the PDF.js 6 API, fits the shell, and releases the document", async () => {
    const fixture = pdfFixture();
    const { wrapper, pdf, render, canvas } = mountPreview();
    await pdf.load("/paper.pdf");
    expect(fixture.getDocument).toHaveBeenCalledWith({ url: "/paper.pdf" });
    expect(pdf.maxPage).toBe(3);
    await render();
    expect(fixture.render).toHaveBeenCalledWith(
      expect.objectContaining({ canvas, canvasContext: expect.any(Object), viewport: expect.any(Object) }),
    );
    // A 600×800 page in a 900×600 shell is limited by height: scale 0.75.
    expect(canvas.style.width).toBe("450px");
    expect(canvas.style.height).toBe("600px");
    wrapper.unmount();
    expect(fixture.destroy).toHaveBeenCalled();
  });
  it("fits the page inside the shell padding", async () => {
    pdfFixture();
    const padded = mountPreview("padding: 50px");
    await padded.pdf.load("/a.pdf");
    await padded.render();
    expect(padded.canvas.style.width).toBe("375px"); // 500px tall content box → scale 0.625
  });
  it("clamps paging and zoom, and zooms with Ctrl/Cmd + wheel only", async () => {
    pdfFixture();
    const { pdf } = mountPreview();
    await pdf.load("/a.pdf");
    pdf.previousPage();
    expect(pdf.currentPage).toBe(1);
    for (let i = 0; i < 5; i++) pdf.nextPage();
    expect(pdf.currentPage).toBe(3);
    const input = Object.assign(document.createElement("input"), { value: "99" });
    pdf.onPageInput({ target: input } as unknown as Event);
    expect([pdf.currentPage, input.value]).toEqual([3, "3"]);
    input.value = "0";
    pdf.onPageInput({ target: input } as unknown as Event);
    expect([pdf.currentPage, input.value]).toEqual([1, "1"]);
    input.value = "x";
    pdf.onPageInput({ target: input } as unknown as Event);
    expect(pdf.currentPage).toBe(1);
    pdf.zoomIn();
    expect(pdf.zoomLabel).toBe("118%");
    for (let i = 0; i < 20; i++) pdf.zoomIn();
    expect(pdf.zoom).toBe(3.5);
    for (let i = 0; i < 20; i++) pdf.zoomOut();
    expect(pdf.zoom).toBe(0.8);
    pdf.resetZoom();
    pdf.onWheel(new WheelEvent("wheel", { deltaY: -1 }));
    expect(pdf.zoom).toBe(1);
    pdf.onWheel(new WheelEvent("wheel", { ctrlKey: true, deltaY: -1 }));
    expect(pdf.zoomLabel).toBe("118%");
    pdf.onWheel(new WheelEvent("wheel", { metaKey: true, deltaY: 1 }));
    expect(pdf.zoomLabel).toBe("100%");
    expect(pdf.pageInputStyle).toEqual({ width: "1.7ch" });
  });
  it("reports load failures and recovers on another attempt", async () => {
    const fixture = pdfFixture();
    vi.mocked(loadPdfJs).mockRejectedValueOnce(new Error("Fixture PDF unavailable"));
    const { pdf } = mountPreview();
    await pdf.load("/a.pdf");
    expect([pdf.isRenderError, pdf.errorMessage, pdf.isLoading]).toEqual([
      true,
      "Fixture PDF unavailable",
      false,
    ]);
    await pdf.load("/a.pdf");
    expect([pdf.isRenderError, pdf.errorMessage]).toEqual([false, ""]);
    expect(fixture.getDocument).toHaveBeenCalledOnce();
  });
  it("reports page errors, ignores cancellation, rejects stale renders, and unloads", async () => {
    const fixture = pdfFixture();
    const { pdf, render } = mountPreview();
    await pdf.load("/a.pdf");
    fixture.getPage.mockRejectedValueOnce(new Error("Page unavailable"));
    await render();
    expect(pdf.errorMessage).toBe("Page unavailable");
    await render();
    expect(pdf.isRenderError).toBe(false);
    fixture.getPage.mockRejectedValueOnce({ name: "RenderingCancelledException" });
    await render();
    expect(pdf.isRenderError).toBe(false);
    const calls = fixture.getPage.mock.calls.length;
    await pdf.renderCurrentPage(-1);
    expect(fixture.getPage).toHaveBeenCalledTimes(calls);
    await pdf.load("");
    await render();
    expect(fixture.getPage).toHaveBeenCalledTimes(calls);
    expect(fixture.destroy).toHaveBeenCalled();
  });
  it("defers loading in Lite mode until requested, once", async () => {
    localStorage.setItem("site-performance-mode", "lite");
    const fixture = pdfFixture();
    const { pdf } = mountPreview();
    expect(pdf.requested).toBe(false);
    pdf.request("/a.pdf");
    pdf.request("/b.pdf");
    await nextTick();
    await flushPromises();
    expect(fixture.getDocument).toHaveBeenCalledOnce();
    expect(fixture.getDocument).toHaveBeenCalledWith({ url: "/a.pdf" });
  });
});
