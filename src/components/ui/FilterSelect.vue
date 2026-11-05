<template>
  <label class="filter-control"
    >{{ label }}
    <select
      :value="modelValue"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
    >
      <option
        v-for="option in options"
        :key="typeof option === 'string' ? option : option.value"
        :value="typeof option === 'string' ? option : option.value"
      >
        {{ typeof option === "string" ? option : option.label }}
      </option>
    </select>
  </label>
</template>
<script setup lang="ts">
defineProps<{
  label: string;
  modelValue: string;
  options: readonly (string | { value: string; label: string })[];
}>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>
<style scoped>
.filter-control {
  display: grid;
  gap: 5px;
  min-width: 0;
  color: var(--text-muted);
  font-weight: 600;
  font-size: var(--font-size-caption);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 1;
}

.filter-control select {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 38px;
  border-radius: 999px;
  border: 1px solid var(--surface-outline);
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  background-size: 10px 6px;
  color: var(--page-text);
  padding: 7px 30px 7px 12px;
  font-size: var(--font-size-meta);
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.filter-control select:hover {
  border-color: rgba(var(--accent-rgb), 0.46);
  background-color: rgba(var(--accent-rgb), 0.06);
}

.filter-control select:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.72);
  box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.25);
}
</style>
