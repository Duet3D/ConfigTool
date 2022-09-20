<style scoped>
.extruder-list {
	min-width: 9rem;
}
</style>

<template>
	<div class="d-flex flex-wrap align-items-center gap-1 extruder-list">
		<span v-if="props.extruders.length === 0" class="text-muted me-2 mb-1">
			<i class="bi-info-circle"></i> none
		</span>
		<button v-for="(extruder, index) in props.extruders" type="button"
				class="btn btn-outline-primary btn-sm text-nowrap" v-title="`Extruder #${extruder}`"
				@click.prevent="removeExtruder(extruder, index)">
			{{ `E${extruder}` }}
			<i class="bi-x"></i>
		</button>

		<div class="dropdown">
			<button ref="dropdownButton" type="button" class="btn btn-outline-success btn-sm text-nowrap"
					:disabled="availableExtruders.length === 0" data-bs-toggle="dropdown" data-bs-auto-close="true"
					@click.prevent="dropdown?.show()">
				<i class="bi-plus"></i>
			</button>

			<ul class="dropdown-menu">
				<li v-for="extruder in availableExtruders">
					<a class="dropdown-item" href="#" @click.prevent="addExtruder(extruder)">
						{{ `E${extruder}` }}
						<span class="text-muted fst-italic ms-3">
							{{ `Extruder #${extruder}` }}
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
	 * Extruder array to manage
	 */
	extruders: Array<number>
}>();

const emit = defineEmits<{
	(e: "extruderAdded", value: number): void,
	(e: "extruderRemoved", value: number): void
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

function addExtruder(extruder: number) {
	props.extruders.push(extruder);
	dropdown.value?.hide();
	emit("extruderAdded", extruder);
}

function removeExtruder(extruder: number, index: number) {
	props.extruders.splice(index, 1);
	emit("extruderRemoved", extruder);
}

// Extruder list
const availableExtruders = computed(() => {
	const extruderList: Array<number> = [];
	if (props.extruders.length < store.data.limits.extrudersPerTool!) {
		for (let i = 0; i < store.data.move.extruders.length; i++) {
			if (store.data.move.extruders[i] !== null && !props.extruders.includes(i)) {
				extruderList.push(i);
			}
		}
	}
	return extruderList;
});
</script>
