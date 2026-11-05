<template>
  <router-link
    v-if="to"
    :to="to"
    class="entry-tag entry-tag-link"
    :class="`entry-tag-${kind}`"
    :data-category="category"
    ><slot
  /></router-link>
  <button
    v-else
    type="button"
    class="entry-tag"
    :class="[`entry-tag-${kind}`, { 'entry-tag-active': active }]"
    :data-category="category"
    :aria-pressed="active"
  >
    <slot />
  </button>
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import type { TagColor } from "./tagColors";
defineProps<{
  kind: TagColor;
  category: string;
  active?: boolean;
  to?: RouteLocationRaw;
}>();
</script>
<style scoped>
.entry-tag {
  --tag-tooltip-bg: rgba(100, 116, 139, 0.96);
  --tag-tooltip-border: rgba(100, 116, 139, 0.98);
  --tag-tooltip-text: #f8fafc;

  border: 1px solid var(--tag-border, var(--surface-outline));
  background: var(--tag-bg, transparent);
  color: var(--tag-text, var(--page-text));
  border-radius: 999px;
  padding: 3px 10px;
  font-size: var(--list-tag-size);
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  line-height: 1.2;
  position: relative;
  z-index: 0;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

.entry-tag::after {
  content: attr(data-category);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translate(-50%, 4px);
  border: 1px solid var(--tag-tooltip-border);
  border-radius: 7px;
  padding: 3px 7px;
  background: var(--tag-tooltip-bg);
  color: var(--tag-tooltip-text);
  box-shadow: 0 8px 18px rgba(8, 15, 31, 0.24);
  font-size: var(--font-size-micro);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  z-index: 1001;
}

.entry-tag:hover {
  transform: translateY(-1px);
  z-index: 1000;
}

.entry-tag:hover::after,
.entry-tag:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.entry-tag:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.35);
  z-index: 1000;
}

.entry-tag-active {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
}

/* One colour per tag meaning, shared by every listing and detail page. */
.entry-tag-type {
  --tag-bg: rgba(245, 158, 11, 0.18);
  --tag-border: rgba(245, 158, 11, 0.44);
  --tag-text: #5f3a00;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.96);
  --tag-tooltip-border: rgba(161, 98, 7, 0.96);
  --tag-tooltip-text: #251401;
}

.entry-tag-purpose,
.entry-tag-duration {
  --tag-bg: rgba(168, 85, 247, 0.16);
  --tag-border: rgba(168, 85, 247, 0.44);
  --tag-text: #3d1362;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.96);
  --tag-tooltip-border: rgba(147, 51, 234, 0.96);
  --tag-tooltip-text: #12031f;
}

.entry-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.16);
  --tag-border: rgba(20, 184, 166, 0.44);
  --tag-text: #06453f;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.96);
  --tag-tooltip-border: rgba(13, 148, 136, 0.96);
  --tag-tooltip-text: #042320;
}

.entry-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.16);
  --tag-border: rgba(56, 189, 248, 0.44);
  --tag-text: #053a52;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.96);
  --tag-tooltip-border: rgba(2, 132, 199, 0.96);
  --tag-tooltip-text: #052634;
}

.entry-tag-size {
  --tag-bg: rgba(249, 115, 22, 0.16);
  --tag-border: rgba(249, 115, 22, 0.44);
  --tag-text: #6d2600;
  --tag-tooltip-bg: rgba(249, 115, 22, 0.96);
  --tag-tooltip-border: rgba(194, 65, 12, 0.96);
  --tag-tooltip-text: #2b0c01;
}

.entry-tag-audience {
  --tag-bg: rgba(100, 116, 139, 0.18);
  --tag-border: rgba(100, 116, 139, 0.44);
  --tag-text: #1f334f;
}

[data-theme="dark"] .entry-tag-type {
  --tag-bg: rgba(245, 158, 11, 0.28);
  --tag-border: rgba(245, 158, 11, 0.62);
  --tag-text: #ffe7a8;
  --tag-tooltip-bg: rgba(245, 158, 11, 0.98);
  --tag-tooltip-border: rgba(251, 191, 36, 0.98);
  --tag-tooltip-text: #1f1300;
}

[data-theme="dark"] .entry-tag-purpose,
[data-theme="dark"] .entry-tag-duration {
  --tag-bg: rgba(168, 85, 247, 0.26);
  --tag-border: rgba(168, 85, 247, 0.58);
  --tag-text: #ece4ff;
  --tag-tooltip-bg: rgba(168, 85, 247, 0.98);
  --tag-tooltip-border: rgba(192, 132, 252, 0.98);
  --tag-tooltip-text: #11021f;
}

[data-theme="dark"] .entry-tag-topic {
  --tag-bg: rgba(20, 184, 166, 0.26);
  --tag-border: rgba(20, 184, 166, 0.58);
  --tag-text: #d2fff4;
  --tag-tooltip-bg: rgba(20, 184, 166, 0.98);
  --tag-tooltip-border: rgba(var(--accent-secondary-rgb), 0.98);
  --tag-tooltip-text: #021413;
}

[data-theme="dark"] .entry-tag-venue {
  --tag-bg: rgba(56, 189, 248, 0.26);
  --tag-border: rgba(56, 189, 248, 0.6);
  --tag-text: #d3f4ff;
  --tag-tooltip-bg: rgba(56, 189, 248, 0.98);
  --tag-tooltip-border: rgba(125, 211, 252, 0.98);
  --tag-tooltip-text: #041b25;
}

[data-theme="dark"] .entry-tag-size {
  --tag-bg: rgba(249, 115, 22, 0.26);
  --tag-border: rgba(249, 115, 22, 0.6);
  --tag-text: #ffe0c2;
  --tag-tooltip-bg: rgba(249, 115, 22, 0.98);
  --tag-tooltip-border: rgba(251, 146, 60, 0.98);
  --tag-tooltip-text: #200700;
}

[data-theme="dark"] .entry-tag-audience {
  --tag-bg: rgba(100, 116, 139, 0.26);
  --tag-border: rgba(100, 116, 139, 0.6);
  --tag-text: #e4ebf4;
  --tag-tooltip-bg: rgba(100, 116, 139, 0.98);
  --tag-tooltip-border: rgba(148, 163, 184, 0.98);
}

.entry-tag-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: var(--font-size-body-sm);
}
</style>
