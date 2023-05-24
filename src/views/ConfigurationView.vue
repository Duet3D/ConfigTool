<template>
	<main class="container">
		<component v-for="section in sectionComponents" :is="section"></component>
		
		<div class="mt-3"></div>

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
import { onBeforeUnmount, onMounted, computed, ref } from "vue";
import { useRouter } from "vue-router";

import Accessories from "@/components/sections/Accessories.vue";
import General from "@/components/sections/General.vue";
import Network from "@/components/sections/Network.vue";
import Expansion from "@/components/sections/Expansion.vue";
import Drivers from "@/components/sections/Drivers.vue";
import Axes from "@/components/sections/Axes.vue";

import { useStore } from "@/store";
import { ConfigSectionType, getSections } from "@/store/sections";
import Extruders from "@/components/sections/Extruders.vue";
import Probes from "@/components/sections/Probes.vue";
import Endstops from "@/components/sections/Endstops.vue";
import Compensation from "@/components/sections/Compensation.vue";
import Sensors from "@/components/sections/Sensors.vue";
import Heaters from "@/components/sections/Heaters.vue";
import Spindles from "@/components/sections/Spindles.vue";
import Lasers from "@/components/sections/Lasers.vue";
import Fans from "@/components/sections/Fans.vue";
import Tools from "@/components/sections/Tools.vue";
import Miscellaneous from "@/components/sections/Miscellaneous.vue";
import Kinematics from "@/components/sections/Kinematics.vue";

const router = useRouter();
const store = useStore();

// Sections
const sectionComponents = computed(() => {
	const sections = getSections(), components = [];
	for (const section of sections) {
		switch (section) {
			case ConfigSectionType.General:
				components.push(General);
				break;
			case ConfigSectionType.Accessories:
				components.push(Accessories);
				break;
			case ConfigSectionType.Network:
				components.push(Network);
				break;
			case ConfigSectionType.Expansion:
				components.push(Expansion);
				break;
			case ConfigSectionType.Kinematics:
				components.push(Kinematics);
				break;
			case ConfigSectionType.Drivers:
				components.push(Drivers);
				break;
			case ConfigSectionType.Axes:
				components.push(Axes);
				break;
			case ConfigSectionType.Extruders:
				components.push(Extruders);
				break;
			case ConfigSectionType.Probes:
				components.push(Probes);
				break;
			case ConfigSectionType.Endstops:
				components.push(Endstops);
				break;
			case ConfigSectionType.Compensation:
				components.push(Compensation);
				break;
			case ConfigSectionType.Sensors:
				components.push(Sensors);
				break;
			case ConfigSectionType.Heaters:
				components.push(Heaters);
				break;
			case ConfigSectionType.Spindles:
				components.push(Spindles);
				break;
			case ConfigSectionType.Lasers:
				components.push(Lasers);
				break;
			case ConfigSectionType.Fans:
				components.push(Fans);
				break;
			case ConfigSectionType.Tools:
				components.push(Tools);
				break;
			case ConfigSectionType.Miscellaneous:
				components.push(Miscellaneous);
				break;
			default:
				const _exhaustiveCheck: never = section;
				break;
		}
	}
	return components;
});

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
