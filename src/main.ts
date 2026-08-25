import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import {
  initializeStoredAnalyticsConsent,
  trackPageView,
} from "./utils/analytics";

const app = createApp(App);

app.use(router);

router.afterEach(() => {
  trackPageView();
});

app.mount("#app");

router.isReady().then(() => {
  void initializeStoredAnalyticsConsent().then(() => {
    trackPageView();
  });
});
