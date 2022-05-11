<template>
	<div class="container" ref="content">
		<general-config />
		<expansion-config />
		<drivers-config />
		<axes-config />
		<endstops-config />
		<z-probes-config />
		<compensation-config />
		<extruders-config />
		<spindles-config />
		<lasers-config />
		<fans-config />
		<tools-config />
		<i-o-config />
		<servos-config />
		<network-config />
		<accessories-config />
		<miscellaneous-config />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import GeneralConfig from "@/components/configuration/GeneralConfig.vue";
import ExpansionConfig from "@/components/configuration/ExpansionConfig.vue";
import { eventOptions } from "@/router";
import AxesConfig from "@/components/configuration/AxesConfig.vue";
import EndstopsConfig from "@/components/configuration/EndstopsConfig.vue";
import ZProbesConfig from "@/components/configuration/ZProbesConfig.vue";
import CompensationConfig from "@/components/configuration/CompensationConfig.vue";
import ExtrudersConfig from "@/components/configuration/ExtrudersConfig.vue";
import SpindlesConfig from "@/components/configuration/SpindlesConfig.vue";
import LasersConfig from "@/components/configuration/LasersConfig.vue";
import FansConfig from "@/components/configuration/FansConfig.vue";
import ToolsConfig from "@/components/configuration/ToolsConfig.vue";
import IOConfig from "@/components/configuration/IOConfig.vue";
import ServosConfig from "@/components/configuration/ServosConfig.vue";
import NetworkConfig from "@/components/configuration/NetworkConfig.vue";
import AccessoriesConfig from "@/components/configuration/AccessoriesConfig.vue";
import MiscellaneousConfig from "@/components/configuration/MiscellaneousConfig.vue";
import DriversConfig from "@/components/configuration/DriversConfig.vue";

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
