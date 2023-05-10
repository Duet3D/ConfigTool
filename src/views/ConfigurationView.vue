<template>
	<main class="container">
		<general-config />
		<accessories-config />
		<network-config v-if="store.data.network.interfaces.length > 0" />
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
		<miscellaneous-config />

		<div v-if="firstErrorNode !== null" class="alert alert-danger d-flex justify-content-between mt-2">
			<span>
				<i class="bi bi-exclamation-triangle"></i>
				Your configuration contains errors. You must fix them before you can continue.
			</span>
			<a href="javascript:void(0)" @click.prevent="jumpToFirstError">
				<i class="bi bi-arrow-up-circle"></i>
				Jump to first error
			</a>
		</div>

		<div class="d-flex justify-content-center mb-3">
			<button type="button" class="btn btn-lg btn-primary ms-1" :disabled="firstErrorNode !== null" @click.prevent="$router.push('/Summary')">
				<i class="bi bi-arrow-right-circle"></i>
				Generate Configuration Bundle
			</button>
		</div>
	</main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import GeneralConfig from "@/components/configuration/GeneralConfig.vue";
import AccessoriesConfig from "@/components/configuration/AccessoriesConfig.vue";
import NetworkConfig from "@/components/configuration/NetworkConfig.vue";
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
import MiscellaneousConfig from "@/components/configuration/MiscellaneousConfig.vue";

import { useStore } from "@/store";

const router = useRouter();
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

// Error handling
const firstErrorNode = ref<HTMLElement | null>(null);

const classObserver = new MutationObserver(() => {
	firstErrorNode.value = document.body.querySelector(".is-invalid");
});

function jumpToFirstError() {
	if (firstErrorNode.value !== null) {
		const container = firstErrorNode.value.closest("section[id]");
		if (container !== null) {
			// Go to section containing the error
			router.push("/Configuration#" + container.id);
		}
	}
}

// Component lifecycle
onMounted(() => {
	// Track all sections that have an `id` applied
	document.querySelectorAll("section[id]").forEach((section) => {
		observer.observe(section);
	});

	// Track inputs changing their class to is-invalid
	classObserver.observe(document.body, {
		attributes: true,
		attributeFilter: ['class'],
		childList: true,
		subtree: true
	});
});

onBeforeUnmount(() => {
	// Stop tracking
	observer.disconnect();
	classObserver.disconnect();
});

</script>
