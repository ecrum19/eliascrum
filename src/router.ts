import { createRouter, createWebHistory } from "vue-router";

import HomePage from "./components/HomePage.vue";
import TheHeader from "./components/TheHeader.vue";
import PageSelector from "./components/PageSelector.vue";
import TheFooter from "./components/TheFooter.vue";

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
      name: "Home Page",
      path: "/",
      components: {
        default: HomePage,
        header: TheHeader,
        navBar: PageSelector,
        footer: TheFooter,
      },
      children: [
        {
          name: "About Me",
          path: "/about",
          components: { default: AboutMe },
        },
        {
          name: "Publications",
          path: "/pubs",
          components: { default: MyPublications },
        },
        {
          name: "Blogs",
          path: "/blogs",
          components: { default: MyBlogs },
        },
      ],
    },
  ],
});

router.beforeEach(function (to, from, next) {
  // make sure the user is authenticated
  if (to.name !== "Home Page") {
    next({ name: "Home Page" });
  } else {
    next();
  }
});

export default router;
