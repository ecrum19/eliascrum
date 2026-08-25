<template>
  <footer id="myFooter">
    <div class="footer-inner">
      <div id="icons" class="w3-xlarge">
        <a href="https://github.com/ecrum19"><i class="fa fa-github w3-hover-opacity"></i></a>
        <a href="https://www.linkedin.com/in/elias-crum-413178142/"><i class="fa fa-linkedin w3-hover-opacity"></i></a>
      </div>
      <div class="footer-meta">
        <div id="runner">{{ new Date().getFullYear() }} — Elias D. Crum</div>
        <router-link class="footer-privacy-link" to="/privacy">Privacy &amp; Analytics</router-link>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
export default {
  data: () => ({}),
};
</script>

<style scoped>
#icons {
  display: flex;
  align-items: center;
  gap: 14px;
  background: transparent;
}

#icons a {
  color: var(--page-text);
  text-decoration: none;
}

#runner {
  font-size: var(--font-size-body);
  color: var(--page-text);
  opacity: 0.95;
}

.footer-privacy-link {
  color: var(--text-soft);
  font-size: var(--font-size-caption);
  letter-spacing: 0.04em;
  opacity: 0.82;
  text-decoration: none;
  transition: color 0.18s ease, opacity 0.18s ease;
}

.footer-privacy-link:hover {
  color: var(--link-color);
  opacity: 1;
  text-decoration: underline;
}

#myFooter {
  width: 100%;
  background: var(--footer-bg);
  color: var(--page-text);
  border-top: 1px solid var(--surface-outline);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  padding: 14px 16px;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.footer-meta {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    gap: 8px;
  }

  .footer-meta {
    justify-content: center;
    gap: 5px 10px;
  }

  #runner {
    font-size: var(--font-size-meta);
  }
}
</style>
