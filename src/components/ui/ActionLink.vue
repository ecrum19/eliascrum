<template>
  <router-link
    v-if="to"
    :to="to"
    :class="[`action-link-${shape}`, `btn-${intent}`]"
    ><slot
  /></router-link>
  <a
    v-else
    :href="normalizeLinkUrl(href)"
    :target="linkTarget(href)"
    :rel="linkRel(href)"
    :class="[`action-link-${shape}`, `btn-${intent}`]"
    ><slot
  /></a>
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import { normalizeLinkUrl, linkTarget, linkRel } from "../../utils/links";
withDefaults(
  defineProps<{
    to?: RouteLocationRaw;
    href?: string;
    shape?: "card" | "pill";
    intent?: "detail" | "back" | "external" | "pdf";
  }>(),
  { href: "", shape: "card", intent: "external" },
);
</script>
<style scoped>
.action-link-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--page-text);
  border: 1px solid var(--surface-outline);
  background: rgba(148, 163, 184, 0.07);
  border-radius: 10px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: var(--font-size-body);
  min-width: 0;
  line-height: 1.2;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.16s ease,
    box-shadow 0.2s ease;
}

.action-link-card:hover {
  background: var(--nav-hover-bg);
  border-color: rgba(var(--accent-rgb), 0.45);
  box-shadow: 0 4px 12px rgba(8, 15, 31, 0.12);
  transform: translateY(-1px);
}

.action-link-card:focus-visible {
  outline: none;
  border-color: rgba(var(--accent-rgb), 0.78);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.24);
}

[data-theme="light"] .action-link-card {
  background: rgba(16, 36, 59, 0.04);
}

.action-link-pill {
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
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
}

.action-link-pill:hover {
  background: var(--nav-hover-bg);
}

@media (max-width: 768px) {
  .action-link-card {
    width: 100%;
  }
}
@media (max-width: 780px) {
  .action-link-pill {
    width: 100%;
  }
}
</style>
