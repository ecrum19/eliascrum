<template>
  <v-container>
    <v-col cols="12">
      <v-card
        variant="tonal"
        justify="center"
        max-width="550"
        class="mx-auto"
        color="indigo-darken-3"
      >
      </v-card>
      <router-view />
    </v-col>
  </v-container>
</template>

<script>
export default {
  data: () => ({}),
  methods: {},
};
</script>
