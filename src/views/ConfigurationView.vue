<template>
	<main class="container">
		<general-config />
		<expansion-config />
		<kinematics-config />
		<drivers-config />
		<axes-config />
		<extruders-config v-if="store.data.configTool.capabilities.fff" />
		<probes-config />
		<endstops-config />
		<compensation-config />
		<sensors-config />
		<heaters-config v-if="store.data.configTool.capabilities.fff" />
		<spindles-config v-if="store.data.configTool.capabilities.cnc" />
		<lasers-config v-if="store.data.configTool.capabilities.laser" />
		<fans-config />
		<tools-config />
		<network-config v-if="store.data.network.interfaces.length > 0" />
		<accessories-config />
		<miscellaneous-config />
	</main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";

import GeneralConfig from "@/components/configuration/GeneralConfig.vue";
import ExpansionConfig from "@/components/configuration/ExpansionConfig.vue";
import KinematicsConfig from "@/components/configuration/KinematicsConfig.vue";
import DriversConfig from "@/components/configuration/DriversConfig.vue";
import AxesConfig from "@/components/configuration/AxesConfig.vue";
import ProbesConfig from "@/components/configuration/ProbesConfig.vue";
import EndstopsConfig from "@/components/configuration/EndstopsConfig.vue";
import CompensationConfig from "@/components/configuration/CompensationConfig.vue";
import SensorsConfig from "@/components/configuration/SensorsConfig.vue";
import HeatersConfig from "@/components/configuration/HeatersConfig.vue";
import ExtrudersConfig from "@/components/configuration/ExtrudersConfig.vue";
import SpindlesConfig from "@/components/configuration/SpindlesConfig.vue";
import LasersConfig from "@/components/configuration/LasersConfig.vue";
import FansConfig from "@/components/configuration/FansConfig.vue";
import ToolsConfig from "@/components/configuration/ToolsConfig.vue";
import NetworkConfig from "@/components/configuration/NetworkConfig.vue";
import AccessoriesConfig from "@/components/configuration/AccessoriesConfig.vue";
import MiscellaneousConfig from "@/components/configuration/MiscellaneousConfig.vue";

import { useStore } from "@/store";

// Visibility of categories
const store = useStore();

// Scrollspy
const observer = new IntersectionObserver(entries => {
	entries.forEach(entry => {
		const id = entry.target.getAttribute("id");
		if (id === "general") {
			if (entry.isIntersecting) {
				document.querySelectorAll(`a[href$="/Configuration"]`).forEach(item => item.classList.add("active"));
			} else {
				document.querySelectorAll(`a[href$="/Configuration"]`).forEach(item => item.classList.remove("active"));
			}
		} else {
			if (entry.isIntersecting) {
				document.querySelectorAll(`a[href$="#${id}"]`).forEach(item => item.classList.add("active"));
			} else {
				document.querySelectorAll(`a[href$="#${id}"]`).forEach(item => item.classList.remove("active"));
			}
		}
	});
}, { rootMargin: "-59px 0px -16px 0px" });

onMounted(() => {
	// Track all sections that have an `id` applied
	document.querySelectorAll("section[id]").forEach((section) => {
		observer.observe(section);
	});
});

onBeforeUnmount(() => {
	// Stop tracking
	observer.disconnect();
});
</script>
