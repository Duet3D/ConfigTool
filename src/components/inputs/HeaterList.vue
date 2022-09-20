<style scoped>
.heater-list {
	min-width: 9rem;
}
</style>

<template>
	<div class="d-flex flex-wrap align-items-center gap-1 heater-list">
		<span v-if="props.heaters.length === 0" class="text-muted me-2 mb-1">
			<i class="bi-info-circle"></i> none
		</span>
		<button v-for="(heater, index) in props.heaters" tsype="button"
				class="btn btn-outline-primary btn-sm text-nowrap" v-title="`Heater #${heater}`"
				@click.prevent="removeHeater(heater, index)">
			{{ `H${heater}` }}
			<i class="bi-x"></i>
		</button>

		<div class="dropdown">
			<button ref="dropdownButton" type="button" class="btn btn-outline-success btn-sm text-nowrap"
					:disabled="availableHeaters.length === 0" data-bs-toggle="dropdown" data-bs-auto-close="true"
					@click.prevent="dropdown?.show()">
				<i class="bi-plus"></i>
			</button>

			<ul class="dropdown-menu">
				<li v-for="extruder in availableHeaters">
					<a class="dropdown-item" href="#" @click.prevent="addHeater(extruder)">
						{{ `H${extruder}` }}
						<span class="text-muted fst-italic ms-3">
							{{ `Heater #${extruder}` }}
						</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Dropdown } from "bootstrap";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { useStore } from "@/store";

const props = defineProps<{
	/**
	 * Heater array to manage
	 */
	heaters: Array<number>
}>();

const emit = defineEmits<{
	(e: "heaterAdded", value: number): void,
	(e: "heaterRemoved", value: number): void
}>();

const store = useStore();

// Dropdown functionality
const dropdownButton = ref<Element | null>(null), dropdown = ref<Dropdown | null>(null);
onMounted(() => {
	if (dropdownButton.value) {
		dropdown.value = new Dropdown(dropdownButton.value);
	}
});
onBeforeUnmount(() => {
	if (dropdown.value) {
		dropdown.value.dispose();
		dropdown.value = null;
	}
});

function addHeater(extruder: number) {
	props.heaters.push(extruder);
	dropdown.value?.hide();
	emit("heaterAdded", extruder);
}

function removeHeater(extruder: number, index: number) {
	props.heaters.splice(index, 1);
	emit("heaterRemoved", extruder);
}

// Heater list
const availableHeaters = computed(() => {
	const heaterList: Array<number> = [];
	if (props.heaters.length < store.data.limits.heatersPerTool!) {
		for (let i = 0; i < store.data.heat.heaters.length; i++) {
			if (store.data.heat.heaters[i] !== null && !props.heaters.includes(i)) {
				heaterList.push(i);
			}
		}
	}
	return heaterList;
});
</script>
