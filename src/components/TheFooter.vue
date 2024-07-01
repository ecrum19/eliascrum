<template>
  <!-- Footer -->
  <footer
    class="w3-center w3-bottom w3-opacity"
    id="myFooter"
  >
  <div id="icons" class="w3-xlarge w3-bottom w3-section">
      <a href="https://github.com/ecrum19"><i class="fa fa-github w3-hover-opacity"></i></a>
      <a href="https://www.linkedin.com/in/elias-crum-413178142/"><i class="fa fa-linkedin w3-hover-opacity"></i></a>
    </div>
  <div>{{ new Date().getFullYear() }} — Elias D. Crum</div>
    
  </footer>
</template>

<script lang="ts">
export default {
  data: () => ({}),
};
</script>

<style scoped>

div {
  background: rgba(0, 0, 0, 0.2);
}

#icons a {
  position: relative;
  background: rgba(0, 0, 0, 0);
  margin-right: 10px;
  bottom: 25px;
}

#myFooter {
  
  position: absolute;
  bottom: 20px;
  width: 100%;
  background: rgba(0, 0, 0, 0);

}

</style>
