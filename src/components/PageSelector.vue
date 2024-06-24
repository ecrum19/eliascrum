<template>
  <v-card>
    <nav>
      <v-tabs
        v-model="tab"
        align-tabs="center"
        color="red-accent-4"
        bg-color="#9fbbdf"
        fixed-tabs
      >
        <v-tab
          border="sm"
          v-for="tabName in items"
          :key="tabName"
          :to="{ name: tabName }"
        >{{ tabName }}
        </v-tab>
      </v-tabs>
    </nav>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    tab: null,
    items: ["About Me", "My Work", "Blogs"],
  }),
};
</script>

<style scoped>
a.router-link-active,
a:not(.router-link-active) {
  text-decoration: none;
}

.v-tab {
  color: #9fbbdf !important;
}

</style>
