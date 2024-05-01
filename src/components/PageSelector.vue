<template>
  <v-card>
    <nav>
      <v-tabs
        class="theNav"
        v-model="tab"
        align-tabs="center"
        color="red-accent-4"
        fixed-tabs
      >
        <v-tab v-for="tabName in items" :key="tabName">
          <router-link :to="{ name: tabName }">{{ tabName }}</router-link>
        </v-tab>
      </v-tabs>
    </nav>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    tab: null,
    items: ["About Me", "Publications", "Blogs"],
  }),
};
</script>

<style scoped>
a.router-link-active,
a:not(.router-link-active) {
  text-decoration: none;
}

.theNav {
  color: white !important;
}
</style>
