<template>
  <section id="publication-paper-page" class="w3-content w3-margin-top" style="max-width: min(1920px, 97vw)">
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
              <router-link to="/publications" class="paper-action-btn">Back to Publications</router-link>
              <a
                v-if="paperPdfUrl"
                :href="paperPdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="paper-action-btn primary"
              >
                Open PDF
              </a>
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
                    :href="detail.href"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ detail.value }}
                  </a>
                  <span v-else>{{ detail.value }}</span>
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
                <a
                  v-if="paperPdfUrl"
                  :href="paperPdfUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="paper-inline-link"
                >
                  Open directly
                </a>
              </div>
              <div v-if="paperPdfUrl" class="paper-pdf-shell">
                <object :data="paperPdfUrl" type="application/pdf" class="paper-pdf-frame">
                  <div class="paper-pdf-fallback">
                    <p>Preview unavailable in this browser.</p>
                    <a
                      :href="paperPdfUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="paper-action-btn primary"
                    >
                      Open PDF
                    </a>
                  </div>
                </object>
              </div>
              <p v-else class="paper-empty">The hosted PDF has not been added yet.</p>
            </div>
          </section>
        </template>

        <section v-else class="paper-section">
          <div class="paper-panel">
            <h1>Publication Not Found</h1>
            <p>The requested publication paper page could not be resolved.</p>
            <router-link to="/publications" class="paper-action-btn primary">Back to Publications</router-link>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WorkToc from "./WorkToc.vue";
import { getPublicationBySlug, type Publication } from "../data/publicationsData";
import { resolvePublicAssetPath } from "../utils/publicAssetPath";

interface TocEntry {
  id: string;
  label: string;
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
    };
  },
  computed: {
    publication(): Publication | undefined {
      const slug = String(this.$route.params.slug || "");
      return getPublicationBySlug(slug);
    },
    paperPdfUrl(): string | undefined {
      if (!this.publication?.paperPdfPath) {
        return undefined;
      }

      return resolvePublicAssetPath(this.publication.paperPdfPath);
    },
    publicationDateLabel(): string {
      const rawDate = this.publication?.sortDate || "";
      if (!rawDate) {
        return "Date unavailable";
      }

      return rawDate;
    },
    tocEntries(): TocEntry[] {
      if (!this.publication) {
        return [];
      }

      const entries: TocEntry[] = [
        { id: "paper-overview", label: "Overview" },
        { id: "paper-summary", label: "Summary" },
      ];

      if (this.publication.abstract) {
        entries.push({ id: "paper-abstract", label: "Abstract" });
      }

      entries.push(
        { id: "paper-details", label: "Details" },
        { id: "paper-citation", label: "BibTeX" },
        { id: "paper-pdf", label: "PDF" },
      );

      return entries;
    },
  },
  beforeUnmount() {
    if (this.copiedResetTimer) {
      clearTimeout(this.copiedResetTimer);
    }
  },
  methods: {
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
  background: var(--surface-bg);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 18px;
}

.paper-header {
  background: linear-gradient(180deg, rgba(80, 203, 255, 0.11), rgba(45, 212, 191, 0.05));
}

[data-theme="light"] .paper-header {
  background: linear-gradient(180deg, rgba(80, 203, 255, 0.13), rgba(16, 36, 59, 0.05));
}

.paper-kicker {
  margin: 0;
  color: var(--page-text);
  opacity: 0.74;
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
  opacity: 0.8;
  font-size: var(--font-size-body);
}

.paper-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.paper-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--page-text);
  border: 1px solid var(--surface-outline);
  background: transparent;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: var(--font-size-body);
  line-height: 1.2;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.paper-action-btn.primary {
  border-color: rgba(80, 203, 255, 0.42);
  background: rgba(80, 203, 255, 0.08);
}

.paper-action-btn:hover {
  background: var(--nav-hover-bg);
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
  background: rgba(0, 0, 0, 0.18);
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

.paper-pdf-shell {
  border: 1px solid var(--surface-outline);
  border-radius: 12px;
  overflow: hidden;
  min-height: 78vh;
  background: rgba(0, 0, 0, 0.18);
}

.paper-pdf-frame {
  width: 100%;
  height: 78vh;
  border: 0;
  display: block;
}

.paper-pdf-fallback {
  min-height: 220px;
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 20px;
  text-align: center;
}

.paper-empty {
  opacity: 0.78;
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

  .paper-pdf-shell,
  .paper-pdf-frame {
    min-height: 70vh;
    height: 70vh;
  }

  .paper-action-btn {
    width: 100%;
  }
}
</style>
