<template>
  <footer id="myFooter">
    <div class="footer-inner">
      <div id="icons" class="w3-xlarge">
        <a href="https://github.com/ecrum19"><i class="fa fa-github w3-hover-opacity"></i></a>
        <a href="https://www.linkedin.com/in/elias-crum-413178142/"><i class="fa fa-linkedin w3-hover-opacity"></i></a>
      </div>
      <div id="runner">{{ new Date().getFullYear() }} — Elias D. Crum</div>
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
  font-size: 1rem;
  color: var(--page-text);
  opacity: 0.95;
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
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    gap: 8px;
  }

  #runner {
    font-size: 14px;
  }
}
</style>
