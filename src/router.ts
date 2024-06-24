import { createRouter, createWebHistory } from "vue-router";

import AboutMe from "./components/AboutMe.vue";
import MyPublications from "./components/MyPublications.vue";
import MyBlogs from "./components/MyBlogs.vue";

/**
 * The router here allows for navigation between different pages of the website
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "root",
      path: "/",
      redirect: { name: "About Me" }
    },
    {
      name: "About Me",
      path: "/about",
      components: { default: AboutMe },
    },
    {
      name: "My Work",
      path: "/work",
      components: { default: MyPublications },
    },
    {
      name: "Blogs",
      path: "/blogs",
      components: { default: MyBlogs },
    },
  ],
});

export default router;
