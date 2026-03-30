import { createRouter, createWebHistory } from "vue-router";

import AboutMe from "./components/AboutMe.vue";
import MyPublications from "./components/MyPublications.vue";
import MySoftware from "./components/MySoftware.vue";
import SoftwareDetail from "./components/SoftwareDetail.vue";
import MyBlogs from "./components/MyBlogs.vue";
import MyCV from "./components/CurrentCv.vue";
import MySlides from "./components/MySlides.vue";
import SlideDetail from "./components/SlideDetail.vue";
import PosterDetail from "./components/PosterDetail.vue";
import PublicationPaperPage from "./components/PublicationPaperPage.vue";
import FellowshipDetail from "./components/FellowshipDetail.vue";

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
      name: "Publication Paper",
      path: "/publications/:slug/paper",
      component: PublicationPaperPage,
    },
    {
      name: "Software",
      path: "/software",
      components: { default: MySoftware },
    },
    {
      name: "Software Detail",
      path: "/software/:slug",
      component: SoftwareDetail,
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
      name: "Poster Detail",
      path: "/talks/posters/:slug",
      component: PosterDetail,
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
    },
    {
      name: "Fellowship Detail",
      path: "/about/fellowships/:slug",
      component: FellowshipDetail,
    }
  ],
});

export default router;
