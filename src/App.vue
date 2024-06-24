<template>
  <the-header />
  <page-selector />
  <main id="app">
    <router-view></router-view>
  </main>
  <div class="background">
    <video
      id="background-video"
      src="./assets/Abstract DNA Medical Animation.mp4"
      muted
      loop
      autoplay
    ></video>
  </div>
  <the-footer />
</template>

<script lang="ts">
import TheHeader from './components/TheHeader.vue';
import PageSelector from './components/PageSelector.vue';
import TheFooter from './components/TheFooter.vue';

export default {
  name: "App",
  components: {
    TheHeader,
    PageSelector,
    TheFooter,
  },
  mounted() {
    // this.$nextTick(() => {
    //   const video = document.getElementById('background-video') as HTMLVideoElement;
    //   video.playbackRate = 0.5; // 0.5 is half the normal speed
    // });
  },
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
