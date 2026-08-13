import { createRouter, createWebHistory } from "vue-router";

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
      component: () => import("./components/AboutMe.vue"),
    },
    {
      name: "Publications",
      path: "/publications",
      component: () => import("./components/MyPublications.vue"),
    },
    {
      name: "Publication Paper",
      path: "/publications/:slug/paper",
      component: () => import("./components/PublicationPaperPage.vue"),
    },
    {
      name: "Software",
      path: "/software",
      component: () => import("./components/MySoftware.vue"),
    },
    {
      name: "Software Detail",
      path: "/software/:slug",
      component: () => import("./components/SoftwareDetail.vue"),
    },
    {
      name: "My Work",
      path: "/work",
      redirect: { name: "Publications" },
    },
    {
      name: "Blogs",
      path: "/blogs",
      component: () => import("./components/MyBlogs.vue"),
    },
    {
      name: "Talks",
      path: "/talks",
      component: () => import("./components/MySlides.vue"),
    },
    {
      name: "Poster Detail",
      path: "/talks/posters/:slug",
      component: () => import("./components/PosterDetail.vue"),
    },
    {
      name: "Talk Detail",
      path: "/talks/:slug",
      component: () => import("./components/SlideDetail.vue"),
    },
    {
      name: 'My CV',
      path: '/about/cv',
      component: () => import("./components/CurrentCv.vue")
    },
    {
      name: "Fellowship Detail",
      path: "/about/fellowships/:slug",
      component: () => import("./components/FellowshipDetail.vue"),
    }
  ],
});

export default router;
