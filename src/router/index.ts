import { createRouter, createWebHistory } from "vue-router";

import StartView from "@/views/StartView.vue";
import TemplatesView from "@/views/TemplatesView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "start",
			component: StartView
		},
		{
			path: "/Templates",
			name: "templates",
			component: TemplatesView,
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
		},
		{
			path: "/Finish",
			name: "finish",
			component: () => import('../views/FinishView.vue')
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

export default router;
