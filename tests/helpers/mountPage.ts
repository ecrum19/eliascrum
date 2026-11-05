import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import type { Component } from "vue";

/** Real router links, inert TOC scrolling: test page behavior without PDF/network effects. */
export async function mountPage(component: Component, path = "/software") {
  localStorage.setItem("site-performance-mode", "lite");
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        name: "Publication Paper",
        path: "/publications/:slug/paper",
        component: { template: "<div />" },
      },
      { path: "/talks/posters/:slug", component: { template: "<div />" } },
      { path: "/talks/:slug", component: { template: "<div />" } },
      { path: "/software/:slug", component: { template: "<div />" } },
      { path: "/about/fellowships/:slug", component: { template: "<div />" } },
      { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
    ],
  });
  await router.push(path);
  await router.isReady();
  return {
    wrapper: mount(component, {
      global: { plugins: [router], stubs: { WorkToc: true } },
    }),
    router,
  };
}
