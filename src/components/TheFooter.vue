<template>
  <v-footer class="text-center d-flex flex-column">
    <div>
      <v-btn icon="mdi-linkedin" class="mx-4"> </v-btn>
    </div>

    <v-divider></v-divider>

    <div>{{ new Date().getFullYear() }} — <strong>Elias D. Crum</strong></div>
  </v-footer>
</template>

<script lang="ts">
export default {
  data: () => ({
    icons: ["mdi-linkedin", "mdi-github"],
  }),
};
</script>

<style scoped></style>
