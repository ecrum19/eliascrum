<template>
  <v-card class="me" color="transparent">
    <header>
      <img src="./assets/headshot.jpeg" alt="personal picture" />
      <v-card-title justify="center">
        <h1>Elias Crum</h1>
      </v-card-title>
    </header>
  </v-card>
</template>

<script lang="ts">
export default {
  data: () => ({}),
};
</script>

<style scoped>
header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

header h1 {
  color: rgb(255, 255, 255);
  font-size: 50pt;
  font-weight: 400;
  margin: 0;
}

.me img {
  width: 75px; /* Adjust size as needed */
  height: 100px; /* Maintain aspect ratio */
  border-radius: 50%; /* Make the image round */
  border: 2px solid white; /* Add a white border */
  margin-right: 20px;
}
</style>
