<style scoped>
.driver-list {
	min-width: 9rem;
}
</style>

<template>
	<div class="d-flex flex-wrap align-items-center gap-1 driver-list">
		<span v-if="props.drivers.length === 0" class="text-danger is-invalid me-2 mb-1">
			<i class="bi-exclamation-circle"></i> none
		</span>
		<button v-for="(driver, index) in props.drivers" type="button" class="btn btn-outline-primary btn-sm text-nowrap"
				v-title="(driver.board !== null) ? `Board ${driver.board} Driver ${driver.driver}` : `Driver ${driver.driver}`"
		        @click.prevent="props.drivers.splice(index, 1)">
			{{ driver }}
			<i class="bi-x"></i>
		</button>

		<div class="dropdown">
			<button ref="dropdownButton" type="button" class="btn btn-outline-success btn-sm text-nowrap"
					:disabled="availableDrivers.length === 0" data-bs-toggle="dropdown" data-bs-auto-close="true"
					@click.prevent="dropdown?.show()">
				<i class="bi-plus"></i>
			</button>

			<ul class="dropdown-menu">
				<li v-for="driver in availableDrivers">
					<a class="dropdown-item" href="#" @click.prevent="addDriver(driver)">
						{{ driver }}
						<span class="text-muted fst-italic ms-3">
							{{ (driver.board !== null) ? `Board ${driver.board} Driver ${driver.driver}` : `Driver ${driver.driver}` }}
						</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Dropdown } from "bootstrap";
import type { DriverId } from "@duet3d/objectmodel";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { useStore } from "@/store";

const props = defineProps<{
	/**
	 * Driver array to manage
	 */
	drivers: Array<DriverId>
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

function addDriver(driver: DriverId) {
	props.drivers.push(driver);
	dropdown.value?.hide();
}

// Driver list
const availableDrivers = computed(() => {
	const driverList: Array<DriverId> = [];
	if (props.drivers.length < store.data.limits.driversPerAxis!) {
		for (const driver of store.data.configTool.drivers) {
			if (!store.data.move.axes.some(axis => axis.drivers.some(item => item.equals(driver.id))) &&
				!store.data.move.extruders.some(extruder => extruder.driver?.equals(driver.id))
			) {
				driverList.push(driver.id);
			}
		}
	}
	return driverList;
});
</script>
