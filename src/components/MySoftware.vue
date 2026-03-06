<template>
  <section id="software-page" class="w3-content w3-margin-top" style="max-width: min(1920px, 97vw)">
    <div class="work-layout">
      <work-toc :entries="tocEntries" />

      <div class="work-main">
        <section id="software-overview" class="work-section">
          <header class="software-header">
            <h1>Software</h1>
            <p>Tools, web pages, and software resources that support this research workflow.</p>
          </header>
        </section>

        <section id="software-content" class="work-section">
          <div class="work-section-block">
            <header class="work-section-header">
              <h2>Projects</h2>
              <p>Organized list of software artifacts with tags and direct links.</p>
            </header>

            <div class="software-list">
              <article
                v-for="project in softwareEntries"
                :id="softwareSectionId(project.id)"
                :key="project.id"
                class="software-card"
              >
                <div class="software-title-row">
                  <h3 class="software-title">
                    <a :href="project.url" target="_blank" rel="noopener noreferrer">{{ project.title }}</a>
                  </h3>
                  <span class="software-year">{{ project.year }}</span>
                </div>

                <p class="software-kind">{{ project.kind }}</p>
                <p class="software-summary">{{ project.summary }}</p>

                <div class="software-tags">
                  <span
                    v-for="tag in project.tags"
                    :key="`${project.id}-${tag}`"
                    class="software-tag"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="software-links">
                  <a :href="project.url" target="_blank" rel="noopener noreferrer" class="software-action-btn primary">
                    Open Project
                  </a>
                  <a
                    v-if="project.repositoryUrl"
                    :href="project.repositoryUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="software-action-btn"
                  >
                    Repository
                  </a>
                  <a
                    v-if="project.demoUrl"
                    :href="project.demoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="software-action-btn"
                  >
                    Demo
                  </a>
                </div>
              </article>

              <article v-if="softwareEntries.length === 0" class="software-card empty-state">
                <h3>No Software Entries Yet</h3>
                <p>Add entries in <code>src/data/softwareData.ts</code> to populate this section.</p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WorkToc from "./WorkToc.vue";
import { softwareProjects, type SoftwareEntry } from "../data/softwareData";

interface WorkTocEntry {
  id: string;
  label: string;
}

export default defineComponent({
  name: "MySoftware",
  components: {
    WorkToc,
  },
  data() {
    return {
      softwareProjects,
    };
  },
  computed: {
    softwareEntries(): SoftwareEntry[] {
      return this.softwareProjects;
    },
    tocEntries(): WorkTocEntry[] {
      const projectEntries = this.softwareEntries.map((project) => ({
        id: this.softwareSectionId(project.id),
        label: project.title,
      }));

      return [
        { id: "software-overview", label: "Overview" },
        { id: "software-content", label: "Projects" },
        ...projectEntries,
      ];
    },
  },
  methods: {
    softwareSectionId(projectId: string): string {
      return `software-${projectId}`;
    },
  },
});
</script>

<style scoped>
#software-page {
  padding: 0 12px 118px;
  font-size: var(--font-size-body-lg);
}

.work-layout {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.work-main {
  min-width: 0;
  display: grid;
  gap: 20px;
}

.work-section {
  min-width: 0;
  display: grid;
  gap: 12px;
  scroll-margin-top: 92px;
}

.software-header {
  width: 100%;
  margin: 0 auto;
  background: var(--surface-bg);
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 14px 16px;
  display: grid;
  gap: 10px;
}

.software-header h1 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h1-size);
  font-weight: 600;
}

.software-header p {
  margin: 0;
  color: var(--page-text);
  opacity: 0.88;
  font-size: var(--font-size-body-xl);
}

.work-section-block {
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(80, 203, 255, 0.08), rgba(45, 212, 191, 0.04));
  border: 1px solid var(--surface-outline);
  border-radius: 14px;
  padding: 16px 18px;
  display: grid;
  gap: 14px;
}

[data-theme="light"] .work-section-block {
  background: linear-gradient(180deg, rgba(80, 203, 255, 0.12), rgba(16, 36, 59, 0.05));
}

.work-section-header {
  margin: 0;
}

.work-section-header h2 {
  margin: 0;
  color: var(--page-text);
  font-family: var(--content-heading-font);
  font-size: var(--content-h2-size);
  font-weight: 600;
}

.work-section-header p {
  margin: 5px 0 0;
  color: var(--page-text);
  opacity: 0.8;
  font-size: var(--font-size-body);
}

.software-list {
  display: grid;
  gap: 16px;
}

.software-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--surface-outline);
  border-radius: 12px;
  padding: 12px 14px;
}

[data-theme="light"] .software-card {
  background: rgba(255, 255, 255, 0.52);
}

.software-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.software-title {
  margin: 0;
  font-size: var(--font-size-card-title);
  line-height: 1.35;
}

.software-title a {
  color: var(--link-color);
  text-decoration: none;
}

.software-title a:hover {
  text-decoration: underline;
}

.software-year {
  font-weight: 700;
  color: var(--page-text);
  opacity: 0.9;
}

.software-kind {
  margin: 6px 0 0;
  color: var(--page-text);
  opacity: 0.86;
  font-size: var(--font-size-meta);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.software-summary {
  margin: 6px 0 0;
  color: var(--page-text);
  line-height: 1.6;
  font-size: var(--font-size-body-lg);
}

.software-tags {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.software-tag {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: var(--font-size-body-sm);
  color: var(--page-text);
  background: rgba(80, 203, 255, 0.12);
}

[data-theme="dark"] .software-tag {
  border-color: rgba(80, 203, 255, 0.52);
  background: rgba(80, 203, 255, 0.22);
  color: #d7f5ff;
}

.software-links {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 10px;
}

.software-action-btn {
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

.software-action-btn.primary {
  border-color: rgba(80, 203, 255, 0.42);
  background: rgba(80, 203, 255, 0.08);
}

.software-action-btn:hover {
  background: var(--nav-hover-bg);
}

.empty-state h3 {
  margin-top: 0;
}

.empty-state p {
  margin: 8px 0 0;
}

@media (max-width: 1080px) {
  .work-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .work-main {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  #software-page {
    padding: 0 8px 118px;
  }

  .work-section-block {
    padding: 10px 11px;
    gap: 10px;
  }

  .software-header,
  .software-card {
    padding: 12px;
  }

  .software-action-btn {
    width: 100%;
  }
}
</style>
