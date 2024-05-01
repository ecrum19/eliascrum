<template>
  <header>
    <router-view name="header"></router-view>
  </header>
  <nav>
    <router-view name="navBar"></router-view>
  </nav>
  <main id="app">
    <router-view></router-view>
  </main>
  <footer>
    <router-view name="footer"></router-view>
  </footer>
  <div class="background">
    <video
      src="./assets/Abstract DNA Medical Animation.mp4"
      muted
      loop
      autoplay
    ></video>
  </div>
</template>

<script lang="ts">
export default {
  name: "App",
  components: {},
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=KoHo:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");

* {
  font-family: "KoHo", sans-serif;
  background-color: black;
}

.background video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
}

body {
  color: white;
}
</style>
