import { createApp } from "vue";
import { createPinia } from "pinia";

import "../scss/style.scss"
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap-icons/font/bootstrap-icons.css";

import App from "./App.vue";
import VPreset from "./directives/VPreset";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.directive("preset", VPreset);
app.use(router);

app.mount("#app");
