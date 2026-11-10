<template>
  <section class="entry-filters">
    <button
      type="button"
      class="filter-toggle"
      :aria-expanded="open"
      @click="$emit('update:open', !open)"
    >
      <span class="filter-toggle-title">Filter and Sort</span
      ><span class="filter-toggle-state">{{ open ? "Hide" : "Show" }}</span>
    </button>
    <div v-show="open" class="filter-panel">
      <div class="filter-grid"><slot /></div>
      <div class="filter-footer">
        <p class="filter-result">{{ resultLabel }}</p>
        <button
          type="button"
          class="filter-clear-btn"
          :disabled="!active"
          @click="$emit('clear')"
        >
          Clear
        </button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
defineProps<{ open: boolean; active: boolean; resultLabel: string }>();
defineEmits<{ "update:open": [value: boolean]; clear: [] }>();
</script>
<style scoped>
.entry-filters {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--surface-outline);
}

[data-theme="light"] .entry-filters {
  border-top-color: rgba(16, 36, 59, 0.24);
}

.filter-toggle {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: var(--page-text);
  font: inherit;
  line-height: 1;
}

.filter-toggle-title {
  font-family: var(--content-heading-font);
  color: var(--text-muted);
  font-size: var(--font-size-label);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 1;
}

.filter-toggle-state {
  border: none;
  border-radius: 0;
  padding: 0;
  color: var(--text-soft);
  font-size: var(--font-size-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 1;
  background: transparent;
}

.filter-panel {
  margin-top: 12px;
}

.filter-grid {
  display: grid;
  /* Pages with a fixed number of filters can set --filter-columns. */
  grid-template-columns: var(--filter-columns, repeat(auto-fit, minmax(180px, 1fr)));
  gap: 7px;
}

.filter-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.filter-result {
  margin: 0;
  color: var(--text-soft);
  opacity: 1;
  font-size: var(--font-size-caption);
  letter-spacing: 0.03em;
}

.filter-clear-btn {
  border: 1px solid var(--surface-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--page-text);
  padding: 4px 11px;
  font-size: var(--font-size-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    opacity 0.16s ease;
}

.filter-clear-btn:hover:not(:disabled) {
  background: var(--nav-hover-bg);
}

.filter-clear-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
</style>
