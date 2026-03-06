<template>
  <transition name="spotlight-fade">
    <div
      v-if="open"
      class="spotlight-overlay"
      @mousedown.self="closeOverlay"
      @keydown.esc.prevent="closeOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search site data"
    >
      <div class="spotlight-panel">
        <div class="spotlight-input-row">
          <i class="fa fa-search spotlight-icon" aria-hidden="true"></i>
          <input
            ref="queryInputRef"
            v-model="query"
            type="text"
            class="spotlight-input"
            placeholder="Search talks, publications, CV, blogs, and updates..."
            autocomplete="off"
            @keydown.enter.prevent="handleEnter"
          />
          <button type="button" class="spotlight-close" @click="closeOverlay" aria-label="Close search">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <div class="spotlight-mode-switch">
          <button
            type="button"
            class="spotlight-mode-btn"
            :class="{ active: activeMode === 'keyword' }"
            @click="setMode('keyword')"
          >
            Keyword
          </button>
          <button
            type="button"
            class="spotlight-mode-btn"
            :class="{ active: activeMode === 'sparql' }"
            @click="setMode('sparql')"
          >
            SPARQL (Comunica)
          </button>
        </div>

        <div v-if="activeMode === 'sparql'" class="spotlight-sparql-shell">
          <textarea
            v-model="sparqlQuery"
            class="spotlight-sparql-query"
            spellcheck="false"
            placeholder="SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 20"
          ></textarea>
          <button
            type="button"
            class="spotlight-run-query"
            @click="executeSparqlQuery"
            :disabled="sparqlLoading"
          >
            {{ sparqlLoading ? "Running..." : "Run SPARQL Query" }}
          </button>
        </div>

        <div class="spotlight-results" :class="{ compact: activeMode === 'sparql' }">
          <p v-if="activeMode === 'keyword'" class="spotlight-hint">
            Press <kbd>Enter</kbd> to open the top result.
          </p>

          <p v-if="sparqlNotice" class="spotlight-notice">
            {{ sparqlNotice }}
          </p>

          <div v-if="displayResults.length === 0" class="spotlight-empty">
            <span v-if="activeMode === 'keyword'">No matches yet. Try a different keyword.</span>
            <span v-else>Run a SPARQL query to inspect the RDF graph.</span>
          </div>

          <button
            v-for="result in displayResults"
            :key="result.id"
            type="button"
            class="spotlight-result"
            @click="openResult(result)"
          >
            <span class="spotlight-result-top">
              <span class="spotlight-result-title">{{ result.title }}</span>
              <span class="spotlight-result-type">{{ result.type }}</span>
            </span>
            <span class="spotlight-result-subtitle">{{ result.subtitle }}</span>
            <span class="spotlight-result-snippet">{{ result.snippet }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, watch } from "vue";
import { type PropType } from "vue";
import { useRouter } from "vue-router";
import {
  getDefaultSearchResults,
  runSparqlSearch,
  searchByKeyword,
  type SearchMode,
  type SearchResult,
} from "../utils/siteSearch";

export default defineComponent({
  name: "SpotlightSearch",
  props: {
    open: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const router = useRouter();
    const queryInputRef = ref<HTMLInputElement | null>(null);
    const query = ref("");
    const sparqlQuery = ref("SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 20");
    const activeMode = ref<SearchMode>("keyword");
    const displayResults = ref<SearchResult[]>(getDefaultSearchResults(10));
    const sparqlLoading = ref(false);
    const sparqlNotice = ref("");

    function closeOverlay() {
      emit("close");
    }

    function resetKeywordResults() {
      displayResults.value = query.value.trim()
        ? searchByKeyword(query.value, 16)
        : getDefaultSearchResults(10);
    }

    function setMode(mode: SearchMode) {
      activeMode.value = mode;
      sparqlNotice.value = "";
      if (mode === "keyword") {
        resetKeywordResults();
      } else {
        displayResults.value = [];
      }
    }

    async function executeSparqlQuery() {
      if (sparqlLoading.value) {
        return;
      }

      sparqlLoading.value = true;
      sparqlNotice.value = "";
      try {
        const response = await runSparqlSearch(sparqlQuery.value, 30);
        displayResults.value = response.results;
        sparqlNotice.value = response.error
          ? `${response.notice || ""}${response.notice ? " " : ""}(Runtime note: ${response.error})`
          : response.notice || "";
      } finally {
        sparqlLoading.value = false;
      }
    }

    async function openResult(result: SearchResult) {
      if (result.route) {
        await router.push(result.route);
      } else if (result.href) {
        window.open(result.href, "_blank", "noopener,noreferrer");
      }
      closeOverlay();
    }

    async function handleEnter() {
      const firstResult = displayResults.value[0];
      if (firstResult) {
        await openResult(firstResult);
      }
    }

    watch(
      () => query.value,
      () => {
        if (activeMode.value === "keyword") {
          resetKeywordResults();
        }
      },
    );

    watch(
      () => props.open,
      async (isOpen) => {
        if (isOpen) {
          document.body.classList.add("spotlight-open");
          query.value = "";
          sparqlNotice.value = "";
          activeMode.value = "keyword";
          displayResults.value = getDefaultSearchResults(10);
          await nextTick();
          queryInputRef.value?.focus();
          queryInputRef.value?.select();
          return;
        }

        document.body.classList.remove("spotlight-open");
      },
      { immediate: true },
    );

    return {
      query,
      queryInputRef,
      sparqlQuery,
      activeMode,
      displayResults,
      sparqlLoading,
      sparqlNotice,
      closeOverlay,
      setMode,
      executeSparqlQuery,
      openResult,
      handleEnter,
    };
  },
});
</script>

<style scoped>
.spotlight-overlay {
  position: fixed;
  inset: 0;
  z-index: 2400;
  background: rgba(4, 11, 20, 0.35);
  backdrop-filter: blur(15px) saturate(130%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.spotlight-panel {
  width: min(940px, 92vw);
  max-height: min(82vh, 760px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid var(--surface-outline);
  background: color-mix(in srgb, var(--surface-bg) 95%, transparent);
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.35);
}

.spotlight-input-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  border: 1px solid var(--surface-outline);
  padding: 10px 12px;
  background: color-mix(in srgb, var(--surface-bg) 88%, transparent);
}

.spotlight-icon {
  font-size: var(--font-size-body-lg);
  opacity: 0.82;
}

.spotlight-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: var(--font-size-body-lg);
  color: var(--page-text);
  background: transparent;
}

.spotlight-input::placeholder {
  color: color-mix(in srgb, var(--page-text) 60%, transparent);
}

.spotlight-close {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--page-text);
  cursor: pointer;
  transition: background-color 0.16s ease;
}

.spotlight-close:hover {
  background: var(--nav-hover-bg);
}

.spotlight-mode-switch {
  display: inline-flex;
  align-self: flex-start;
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  padding: 3px;
  gap: 4px;
  background: color-mix(in srgb, var(--surface-bg) 86%, transparent);
}

.spotlight-mode-btn {
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  padding: 7px 12px;
  font-size: var(--font-size-meta);
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background-color 0.16s ease, transform 0.16s ease;
}

.spotlight-mode-btn.active {
  background: var(--nav-hover-bg);
}

.spotlight-mode-btn:hover {
  transform: translateY(-1px);
}

.spotlight-sparql-shell {
  display: grid;
  gap: 10px;
}

.spotlight-sparql-query {
  width: 100%;
  min-height: 120px;
  max-height: 220px;
  resize: vertical;
  border-radius: 12px;
  border: 1px solid var(--surface-outline);
  background: color-mix(in srgb, var(--surface-bg) 88%, transparent);
  color: var(--page-text);
  padding: 10px 12px;
  font-size: var(--font-size-body-sm);
  line-height: 1.38;
  outline: none;
}

.spotlight-run-query {
  justify-self: flex-start;
  border: none;
  border-radius: 999px;
  background: var(--nav-hover-bg);
  color: var(--page-text);
  padding: 8px 14px;
  font-size: var(--font-size-meta);
  cursor: pointer;
}

.spotlight-run-query:disabled {
  opacity: 0.6;
  cursor: wait;
}

.spotlight-results {
  overflow: auto;
  display: grid;
  gap: 8px;
  padding-right: 4px;
}

.spotlight-results.compact {
  min-height: 180px;
}

.spotlight-hint,
.spotlight-notice,
.spotlight-empty {
  margin: 0;
  font-size: var(--font-size-meta);
  opacity: 0.84;
}

.spotlight-notice {
  opacity: 0.92;
}

.spotlight-result {
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 9px 11px;
  background: color-mix(in srgb, var(--surface-bg) 80%, transparent);
  color: var(--page-text);
  cursor: pointer;
  display: grid;
  gap: 2px;
  transition: border-color 0.16s ease, transform 0.16s ease, background-color 0.16s ease;
}

.spotlight-result:hover {
  border-color: var(--surface-outline);
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--surface-bg) 72%, transparent);
}

.spotlight-result-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.spotlight-result-title {
  font-weight: 600;
  font-size: var(--font-size-body-sm);
}

.spotlight-result-type {
  font-size: var(--font-size-micro);
  opacity: 0.74;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.spotlight-result-subtitle {
  font-size: var(--font-size-label);
  opacity: 0.8;
}

.spotlight-result-snippet {
  font-size: var(--font-size-meta);
  line-height: 1.35;
  opacity: 0.9;
}

.spotlight-fade-enter-active,
.spotlight-fade-leave-active {
  transition: opacity 0.15s ease;
}

.spotlight-fade-enter-active .spotlight-panel,
.spotlight-fade-leave-active .spotlight-panel {
  transition: transform 0.17s ease, opacity 0.17s ease;
}

.spotlight-fade-enter-from,
.spotlight-fade-leave-to {
  opacity: 0;
}

.spotlight-fade-enter-from .spotlight-panel,
.spotlight-fade-leave-to .spotlight-panel {
  transform: translateY(12px) scale(0.972);
  opacity: 0.88;
}

:global(body.spotlight-open) {
  overflow: hidden;
}

[data-theme="light"] .spotlight-overlay {
  background: rgba(16, 36, 59, 0.16);
}

[data-theme="light"] .spotlight-panel {
  background: color-mix(in srgb, #f7fbff 94%, transparent);
}

kbd {
  background: var(--nav-hover-bg);
  border-radius: 6px;
  padding: 2px 5px;
  font-size: var(--font-size-micro);
}

@media (max-width: 768px) {
  .spotlight-overlay {
    padding: 10px;
    align-items: flex-start;
    padding-top: 70px;
  }

  .spotlight-panel {
    width: min(980px, 100%);
    max-height: 84vh;
    border-radius: 14px;
    padding: 12px;
  }

  .spotlight-input {
    font-size: var(--font-size-body);
  }

  .spotlight-sparql-query {
    min-height: 96px;
  }
}
</style>
