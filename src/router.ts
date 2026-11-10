import {
  createRouter,
  createWebHistory,
  type RouterScrollBehavior,
} from "vue-router";

/** Restore once the page is tall enough again, or after a short wait; otherwise the browser clamps it. */
function whenReachable(position: { left: number; top: number }) {
  return new Promise<{ left: number; top: number }>((resolve) => {
    const deadline = performance.now() + 1500;
    const check = () => {
      const reachable =
        document.documentElement.scrollHeight - window.innerHeight >= position.top;
      if (reachable || performance.now() > deadline) resolve(position);
      else window.requestAnimationFrame(check);
    };
    check();
  });
}

/** New pages open at the top; only back/forward restores where the visitor was. */
export const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) return whenReachable(savedPosition);
  // WorkToc positions in-page anchors itself, accounting for the fixed header.
  if (to.hash) return false;
  // Filter and sort changes rewrite the query of the same page; keep the reader's place.
  if (to.path === from.path) return false;
  return { top: 0 };
};

/**
 * The router here allows for navigation between different pages of the website
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior,
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
    },
    {
      name: "Privacy & Analytics",
      path: "/privacy",
      component: () => import("./components/PrivacyAnalytics.vue"),
    },
  ],
});

export default router;
