import { createRouter, createWebHistory } from "vue-router";

import StartView from "@/views/StartView.vue";
import TemplatesView from "@/views/TemplatesView.vue";

export const eventOptions = {
	ignoreScrollHandler: false,
	ignoreRouterHandler: false
};

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
			path: "/Configuration/:item*",
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
	scrollBehavior(to) {
		if (eventOptions.ignoreRouterHandler) {
			eventOptions.ignoreRouterHandler = false;
			return;
		}

		if (to.name === "configuration") {
			const element = document.getElementById((to.params.item.length !== 0) ? to.params.item[0] : 'General');
			if (element) {
				element.scrollIntoView(); // { behavior: "smooth" });
			}
		}
	}
});

export default router;
