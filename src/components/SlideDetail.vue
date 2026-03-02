<template>
  <section id="slide-detail" class="w3-content w3-margin-top" style="max-width: 1400px">
    <div v-if="talk" class="slide-shell">
      <header class="slide-header">
        <div>
          <h1>{{ talk.displayTitle }}</h1>
          <p>{{ talk.displayDateLabel }}</p>
          <p class="talk-summary">{{ talk.description }}</p>
          <div class="talk-tags" v-if="talk.venueTags.length || talk.topicTags.length">
            <span
              v-for="tag in talk.venueTags"
              :key="`${talk.slug}-${tag}`"
              class="talk-tag talk-tag-venue"
            >
              {{ tag }}
            </span>
            <span
              v-for="tag in talk.topicTags"
              :key="`${talk.slug}-${tag}`"
              class="talk-tag talk-tag-topic"
            >
              {{ tag }}
            </span>
          </div>
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
      </header>

      <article class="slide-panel">
        <h2>Slides</h2>
        <div
          ref="slideFrameShell"
          class="slide-frame-shell"
          :class="{ 'is-resizing': isResizingSlide }"
          :style="slideFrameShellStyle"
        >
          <object :data="slidePdfUrl" type="application/pdf" class="slide-frame">
            <p>
              Your browser cannot render the slide PDF inline.
              <a :href="slidePdfUrl" target="_blank" rel="noopener noreferrer">Open the slides</a>.
            </p>
          </object>
          <div
            ref="slideResizeBar"
            class="slide-resize-bar"
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize slide preview height"
            @pointerdown.prevent="startSlideResize"
          ></div>
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
import { defineComponent } from "vue";
import { getTalkViewBySlug, type TalkViewEntry } from "../data/talkCatalog";
import {
  getRelatedPublicationLinksForPresentationFile,
  getRelatedPublicationLinksForTalkSlug,
  type ResolvedPublicationLink,
} from "../data/publicationsData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";

export default defineComponent({
  name: "SlideDetail",
  data() {
    return {
      slideFrameHeight: null as number | null,
      isResizingSlide: false,
      activeResizePointerId: null as number | null,
      resizeStartY: 0,
      resizeStartHeight: 0,
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
    slidePdfUrl(): string {
      return this.talk ? resolvePublicAssetPath(this.talk.slidePath) : "";
    },
    posterPdfUrl(): string {
      return this.talk?.posterPath ? resolvePublicAssetPath(this.talk.posterPath) : "";
    },
    slideFrameShellStyle(): Record<string, string> {
      if (this.slideFrameHeight === null) {
        return {};
      }
      return { height: `${this.slideFrameHeight}px` };
    },
  },
  beforeUnmount() {
    this.stopSlideResize();
  },
  methods: {
    startSlideResize(event: PointerEvent) {
      if (window.matchMedia("(max-width: 768px)").matches) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const shell = this.$refs.slideFrameShell as HTMLElement | undefined;
      const handle = this.$refs.slideResizeBar as HTMLElement | undefined;
      if (!shell || !handle) {
        return;
      }

      this.isResizingSlide = true;
      this.activeResizePointerId = event.pointerId;
      this.resizeStartY = event.clientY;
      this.resizeStartHeight = shell.getBoundingClientRect().height;

      if (typeof handle.setPointerCapture === "function") {
        handle.setPointerCapture(event.pointerId);
      }

      document.body.classList.add("slide-resize-active");
      window.addEventListener("pointermove", this.onSlideResizeMove);
      window.addEventListener("pointerup", this.stopSlideResize);
      window.addEventListener("pointercancel", this.stopSlideResize);
    },
    onSlideResizeMove(event: PointerEvent) {
      if (!this.isResizingSlide) {
        return;
      }

      if (this.activeResizePointerId !== null && event.pointerId !== this.activeResizePointerId) {
        return;
      }

      const minHeight = 520;
      const maxHeight = Math.max(minHeight + 20, Math.floor(window.innerHeight * 0.95));
      const nextHeight = this.resizeStartHeight + (event.clientY - this.resizeStartY);
      this.slideFrameHeight = Math.min(maxHeight, Math.max(minHeight, Math.round(nextHeight)));
      event.preventDefault();
    },
    stopSlideResize(event?: PointerEvent) {
      if (event && this.activeResizePointerId !== null && event.pointerId !== this.activeResizePointerId) {
        return;
      }

      const handle = this.$refs.slideResizeBar as HTMLElement | undefined;
      if (handle && this.activeResizePointerId !== null && typeof handle.releasePointerCapture === "function") {
        try {
          handle.releasePointerCapture(this.activeResizePointerId);
        } catch {
          // Ignore if pointer capture was already released.
        }
      }

      this.isResizingSlide = false;
      this.activeResizePointerId = null;
      document.body.classList.remove("slide-resize-active");
      window.removeEventListener("pointermove", this.onSlideResizeMove);
      window.removeEventListener("pointerup", this.stopSlideResize);
      window.removeEventListener("pointercancel", this.stopSlideResize);
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

.slide-header h1 {
  margin: 0;
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
}

.slide-header p {
  margin: 8px 0 0;
  opacity: 0.9;
}

.talk-summary {
  max-width: 85ch;
  line-height: 1.5;
}

.talk-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.talk-tag {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 0.82rem;
  color: var(--page-text);
}

.talk-tag-venue {
  background: rgba(80, 203, 255, 0.14);
}

.talk-tag-topic {
  background: rgba(45, 212, 191, 0.14);
}

.slide-actions {
  display: flex;
  flex-wrap: wrap;
  row-gap: 12px;
  column-gap: 22px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--page-text);
  border: 1px solid var(--surface-outline);
  background: transparent;
  border-radius: 999px;
  padding: 7px 14px;
  font-weight: 600;
  min-width: 0;
  line-height: 1.2;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.action-btn.primary {
  border-color: rgba(80, 203, 255, 0.42);
  background: rgba(80, 203, 255, 0.08);
}

.action-btn:hover {
  background: var(--nav-hover-bg);
}

.slide-panel h2 {
  margin: 0 0 10px;
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
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
}

.slide-frame-shell.is-resizing {
  outline: 2px solid rgba(80, 203, 255, 0.52);
}

.slide-frame {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  border: none;
  display: block;
  background: #0f0f0f;
}

.slide-resize-bar {
  width: 100%;
  border: 0;
  border-top: 1px solid var(--surface-outline);
  background: transparent;
  cursor: ns-resize;
  padding: 8px 0 10px;
  position: relative;
  touch-action: none;
}

.slide-resize-bar::after {
  content: "";
  display: block;
  width: clamp(84px, 16vw, 132px);
  height: 5px;
  margin: 0 auto;
  border-radius: 999px;
  background: rgba(80, 203, 255, 0.5);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.slide-resize-bar:hover::after,
.slide-resize-bar:focus-visible::after {
  background: rgba(80, 203, 255, 0.78);
  transform: scaleX(1.03);
}

.slide-resize-bar:focus-visible {
  outline: none;
}

:global(body.slide-resize-active) {
  cursor: ns-resize;
  user-select: none;
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

  .action-btn {
    width: 100%;
  }

  .slide-frame-shell,
  .slide-frame,
  .poster-frame {
    min-height: 62vh;
  }

  .slide-frame-shell {
    height: 66vh;
    max-height: none;
  }

  .slide-resize-bar {
    display: none;
  }
}
</style>
