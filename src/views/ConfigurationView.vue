<template>
	<div class="container" ref="content">
		<general-config />
		<expansion-config />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import GeneralConfig from "@/components/configuration/GeneralConfig.vue";
import ExpansionConfig from "@/components/configuration/ExpansionConfig.vue";
import { eventOptions } from "@/router";

// Scrollspy functionality
const content = ref(), router = useRouter();
onMounted(() => {
	const anchors: Array<HTMLElement> = [];
	for (let el of content.value.getElementsByTagName("a")) {
		if (el.dataset["anchor"] === "true") {
			anchors.push(el);
		}
	}

	let debounceTimer = 0;
	content.value.onscroll = () => {
		// When the router scrolls an element into view, it takes a moment before this event can be used again
		if (eventOptions.ignoreScrollHandler) {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			debounceTimer = setTimeout(() => {
				eventOptions.ignoreScrollHandler = false;
				debounceTimer = 0;
			}, 250);
			return;
		}

		// Check which router element is supposed to be active
		let anchor = null, lastDelta = 0;
		for (let item of anchors) {
			const delta = Math.abs(item.getBoundingClientRect().top);
			if (anchor === null || delta < lastDelta) {
				anchor = item;
				lastDelta = delta;
			}
		}

		// Replace the current route if a new anchor was scrolled into view
		if (anchor) {
			const newRoute = (anchor.id === 'General') ? '/Configuration' : `/Configuration/${anchor.id}`;
			if (router.currentRoute.value.path !== newRoute) {
				eventOptions.ignoreRouterHandler = true;
				router.replace(newRoute);
			}
		}
	}
});
</script>
