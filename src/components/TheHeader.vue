<template>
  <div class="w3-top" id="headerBar">
    <!-- Navbar -->
    <div class="w3-bar" id="myNavbar">
      <a
        class="w3-bar-item w3-button w3-hover-black w3-hide-medium w3-hide-large w3-right"
        href="javascript:void(0);"
        onclick="toggleFunction()"
        title="Toggle Navigation Menu"
      >
        <i class="fa fa-bars"></i>
      </a>
      <a href="/home" class="w3-bar-item w3-button w3-hover-black w3-opacity w3-hover-opacity-off"
        ><i class="fa fa-home"></i> HOME </a
      >
      <a href="/about" class="w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
        ><i class="fa fa-user"></i> ABOUT </a
      >
      <a href="/work" class="w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
        ><i class="fa fa-briefcase"></i> WORK </a
      >
      <a href="/blogs" class="w3-bar-item w3-button w3-hide-small w3-hover-black w3-opacity w3-hover-opacity-off"
        ><i class="fa fa-pencil"></i> BLOGS </a
      >
      <a
        href="/"
        class="w3-bar-item w3-button w3-hide-small w3-right w3-hover-black w3-opacity w3-hover-opacity-off"
      >
        <i class="fa fa-search"></i>
      </a>
    </div>

    <!-- Navbar on small screens -->
    <div
      id="navDemo"
      class="w3-bar-block w3-white w3-hide w3-hide-large w3-hide-medium"
    ><a href="/home" class="w3-bar-item w3-button"
      >HOME </a
      >
      <a href="/about" class="w3-bar-item w3-button" onclick="toggleFunction()"
        >ABOUT</a
      >
      <a href="/work" class="w3-bar-item w3-button" onclick="toggleFunction()"
        >WORK</a
      >
      <a
        href="/blogs"
        class="w3-bar-item w3-button"
        onclick="toggleFunction()"
        >BLOGS</a
      >
      <a href="/" class="w3-bar-item w3-button">SEARCH</a>
    </div>


  <!-- Name and Picture -->
  <div>
    <header>
      <img src="./assets/headshot.jpeg" alt="personal picture" />
      <h1>Elias D. Crum</h1>
    </header>
  </div>
</div>
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

#myNavbar {
  opacity: 70%;
}

header h1 {
  font-family: "KoHo", sans-serif;
  color: rgb(255, 255, 255);
  font-size: 50pt;
  font-weight: 400;
  margin: 0;
}

img {
  width: 75px; /* Adjust size as needed */
  height: 100px; /* Maintain aspect ratio */
  border-radius: 50%; /* Make the image round */
  border: 2px solid white; /* Add a white border */
  margin-right: 20px;
}
</style>
