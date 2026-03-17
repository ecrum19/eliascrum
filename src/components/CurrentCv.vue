<template>
  <section id='cv' class='w3-content w3-margin-top' style='max-width: min(1920px, 97vw)'>
    <div class='work-layout'>
      <work-toc :entries='tocEntries' title='CV' />

      <div class='work-main'>
        <section id='cv-overview' class='work-section toc-anchor'>
          <header class='cv-header'>
            <div class='cv-header-top'>
              <div class='cv-identity'>
                <p class='cv-kicker'>Curriculum Vitae</p>
                <h1>{{ cvProfile.name }}</h1>
                <p class='cv-headline'>{{ cvProfile.headline }}</p>
              </div>
              <p class='cv-address'>{{ cvProfile.address }}</p>
            </div>

            <div class='cv-contact-list'>
              <a
                v-for='contact in cvProfile.contacts'
                :key='contact.label'
                class='cv-contact-link'
                :href='contact.href'
                target='_blank'
                rel='noopener noreferrer'
              >
                <i class='fa' :class='contact.icon' aria-hidden='true'></i>
                <span>{{ contact.value }}</span>
              </a>
            </div>

            <div id='cv-focus' class='cv-focus toc-anchor'>
              <span class='cv-focus-label'>Core Areas</span>
              <div class='cv-focus-tags'>
                <span
                  v-for='tag in cvProfile.focusTags'
                  :key='tag'
                  class='cv-focus-tag'
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </header>
        </section>

        <section id='cv-sections' class='work-section'>
          <div class='work-section-block'>
            <article
              v-for='section in cvSections'
              :id='sectionId(section.title)'
              :key='section.title'
              class='cv-section-card toc-anchor'
            >
              <div class='cv-section-heading'>
                <h2>{{ section.title }}</h2>
              </div>

              <div v-if='section.layout === "skills"' class='cv-skill-list'>
                <div
                  v-for='item in section.items'
                  :key='getItemKey(section.title, item)'
                  class='cv-skill-row'
                >
                  <div class='cv-skill-label'>{{ item.role }}</div>
                  <div class='cv-skill-value'>{{ primaryDetailText(item) }}</div>
                </div>
              </div>

              <div v-else-if='section.layout === "awards"' class='cv-award-groups'>
                <section
                  v-for='group in groupedItems(section)'
                  :key='`${section.title}-${group.title ?? "default"}`'
                  class='cv-award-group'
                >
                  <h3 v-if='group.title' class='cv-subheading'>{{ group.title }}</h3>
                  <div class='cv-award-list'>
                    <article
                      v-for='item in group.items'
                      :key='getItemKey(section.title, item)'
                      class='cv-award-item'
                    >
                      <span v-if='item.date' class='cv-award-date'>{{ item.date }}</span>
                      <div class='cv-award-copy'>
                        <h4 class='cv-award-role' v-html='formatWithEmphasis(item.role)'></h4>
                        <p
                          v-if='item.organization'
                          class='cv-award-organization'
                          v-html='formatWithEmphasis(item.organization)'
                        ></p>
                        <div v-if='item.artifacts?.length' class='cv-artifacts'>
                          <a
                            v-for='artifact in item.artifacts'
                            :key='`${getItemKey(section.title, item)}-${artifact.path}`'
                            class='cv-artifact-link'
                            :href='artifactHref(artifact)'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <i class='fa fa-file-pdf-o' aria-hidden='true'></i>
                            <span>{{ artifact.label }}</span>
                          </a>
                        </div>
                      </div>
                      <span v-if='item.location' class='cv-award-location'>{{ item.location }}</span>
                    </article>
                  </div>
                </section>
              </div>

              <div v-else class='cv-timeline'>
                <article
                  v-for='item in section.items'
                  :key='getItemKey(section.title, item)'
                  class='cv-item'
                  :class='{ "cv-item--priority": isPriorityItem(item) }'
                >
                  <div class='cv-item-meta'>
                    <p
                      v-if='item.organization'
                      class='cv-item-organization'
                      v-html='formatWithEmphasis(item.organization)'
                    ></p>
                    <span v-if='item.location' class='cv-item-location'>{{ item.location }}</span>
                  </div>

                  <div class='cv-item-head'>
                    <h3 class='cv-role' v-html='formatWithEmphasis(item.role)'></h3>
                    <span
                      v-if='item.date'
                      class='cv-date'
                      :class='{ "cv-date--current": isCurrentItem(item.date) }'
                    >
                      {{ item.date }}
                    </span>
                  </div>

                  <ul v-if='item.details?.length' class='cv-details'>
                    <li
                      v-for='(detail, detailIndex) in item.details'
                      :key='getDetailKey(item, detail, detailIndex)'
                    >
                      <template v-if='isLinkDetail(detail)'>
                        <span
                          v-if='detail.prefix'
                          class='cv-detail-prefix'
                          v-html='formatWithEmphasis(detail.prefix)'
                        ></span>
                        <router-link
                          v-if='detail.internal'
                          :to='detail.url'
                          v-html='formatWithEmphasis(detail.text)'
                        ></router-link>
                        <a
                          v-else
                          :href='detail.url'
                          target='_blank'
                          rel='noopener noreferrer'
                          v-html='formatWithEmphasis(detail.text)'
                        ></a>
                      </template>
                      <template v-else>
                        <span v-html='formatWithEmphasis(detail)'></span>
                      </template>
                    </li>
                  </ul>
                  <div v-if='item.artifacts?.length' class='cv-artifacts'>
                    <a
                      v-for='artifact in item.artifacts'
                      :key='`${getItemKey(section.title, item)}-${artifact.path}`'
                      class='cv-artifact-link'
                      :href='artifactHref(artifact)'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <i class='fa fa-file-pdf-o' aria-hidden='true'></i>
                      <span>{{ artifact.label }}</span>
                    </a>
                  </div>
                </article>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router';
import {
  cvProfile,
  cvSections,
  type CvArtifact,
  type CvDetail,
  type CvItem,
  type CvSection,
} from '../data/cvData';
import WorkToc, { type TocEntry as WorkTocEntry } from './WorkToc.vue';
import { resolvePublicAssetPath } from '../utils/publicAssetPath';

type CvLinkDetail = Exclude<CvDetail, string>;

interface GroupedCvItems {
  title: string | null;
  items: CvItem[];
}

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
  /Bioinformatics/gi,
];

export default defineComponent({
  name: 'CurrentCv',
  components: {
    RouterLink,
    WorkToc,
  },
  data() {
    return {
      cvProfile,
      cvSections,
    };
  },
  computed: {
    tocEntries(): WorkTocEntry[] {
      return [
        { id: 'cv-overview', label: 'Overview', level: 1 },
        { id: 'cv-focus', label: 'Core Areas', level: 2 },
        { id: 'cv-sections', label: 'Sections', level: 1 },
        ...this.cvSections.map((section) => ({
          id: this.sectionId(section.title),
          label: section.title,
          level: 2,
        })),
      ];
    },
  },
  methods: {
    sectionId(title: string): string {
      return `cv-section-${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')}`;
    },
    getItemKey(sectionTitle: string, item: CvItem): string {
      return `${sectionTitle}-${item.role}-${item.date ?? 'undated'}-${item.organization ?? 'no-org'}`;
    },
    getDetailKey(item: CvItem, detail: CvDetail, detailIndex: number): string {
      const normalizedDetail =
        typeof detail === 'string' ? detail : `${detail.prefix ?? ''}${detail.text}`;
      return `${item.role}-${detailIndex}-${normalizedDetail}`;
    },
    isLinkDetail(detail: CvDetail): detail is CvLinkDetail {
      return typeof detail === 'object';
    },
    isCurrentItem(date: string): boolean {
      return /present/i.test(date);
    },
    isPriorityItem(item: CvItem): boolean {
      return this.isCurrentItem(item.date ?? '') || /(Ph\.D|Doctor|Master|Adjunct Professor)/i.test(item.role);
    },
    primaryDetailText(item: CvItem): string {
      const firstDetail = item.details?.[0];
      if (!firstDetail) {
        return '';
      }
      if (typeof firstDetail === 'string') {
        return firstDetail;
      }
      return `${firstDetail.prefix ? `${firstDetail.prefix} ` : ''}${firstDetail.text}`.trim();
    },
    groupedItems(section: CvSection): GroupedCvItems[] {
      const orderedGroups: GroupedCvItems[] = [];
      const seen = new Map<string, GroupedCvItems>();

      section.items.forEach((item) => {
        const key = item.group ?? '__default__';
        const title = item.group ?? null;
        if (!seen.has(key)) {
          const group = { title, items: [] as CvItem[] };
          seen.set(key, group);
          orderedGroups.push(group);
        }
        seen.get(key)?.items.push(item);
      });

      return orderedGroups;
    },
    artifactHref(artifact: CvArtifact): string {
      return resolvePublicAssetPath(artifact.path);
    },
    escapeHtml(input: string): string {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    formatWithEmphasis(text: string): string {
      let safeText = this.escapeHtml(text);
      EMPHASIS_PATTERNS.forEach((pattern) => {
        safeText = safeText.replace(pattern, '<span class="auto-emphasis">$&</span>');
      });
      return safeText;
    },
  },
});
</script>

<style scoped>
#cv {
  --work-content-max: 1560px;
  --cv-ink: var(--page-text);
  --cv-muted: var(--text-muted);
  --cv-soft: var(--text-soft);
  --cv-surface: var(--surface-bg);
  --cv-surface-alt: var(--surface-card);
  --cv-surface-strong: var(--surface-elevated);
  --cv-border: rgba(255, 255, 255, 0.08);
  --cv-border-strong: var(--surface-outline);

  padding: 0 16px 140px;
}

[data-theme='dark'] #cv {
  --cv-ink: #f8fbff;
  --cv-muted: #e5edf7;
  --cv-soft: #c8d5e6;
  --cv-surface: rgba(10, 14, 20, 0.98);
  --cv-surface-alt: rgba(18, 24, 32, 0.96);
  --cv-surface-strong: rgba(14, 18, 25, 0.98);
  --cv-border: rgba(226, 232, 240, 0.14);
  --cv-border-strong: rgba(226, 232, 240, 0.16);
}

.work-layout {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.work-main {
  min-width: 0;
  display: grid;
  gap: 16px;
}

.work-section {
  min-width: 0;
}

.work-section-block {
  max-width: var(--work-content-max);
  width: 100%;
  margin: 0 auto;
  background: var(--cv-surface-strong);
  border: 1px solid var(--cv-border-strong);
  border-radius: 18px;
  padding: 20px;
  display: grid;
  gap: 18px;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18);
}

[data-theme='light'] .work-section-block {
  background: linear-gradient(180deg, rgba(var(--accent-secondary-rgb), 0.46), rgba(var(--accent-rgb), 0.14));
  border-color: rgba(16, 36, 59, 0.12);
}

.cv-header {
  max-width: var(--work-content-max);
  width: 100%;
  margin: 0 auto;
  background: var(--cv-surface);
  border: 1px solid var(--cv-border-strong);
  border-radius: 18px;
  padding: 20px 22px;
  display: grid;
  gap: 16px;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.16);
}

.cv-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.cv-identity {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.cv-kicker {
  margin: 0;
  color: var(--cv-soft);
  font-size: var(--font-size-micro);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
}

.cv-header h1 {
  margin: 0;
  color: var(--cv-ink);
  font-family: var(--content-heading-font);
  font-size: clamp(2.2rem, 3.1vw, 3rem);
  line-height: 1.02;
  font-weight: 650;
}

.cv-headline {
  margin: 0;
  color: var(--cv-muted);
  font-size: var(--font-size-body-lg);
  line-height: 1.45;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.cv-address {
  margin: 4px 0 0;
  max-width: 26ch;
  color: var(--cv-soft);
  font-size: var(--font-size-body);
  line-height: 1.5;
  text-align: right;
}

.cv-contact-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cv-contact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--cv-border-strong);
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--link-color);
  text-decoration: none;
  font-size: var(--font-size-body-sm);
  line-height: 1.2;
  transition: background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
}

.cv-contact-link:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.4);
  transform: translateY(-1px);
}

.cv-focus {
  display: grid;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--cv-border-strong);
}

.cv-focus-label {
  color: var(--cv-soft);
  font-size: var(--font-size-label);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cv-focus-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cv-focus-tag {
  border: 1px solid var(--cv-border-strong);
  border-radius: 999px;
  padding: 4px 11px;
  font-size: var(--font-size-body-sm);
  color: var(--cv-ink);
  line-height: 1.2;
  background: rgba(var(--accent-secondary-rgb), 0.14);
}

[data-theme='dark'] .cv-focus-tag {
  background: rgba(var(--accent-secondary-rgb), 0.3);
  border-color: rgba(var(--accent-secondary-rgb), 0.68);
  color: #effff9;
}

.cv-section-card {
  background: var(--cv-surface);
  border: 1px solid var(--cv-border);
  border-radius: 16px;
  padding: 18px;
  display: grid;
  gap: 16px;
}

.cv-section-heading {
  border-bottom: 1px solid var(--cv-border-strong);
  padding-bottom: 10px;
}

.cv-section-heading h2 {
  margin: 0;
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  color: var(--cv-ink);
}

.cv-timeline {
  display: grid;
  gap: 14px;
}

.cv-item {
  padding: 15px 16px 16px;
  border-radius: 14px;
  border: 1px solid var(--cv-border);
  border-left: 3px solid rgba(var(--accent-rgb), 0.38);
  background: var(--cv-surface-alt);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.cv-item--priority {
  border-left-color: rgba(var(--accent-secondary-rgb), 0.85);
  box-shadow: inset 0 0 0 1px rgba(var(--accent-secondary-rgb), 0.22);
}

[data-theme='light'] .cv-item {
  background: rgba(16, 36, 59, 0.045);
  border-color: rgba(16, 36, 59, 0.08);
  border-left-color: rgba(var(--accent-ink-rgb), 0.45);
}

[data-theme='dark'] .cv-item {
  border-color: rgba(226, 232, 240, 0.12);
  border-left-color: rgba(147, 197, 253, 0.42);
}

.cv-item-meta,
.cv-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cv-item-meta {
  margin-bottom: 4px;
}

.cv-item-organization {
  margin: 0;
  color: var(--cv-muted);
  font-size: var(--font-size-body);
  line-height: 1.45;
  font-weight: 600;
}

.cv-item-location {
  color: var(--cv-soft);
  font-size: var(--font-size-body-sm);
  line-height: 1.4;
  text-align: right;
  white-space: nowrap;
}

.cv-role {
  margin: 0;
  color: var(--cv-ink);
  font-size: var(--font-size-body-xl);
  line-height: 1.32;
}

.cv-date {
  color: var(--cv-ink);
  white-space: nowrap;
  border: 1px solid var(--cv-border-strong);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
  padding: 4px 10px;
  font-weight: 650;
  font-size: var(--font-size-label);
}

.cv-date--current {
  border-color: rgba(var(--accent-secondary-rgb), 0.76);
  background: rgba(var(--accent-secondary-rgb), 0.18);
}

[data-theme='dark'] .cv-date {
  background: rgba(255, 255, 255, 0.06);
}

.cv-details {
  margin: 12px 0 0;
  padding-left: 20px;
}

.cv-details li {
  color: var(--cv-muted);
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: var(--font-size-body);
}

.cv-details li:last-child {
  margin-bottom: 0;
}

.cv-detail-prefix {
  margin-right: 0.35em;
}

.cv-details a {
  color: var(--link-color);
  text-decoration: underline;
}

.cv-artifacts {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cv-artifact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--cv-border-strong);
  border-radius: 999px;
  padding: 7px 12px;
  background: rgba(var(--accent-rgb), 0.08);
  color: var(--link-color);
  text-decoration: none;
  font-size: var(--font-size-body-sm);
  line-height: 1.2;
  transition: background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
}

.cv-artifact-link:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.4);
  transform: translateY(-1px);
}

.cv-award-artifact-stack {
  display: grid;
  gap: 8px;
}

.cv-skill-list {
  display: grid;
  gap: 10px;
}

.cv-skill-row {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--cv-border);
  background: var(--cv-surface-alt);
}

.cv-skill-label {
  color: var(--cv-ink);
  font-size: var(--font-size-body);
  font-weight: 650;
  line-height: 1.4;
}

.cv-skill-value {
  color: var(--cv-muted);
  font-size: var(--font-size-body);
  line-height: 1.55;
}

.cv-award-groups {
  display: grid;
  gap: 16px;
}

.cv-award-group {
  display: grid;
  gap: 10px;
}

.cv-subheading {
  margin: 0;
  color: var(--cv-soft);
  font-size: var(--font-size-label);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cv-award-list {
  display: grid;
  gap: 10px;
}

.cv-award-item {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--cv-border);
  background: var(--cv-surface-alt);
}

.cv-award-date {
  color: var(--cv-soft);
  font-size: var(--font-size-body-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.cv-award-copy {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.cv-award-role {
  margin: 0;
  color: var(--cv-ink);
  font-size: var(--font-size-body);
  line-height: 1.45;
}

.cv-award-organization {
  margin: 4px 0 0;
  color: var(--cv-muted);
  font-size: var(--font-size-body-sm);
  line-height: 1.45;
}

.cv-award-location {
  color: var(--cv-soft);
  font-size: var(--font-size-body-sm);
  line-height: 1.45;
  text-align: right;
  white-space: nowrap;
}

:deep(.auto-emphasis) {
  font-weight: 700;
  color: var(--cv-ink);
  background: rgba(250, 204, 21, 0.2);
  border-radius: 4px;
  padding: 0 4px;
}

[data-theme='light'] :deep(.auto-emphasis) {
  background: rgba(var(--accent-ink-rgb), 0.18);
}

@media (max-width: 1080px) {
  .work-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 900px) {
  .cv-header-top,
  .cv-item-meta,
  .cv-item-head,
  .cv-award-item {
    grid-template-columns: minmax(0, 1fr);
    display: grid;
  }

  .cv-address,
  .cv-item-location,
  .cv-award-location {
    text-align: left;
    white-space: normal;
  }

  .cv-skill-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  #cv {
    padding: 0 10px 132px;
  }

  .work-main {
    gap: 14px;
  }

  .cv-header,
  .work-section-block,
  .cv-section-card {
    padding: 14px;
  }

  .cv-header h1 {
    font-size: clamp(1.85rem, 8vw, 2.5rem);
  }

  .cv-headline {
    font-size: var(--font-size-body);
  }

  .cv-contact-list {
    flex-direction: column;
  }

  .cv-contact-link {
    width: 100%;
    justify-content: flex-start;
  }

  .cv-role {
    font-size: var(--font-size-body-lg);
  }
}
</style>
