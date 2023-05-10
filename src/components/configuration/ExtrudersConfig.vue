<template>
	<scroll-item id="extruders" title="Extruders" :preview-templates="['config/extruders']">
		<template #append-title>
			<button class="btn btn-sm btn-primary" :disabled="!canAddExtruder" @click.prevent="addExtruder">
				<i class="bi-plus-circle"></i>
				Add Extruder
			</button>
		</template>
		<template #body>
			<table class="table table-striped table-extruders mb-0">
				<colgroup>
					<col style="width: auto;">
					<col style="width: auto;">
					<col style="width: 20%;">
					<col style="width: 20%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: auto;">
				</colgroup>
				<thead>
					<tr>
						<th class="text-center">
							Extruder
						</th>
						<th class="text-center">
							Driver
						</th>
						<th>
							Microstepping
						</th>
						<th>
							Steps per mm
							<span class="badge bg-secondary" v-title="'Total microsteps per mm'">
								<i class="bi bi-calculator"></i>
							</span>
						</th>
						<th>
							Max. Speed Change (mm/s)
						</th>
						<th>
							Max. Speed (mm/s)
						</th>
						<th>
							Acceleration (mm/s²)
						</th>
						<th>
							Motor Current (mA)
						</th>
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(extruder, index) in store.data.move.extruders">
						<td class="text-center">
							<div class="mt-2">
								{{ `E${index}` }}
							</div>
						</td>
						<td class="text-center">
							<driver-selection class="mt-1" v-model="extruder.driver" />
						</td>
						<td class="lh-1">
							<select-input title="Microstepping for the mapped driver"
										  :model-value="getMicrostepping(extruder)"
										  @update:model-value="setMicrostepping(extruder, $event)"
										  :options="getMicrosteppingOptions(extruder)"
										  :preset="getPresetExtruderMicrostepping(extruder)" />
							<span v-show="getMicrostepping(extruder).endsWith('i')" class="small-text">
								interpolated to x256
							</span>
						</td>
						<td>
							<steps-per-mm-calculator :extruder="extruder" :index="index" />
						</td>
						<td>
							<number-input title="Maximum allowed speed for instantaneous direction changes" :min="0"
										  :step="1" :max="extruder.speed" unit="mm/s" hide-unit v-model="extruder.jerk"
										  :preset="getPresetExtruderValue(index, 'jerk')" />
						</td>
						<td>
							<number-input title="Maximum allowed speed" :min="0.1" :step="1" unit="mm/s" hide-unit
										  v-model="extruder.speed" :preset="getPresetExtruderValue(index, 'speed')" />
						</td>
						<td>
							<number-input title="Acceleration for moves" :min="0.1" :step="1" unit="mm/s²" hide-unit
										  v-model="extruder.acceleration"
										  :preset="getPresetExtruderValue(index, 'acceleration')" />
						</td>
						<td>
							<number-input title="Peak current for mapped driver (not RMS)" :min="0"
										  :max="getMaxCurrent(extruder.driver)" :step="100" unit="mA" hide-unit
										  :disabled="getMaxCurrent(extruder.driver)! <= 0" v-model="extruder.current"
										  :preset="getPresetExtruderValue(index, 'current')" />
						</td>
						<td>
							<button class="btn btn-sm btn-danger mt-1"
									@click.prevent="store.data.move.extruders.splice(index, 1)">
								<i class="bi-trash"></i>
							</button>
						</td>
					</tr>
				</tbody>
			</table>

			<div v-if="store.data.move.extruders.length === 0" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Extruders defined
			</div>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { Extruder, type DriverId } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import StepsPerMmCalculator from "@/components/calculators/StepsPerMmCalculator.vue";
import DriverSelection from "@/components/inputs/DriverSelection.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";

const store = useStore();

// Extruder management
const canAddExtruder = computed(() => (store.data.move.extruders.length < store.data.limits.extruders!) && (store.data.move.axes.length + store.data.move.extruders.length < store.data.limits.axesPlusExtruders!));

function addExtruder() {
	const extruder = new Extruder();
	if (store.preset.move.extruders.length > store.data.move.extruders.length) {
		extruder.update(store.preset.move.extruders[store.data.move.extruders.length])
	} else if (store.preset.move.extruders.length > 0) {
		extruder.update(store.preset.move.extruders[0]);
	}
	extruder.driver = null;
	store.data.move.extruders.push(extruder);
}

// Microstepping
function getMicrostepping(extruder: Extruder): string {
	return `${extruder.microstepping.value}${extruder.microstepping.interpolated ? "i" : ""}`
}

function setMicrostepping(extruder: Extruder, value: string): void {
	if (value.endsWith("i")) {
		extruder.microstepping.interpolated = true;
		extruder.microstepping.value = parseInt(value.substring(0, value.length - 1));
	} else {
		extruder.microstepping.interpolated = false;
		extruder.microstepping.value = parseInt(value);
	}
}

function getMicrosteppingOptions(extruder: Extruder) {
	// Check which interpolations to x256 are supported
	let supportedInterpolations: Array<number> = [];
	for (let i = 1; i < 256; i *= 2) {
		let isSupported: boolean;
		if (extruder.driver !== null) {
			const boardDefinition = store.data.getBoardDefinition(extruder.driver.board);
			isSupported = !!boardDefinition && boardDefinition.microstepInterpolations.includes(i);
		} else {
			isSupported = true;				// supported by default
		}

		if (isSupported) {
			supportedInterpolations.push(i);
		}
	}

	// Make select options
	const options: Array<SelectOption> = [];
	for (let i = 1; i <= 256; i *= 2) {
		options.push({
			text: `x${i}`,
			value: i.toString()
		});
		if (supportedInterpolations.includes(i)) {
			options.push({
				text: `x${i} (on)`,
				value: `${i}i`
			});
		}
	}
	return options;
}

function getPresetExtruderMicrostepping(extruder: Extruder): string {
	const boardDefinition = store.data.getBoardDefinition(extruder.driver ? extruder.driver.board : null);
	return (boardDefinition && boardDefinition.microstepInterpolations.includes(16)) ? "16i" : "16";
}

function getPresetExtruderValue<K extends keyof Extruder>(index: number, key: K) {
	return (index < store.preset.move.extruders.length) ? store.preset.move.extruders[index][key] : null;
}

function getMaxCurrent(driver: DriverId | null) {
	if (driver !== null) {
		const boardDefinition = store.data.getBoardDefinition(driver.board);
		if (boardDefinition) {
			return boardDefinition.motorMaxCurrent;
		}
	}
	return undefined;
}
</script>
