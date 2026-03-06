<template>
  <section id="cv" class="w3-content w3-margin-top" style="max-width: 1400px">
    <div class="cv-shell">
      <header class="cv-header">
        <h1>Curriculum Vitae</h1>
        <p>
          A structured overview of academic research, professional experience, and scholastic milestones.
        </p>
      </header>

      <article
        v-for="section in cvSections"
        :key="section.title"
        class="cv-section"
      >
        <h2>{{ section.title }}</h2>
        <div class="cv-items">
          <div
            v-for="item in section.items"
            :key="getItemKey(section.title, item)"
            class="cv-item"
            :class="{ 'cv-item--priority': isPriorityItem(item) }"
          >
            <div class="cv-item-head">
              <div>
                <h3 class="cv-role" v-html="formatWithEmphasis(item.role)"></h3>
                <p
                  v-if="item.organization"
                  class="cv-organization"
                  v-html="formatWithEmphasis(item.organization)"
                ></p>
              </div>
              <span
                v-if="item.date"
                class="cv-date"
                :class="{ 'cv-date--current': isCurrentItem(item.date) }"
              >
                {{ item.date }}
              </span>
            </div>

            <ul v-if="item.details?.length" class="cv-details">
              <li
                v-for="(detail, detailIndex) in item.details"
                :key="getDetailKey(item, detail, detailIndex)"
              >
                <template v-if="isLinkDetail(detail)">
                  <span
                    v-if="detail.prefix"
                    v-html="formatWithEmphasis(detail.prefix)"
                  ></span>
                  <a
                    :href="detail.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    v-html="formatWithEmphasis(detail.text)"
                  ></a>
                </template>
                <template v-else>
                  <span v-html="formatWithEmphasis(detail)"></span>
                </template>
              </li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { cvSections, type CvDetail, type CvItem } from "../data/cvData";

type CvLinkDetail = Exclude<CvDetail, string>;

const EMPHASIS_PATTERNS: RegExp[] = [
  /Ph\.D\.?/gi,
  /Master's/gi,
  /Doctor of Computer Science Engineering/gi,
  /Solid protocol/gi,
  /SPARQL/gi,
  /RDF/gi,
  /Linked Data/gi,
  /decentralized querying/gi,
  /ontology definition/gi,
  /Primary author/gi,
  /Contributing author/gi,
  /GPA:\s*4\.000\s*\/\s*4\.000/gi,
  /Research Fellowship Award/gi,
];

export default defineComponent({
  name: "CurrentCv",
  data() {
    return {
      cvSections,
    };
  },
  methods: {
    getItemKey(sectionTitle: string, item: CvItem): string {
      return `${sectionTitle}-${item.role}-${item.date ?? "undated"}`;
    },
    getDetailKey(item: CvItem, detail: CvDetail, detailIndex: number): string {
      const normalizedDetail =
        typeof detail === "string" ? detail : `${detail.prefix ?? ""}${detail.text}`;
      return `${item.role}-${detailIndex}-${normalizedDetail}`;
    },
    isLinkDetail(detail: CvDetail): detail is CvLinkDetail {
      return typeof detail === "object";
    },
    isCurrentItem(date: string): boolean {
      return /present/i.test(date);
    },
    isPriorityItem(item: CvItem): boolean {
      const roleSignals = /(Ph\.D|Doctor|Master|Professor|Fellowship)/i.test(item.role);
      const currentSignal = item.date ? this.isCurrentItem(item.date) : false;
      const detailsText = (item.details ?? [])
        .map((detail) =>
          typeof detail === "string"
            ? detail
            : `${detail.prefix ?? ""} ${detail.text}`
        )
        .join(" ");
      const detailSignals =
        /(Primary author|Contributing author|GPA:\s*4\.000|SPARQL|Linked Data|Solid protocol)/i.test(
          detailsText
        );

      return roleSignals || currentSignal || detailSignals;
    },
    escapeHtml(input: string): string {
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },
    formatWithEmphasis(text: string): string {
      let safeText = this.escapeHtml(text);
      EMPHASIS_PATTERNS.forEach((pattern) => {
        safeText = safeText.replace(
          pattern,
          '<span class="auto-emphasis">$&</span>'
        );
      });
      return safeText;
    },
  },
});
</script>

<style scoped>
#cv {
  padding: 0 16px 140px;
}

.cv-shell {
  display: grid;
  gap: 18px;
}

.cv-header {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 18px 22px;
}

.cv-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.cv-header p {
  margin: 8px 0 0;
  color: var(--page-text);
  opacity: 0.88;
  font-size: var(--font-size-body);
}

.cv-section {
  background: var(--surface-bg);
  outline: 2px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 20px;
}

.cv-section h2 {
  margin: 0 0 14px;
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  color: var(--page-text);
}

.cv-items {
  display: grid;
  gap: 12px;
}

.cv-item {
  padding: 12px 14px;
  border-radius: 10px;
  border-left: 3px solid rgba(80, 203, 255, 0.55);
  background: rgba(255, 255, 255, 0.04);
}

.cv-item--priority {
  border-left-color: rgba(45, 212, 191, 0.85);
  box-shadow: inset 0 0 0 1px rgba(45, 212, 191, 0.28);
}

[data-theme="light"] .cv-item {
  background: rgba(16, 36, 59, 0.05);
  border-left-color: rgba(13, 79, 136, 0.45);
}

[data-theme="light"] .cv-item--priority {
  border-left-color: rgba(13, 79, 136, 0.82);
  box-shadow: inset 0 0 0 1px rgba(13, 79, 136, 0.26);
}

.cv-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-role {
  margin: 0;
  color: var(--page-text);
  font-size: var(--font-size-body-lg);
}

.cv-organization {
  margin: 3px 0 0;
  color: var(--page-text);
  opacity: 0.9;
}

.cv-date {
  color: var(--page-text);
  white-space: nowrap;
  border: 1px solid var(--surface-outline);
  background: var(--toggle-bg);
  border-radius: 999px;
  padding: 4px 10px;
  font-weight: 600;
  font-size: var(--font-size-label);
}

.cv-date--current {
  border-color: rgba(45, 212, 191, 0.75);
  background: rgba(45, 212, 191, 0.18);
}

[data-theme="light"] .cv-date--current {
  border-color: rgba(13, 79, 136, 0.5);
  background: rgba(13, 79, 136, 0.14);
}

.cv-details {
  margin: 10px 0 0;
  padding-left: 20px;
}

.cv-details li {
  color: var(--page-text);
  margin-bottom: 7px;
  line-height: 1.45;
}

.cv-details a {
  color: var(--link-color);
  text-decoration: underline;
}

:deep(.auto-emphasis) {
  font-weight: 700;
  color: var(--page-text);
  background: rgba(250, 204, 21, 0.2);
  border-radius: 4px;
  padding: 0 4px;
}

[data-theme="light"] :deep(.auto-emphasis) {
  background: rgba(13, 79, 136, 0.18);
}

@media (max-width: 768px) {
  #cv {
    padding: 0 10px 132px;
  }

  .cv-header,
  .cv-section {
    padding: 14px;
  }

  .cv-role {
    font-size: var(--font-size-body);
  }
}
</style>
