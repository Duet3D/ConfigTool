import { createRouter, createWebHistory } from "vue-router";

import StartView from "@/views/StartView.vue";
import PresetsView from "@/views/PresetsView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "start",
			component: StartView
		},
		{
			path: "/Presets",
			name: "presets",
			component: PresetsView,
		},
		{
			path: "/Configuration",
			name: "configuration",
			component: () => import('../views/ConfigurationView.vue')
		},
		{
			path: "/Summary",
			name: "summary",
			component: () => import('../views/SummaryView.vue')
		}
	],
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition !== null) {
			return savedPosition;
		}
        if (to.hash) {
            return { el: to.hash, behavior: "smooth", top: 56 };
        }
		return { left: 0, top: 0 };
    }
});

router.beforeEach((to) => {
	if (to.path.startsWith("/Summary") && document.body.querySelector(".is-invalid") !== null) {
		alert("There are errors in your configuration. You must fix them first before you can continue.");
		return false;
	}
	return true;
});

export default router;
