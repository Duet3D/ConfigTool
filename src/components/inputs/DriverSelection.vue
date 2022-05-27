<template>
	<div class="dropdown">
		<button ref="dropdownButton" class="btn btn-sm text-nowrap dropdown-toggle" :class="(props.modelValue === null) ? ['btn-outline-danger', 'is-invalid'] : 'btn-outline-success'"
		        :disabled="availableDrivers.length === 0" data-bs-toggle="dropdown" data-bs-auto-close="true"
		        @click="dropdown.show()">
			<template v-if="props.modelValue === null">
				<i class="bi-exclamation-circle"></i> none
			</template>
			<v-else>
				{{ props.modelValue }}
			</v-else>
		</button>

		<ul class="dropdown-menu">
			<li v-for="driver in availableDrivers">
				<a class="dropdown-item" href="#" @click.prevent="emit('update:modelValue', driver)">
					{{ driver }}
					<span class="text-muted fst-italic ms-3">
							{{ (driver.board !== null) ? `Board ${driver.board} Driver ${driver.driver}` : `Driver ${driver.driver}` }}
						</span>
				</a>
			</li>
			<li>
				<a class="dropdown-item" href="#" @click.prevent="emit('update:modelValue', null)">
					None
				</a>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { Dropdown } from "bootstrap";
import type { DriverId } from "@duet3d/objectmodel";
import { computed, onBeforeUnmount, onMounted, type Ref, ref } from "vue";

import { useStore } from "@/store";

const props = defineProps<{
	/**
	 * Current driver selection
	 */
	modelValue: DriverId | null
}>();
const emit = defineEmits<{
	(e: 'update:modelValue', value: DriverId | null): void
}>();

const store = useStore();

// Dropdown functionality
const dropdownButton: Ref<Element | null> = ref(null), dropdown: Ref<Dropdown | null> = ref(null);
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

// Driver list
const availableDrivers = computed(() => {
	const driverList: Array<DriverId> = [];
	for (const driver of store.data.configTool.drivers) {
		if (!store.data.move.axes.some(axis => axis.drivers.some(item => item.equals(driver.id))) &&
			!store.data.move.extruders.some(extruder => extruder.driver?.equals(driver.id))
		) {
			driverList.push(driver.id);
		}
	}
	return driverList;
});
</script>
