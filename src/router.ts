import { createRouter, createWebHistory } from "vue-router";

import AboutMe from "./components/AboutMe.vue";
import MyPublications from "./components/MyPublications.vue";
import MySoftware from "./components/MySoftware.vue";
import MyBlogs from "./components/MyBlogs.vue";
import MyCV from "./components/CurrentCv.vue";
import MySlides from "./components/MySlides.vue";
import SlideDetail from "./components/SlideDetail.vue";

/**
 * The router here allows for navigation between different pages of the website
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      name: "Publications",
      path: "/publications",
      components: { default: MyPublications },
    },
    {
      name: "Software",
      path: "/software",
      components: { default: MySoftware },
    },
    {
      name: "My Work",
      path: "/work",
      redirect: { name: "Publications" },
    },
    {
      name: "Blogs",
      path: "/blogs",
      components: { default: MyBlogs },
    },
    {
      name: "Talks",
      path: "/talks",
      component: MySlides,
    },
    {
      name: "Talk Detail",
      path: "/talks/:slug",
      component: SlideDetail,
    },
    {
      name: 'My CV',
      path: '/about/cv',
      component: MyCV
    }
  ],
});

export default router;
