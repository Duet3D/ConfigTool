<style scoped>
.fan-list {
	min-width: 9rem;
}
</style>

<template>
	<div class="d-flex flex-wrap align-items-center gap-1 fan-list">
		<span v-if="props.fans.length === 0" class="text-muted me-2 mb-1">
			<i class="bi-info-circle"></i> none
		</span>
		<button v-for="(fan, index) in props.fans" tsype="button"
				class="btn btn-outline-primary btn-sm text-nowrap" v-title="getFanName(fan)"
				@click.prevent="removeFan(fan, index)">
			{{ `F${fan}` }}
			<i class="bi-x"></i>
		</button>

		<div class="dropdown">
			<button ref="dropdownButton" type="button" class="btn btn-outline-success btn-sm text-nowrap"
					:disabled="availableFans.length === 0" data-bs-toggle="dropdown" data-bs-auto-close="true"
					@click.prevent="dropdown?.show()">
				<i class="bi-plus"></i>
			</button>

			<ul class="dropdown-menu">
				<li v-for="fan in availableFans">
					<a class="dropdown-item" href="#" @click.prevent="addFan(fan)">
						{{ `F${fan}` }}
						<span class="text-muted fst-italic ms-3">
							{{ getFanName(fan) }}
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
	 * Fans array to manage
	 */
	 fans: Array<number>
}>();

const emit = defineEmits<{
	(e: "fanAdded", value: number): void,
	(e: "fanRemoved", value: number): void
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

function addFan(extruder: number) {
	props.fans.push(extruder);
	dropdown.value?.hide();
	emit("fanAdded", extruder);
}

function removeFan(extruder: number, index: number) {
	props.fans.splice(index, 1);
	emit("fanRemoved", extruder);
}

// Fans
function getFanName(index: number) {
	return (index < store.data.fans.length && store.data.fans[index] !== null && store.data.fans[index]!.name) ? store.data.fans[index]!.name : `Fan #${index}`;
}

// Fan list
const availableFans = computed(() => {
	const fanList: Array<number> = [];
	for (let i = 0; i < Math.min(store.data.fans.length, 32 /* fixed for now */); i++) {
		if (store.data.fans[i] !== null && store.data.fans[i]!.thermostatic.heaters.length === 0 && !props.fans.includes(i)) {
			fanList.push(i);
		}
	}
	return fanList;
});
</script>
