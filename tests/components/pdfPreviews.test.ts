import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import { mountPage } from "../helpers/mountPage";
import FellowshipDetail from "../../src/components/FellowshipDetail.vue";
import PublicationPaperPage from "../../src/components/PublicationPaperPage.vue";
import SlideDetail from "../../src/components/SlideDetail.vue";
import PdfViewer from "../../src/components/detail/PdfViewer.vue";
import { entryPath, publicationCatalog, talkCatalog } from "../../src/content/catalog";
import { loadPdfJs } from "../../src/utils/pdfJs";

vi.mock("../../src/utils/pdfJs", () => ({ loadPdfJs: vi.fn() }));

// PDF.js and canvas are the browser boundary. Real page controls/lifecycle run against this contract.
function pdfFixture() {
  const destroy = vi.fn().mockResolvedValue(undefined);
  const render = vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() }));
  const getPage = vi
    .fn()
    .mockResolvedValue({
      getViewport: ({ scale }: { scale: number }) => ({
        width: 600 * scale,
        height: 800 * scale,
      }),
      render,
    });
  const document = { numPages: 3, getPage, loadingTask: { destroy } };
  const getDocument = vi.fn(() => ({
    promise: Promise.resolve(document),
    destroy,
  }));
  vi.mocked(loadPdfJs).mockResolvedValue({ getDocument } as unknown as Awaited<
    ReturnType<typeof loadPdfJs>
  >);
  return { document, destroy, render, getPage, getDocument };
}

beforeEach(() => {
  // Frame scheduling is tested separately; these tests explicitly advance rendering after measurement.
  vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(900);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const cases = [
  {
    component: FellowshipDetail,
    path: "/about/fellowships/fwo-phd-fellowship",
    noun: "Fellowship",
    zoom: true,
  },
  {
    component: PublicationPaperPage,
    path: entryPath(publicationCatalog.entries.find((entry) => entry.links?.paper)!),
    noun: "Paper",
    zoom: true,
  },
  {
    component: SlideDetail,
    path: entryPath(talkCatalog.entries.find((entry) => !entry.slides.embedUrl)!),
    noun: "Slide",
    zoom: false,
  },
];

// The shared lifecycle is tested in tests/unit/usePdfPreview.test.ts; these check each page's wiring.
for (const page of cases) {
  it(`${page.noun} page wires its deferred PDF preview, controls, and cleanup`, async () => {
    const fixture = pdfFixture();
    const { wrapper } = await mountPage(page.component, page.path);
    expect(fixture.getDocument).not.toHaveBeenCalled();
    await wrapper.get(".deferred-preview button").trigger("click");
    await flushPromises();
    expect(fixture.getDocument).toHaveBeenCalledOnce();
    const { pdf } = wrapper.findComponent(PdfViewer).vm as unknown as {
      pdf: { renderCurrentPage(token: number): Promise<void>; renderToken: number };
    };
    await pdf.renderCurrentPage(pdf.renderToken);
    expect(fixture.render).toHaveBeenCalledWith(
      expect.objectContaining({ canvas: wrapper.get("canvas").element }),
    );
    const input = wrapper.get('input[type="number"]');
    const button = (text: string) =>
      wrapper.findAll("button").find((candidate) => candidate.text() === text)!;
    await button("Next").trigger("click");
    expect((input.element as HTMLInputElement).value).toBe("2");
    await button("Previous").trigger("click");
    expect((input.element as HTMLInputElement).value).toBe("1");
    await input.setValue("99");
    expect((input.element as HTMLInputElement).value).toBe("3");
    expect(wrapper.find('[aria-label="Zoom in"]').exists()).toBe(page.zoom);
    if (page.zoom) {
      await wrapper.get('[aria-label="Zoom in"]').trigger("click");
      expect(wrapper.text()).toContain("118%");
      await wrapper.get('[class$="zoom-reset"]').trigger("click");
      expect(wrapper.text()).toContain("100%");
    }
    wrapper.unmount();
    expect(fixture.destroy).toHaveBeenCalled();
  });
}

it("pages slides with the arrow keys, except while typing", async () => {
  pdfFixture();
  const { wrapper } = await mountPage(SlideDetail, cases[2].path);
  await wrapper.get(".deferred-preview button").trigger("click");
  await flushPromises();
  const input = wrapper.get('input[type="number"]').element as HTMLInputElement;
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
  await nextTick();
  expect(input.value).toBe("2");
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
  await nextTick();
  expect(input.value).toBe("2");
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
  await nextTick();
  expect(input.value).toBe("1");
});

it("handles HTML talks without requesting PDF.js", async () => {
  const fixture = pdfFixture();
  const { wrapper, router } = await mountPage(
    SlideDetail,
    "/talks/metabolinkai",
  );
  await wrapper.get(".deferred-preview button").trigger("click");
  expect(wrapper.get("iframe").attributes("src")).toContain(
    "MetaboLinkAI-Slides",
  );
  expect(fixture.getDocument).not.toHaveBeenCalled();
  await router.push("/talks/missing");
  await flushPromises();
  expect(wrapper.text()).toContain("Talk not found");
});

it("shows every publication source and copies BibTeX using the clipboard API", async () => {
  vi.stubGlobal("isSecureContext", true);
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  const { wrapper, router } = await mountPage(
    PublicationPaperPage,
    entryPath(publicationCatalog.entries[0]),
  );
  for (const entry of publicationCatalog.entries) {
    await router.push(entryPath(entry));
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe(entry.title);
  }
  const copy = wrapper.get('[aria-label="Copy BibTeX citation"]');
  await copy.trigger("click");
  await flushPromises();
  expect(writeText).toHaveBeenCalledWith(publicationCatalog.entries.at(-1)!.bibtex);
  await router.push("/publications/missing/paper");
  await flushPromises();
  expect(wrapper.text()).toContain("could not be resolved");
});
