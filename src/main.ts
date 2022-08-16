import { createApp } from "vue";
import { createPinia } from "pinia";

import "../scss/style.scss"
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap-icons/font/bootstrap-icons.css";

import App from "./App.vue";
import VPreset from "./directives/VPreset";
import VTitle from "./directives/VTitle";
import router from "./router";

createApp(App)
    .use(createPinia())
    .directive("preset", VPreset)
    .directive("title", VTitle)
    .use(router)
    .mount("#app");
