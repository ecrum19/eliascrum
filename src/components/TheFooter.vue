<template>
  <!-- Footer -->
  <footer
    class="w3-center w3-black w3-padding-64 w3-opacity"
    id="myFooter"
  >
    <div>{{ new Date().getFullYear() }} — <strong>Elias D. Crum</strong></div>
    
    <div class="w3-xlarge w3-section">
      <i class="fa fa-twitter w3-hover-opacity"></i>
      <i class="fa fa-github w3-hover-opacity"></i>
      <i class="fa fa-linkedin w3-hover-opacity"></i>
    </div>
  </footer>
</template>

<script lang="ts">
export default {
  data: () => ({
    icons: ["mdi-linkedin", "mdi-github"],
  }),
};
</script>

<style scoped>
#myFooter {
  position: absolute;
  bottom: 0px;
  margin-left: 45%;
}

</style>
