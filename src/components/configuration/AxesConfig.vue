<template>
	<scroll-item anchor="Axes">
		<template #title>
			Axes
		</template>
		<template #append-title>
			<button class="btn btn-sm btn-primary" :disabled="!canAddAxis" @click.prevent="addAxis">
				<i class="bi-plus-circle"></i>
				Add Axis
			</button>
		</template>
		<template #body>
			<table class="table table-striped table-axes mb-0">
				<colgroup>
					<col style="width: 10%;">
					<col style="width: auto;">
					<col style="width: 10%;">
					<col style="width: 10%;">
					<col style="width: 18%;">
					<col style="width: 11%;">
					<col style="width: 17%;">
					<col style="width: 13%;">
					<col style="width: 11%;">
					<col style="width: auto;">
				</colgroup>
				<thead>
					<tr>
						<th class="text-center">
							Axis
						</th>
						<th>
							Drivers
						</th>
						<th>
							Minimum (mm)
						</th>
						<th>
							Maximum (mm)
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
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(axis, index) in store.data.move.axes">
						<td class="text-center">
							<div v-if="isPersistentAxis(axis)" class="mt-2">
								{{ axis.letter }}
							</div>
							<select-input v-else title="Letter of this axis"
							              :valid="!!axis.letter && isAxisUnique(axis)" :required="!axis.letter || !isAxisUnique(axis)"
							              v-model="axis.letter" :options="getAxisLetterOptions(axis)" :preset="getPresetAxisValue(index, 'letter')" />
						</td>
						<td>
							<driver-list :drivers="axis.drivers" class="mt-1" />
						</td>
						<td>
							<number-input title="Minimum axis position"
							              :max="axis.max" :step="0.01" unit="mm" hide-unit
							              v-model="axis.min" :preset="getPresetAxisValue(index, 'min')" />
						</td>
						<td>
							<number-input title="Maximum axis position"
							              :min="axis.min" :step="0.01" unit="mm" hide-unit
							              v-model="axis.max" :preset="getPresetAxisValue(index, 'max')" />
						</td>
						<td class="lh-1">
							<select-input title="Microstepping for mapped drivers"
							              :model-value="getMicrostepping(axis)" @update:model-value="setMicrostepping(axis, $event)"
							              :options="getMicrosteppingOptions(axis)" :preset="getPresetAxisMicrostepping(axis)" />
							<span v-show="getMicrostepping(axis).endsWith('i')" class="small-text">
								interpolated to x256
							</span>
						</td>
						<td>
							<steps-per-mm-calculator :axis="axis" :index="index" />
						</td>
						<td>
							<number-input title="Maximum allowed speed for instantaneous direction changes"
							              :min="0" :step="1" :max="axis.speed" unit="mm/s" hide-unit
							              v-model="axis.jerk" :preset="getPresetAxisValue(index, 'jerk')" />
						</td>
						<td>
							<number-input title="Maximum allowed speed"
							              :min="0.1" :step="1" unit="mm/s" hide-unit
							              v-model="axis.speed" :preset="getPresetAxisValue(index, 'speed')" />
						</td>
						<td>
							<number-input title="Acceleration for moves"
							              :min="0.1" :step="1" unit="mm/s²" hide-unit
							              v-model="axis.acceleration" :preset="getPresetAxisValue(index, 'acceleration')" />
						</td>
						<td>
							<button class="btn btn-sm btn-danger mt-1" :disabled="isPersistentAxis(axis)" @click.prevent="store.data.move.axes.splice(index, 1)">
								<i class="bi-trash"></i>
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Axis, AxisLetter, DriverId, Endstop } from "@duet3d/objectmodel";

import ScrollItem from "@/components/ScrollItem.vue";
import StepsPerMmCalculator from "@/components/calculators/StepsPerMmCalculator.vue";
import DriverList from "@/components/inputs/DriverList.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";

const store = useStore();

// Axis management
const canAddAxis = computed(() => (store.data.move.axes.length < store.data.limits.axes!) && (store.data.move.axes.length + store.data.move.extruders.length < store.data.limits.axesPlusExtruders!));
function addAxis() {
	// Add new axis
	const axis = new Axis();
	if (store.preset.move.axes.length > store.data.move.axes.length) {
		axis.update(store.preset.move.axes[store.data.move.axes.length])
		if (store.data.move.axes.some(item => item.letter === axis.letter)) {
			axis.letter = AxisLetter.none;
		}
	} else if (store.preset.move.axes.length > 0) {
		axis.update(store.preset.move.axes[0]);
		axis.letter = AxisLetter.none;
	}
	axis.drivers.splice(0);
	store.data.move.axes.push(axis);

	// Add corresponding endstop
	const endstop = new Endstop();
	if (store.preset.sensors.endstops.length > store.data.sensors.endstops.length) {
		endstop.update(store.preset.sensors.endstops[store.data.sensors.endstops.length]);
	} else if (store.preset.sensors.endstops.length > 0) {
		endstop.update(store.preset.sensors.endstops[0]);
	}
	store.data.sensors.endstops.push(endstop);
}

// Axis letter
const isPersistentAxis = (axis: Axis) => [AxisLetter.X, AxisLetter.Y, AxisLetter.Z].includes(axis.letter);
function getAxisLetterOptions(axis: Axis) {
	const options: Array<SelectOption> = [];
	for (const axisLetter of Object.values(AxisLetter)) {
		if (axisLetter != AxisLetter.none && (axis.letter === axisLetter || !store.data.move.axes.some(axis => axis.letter === axisLetter))) {
			options.push({
				text: axisLetter as string,
				value: axisLetter
			})
		}
	}
	return options;
}
function isAxisUnique(axis: Axis) {
	let occurences = 0;
	for (const item of store.data.move.axes) {
		if (item.letter === axis.letter) {
			occurences++;
		}
	}
	return occurences === 1;
}

// Microstepping
function getMicrostepping(axis: Axis): string {
	if (axis.drivers.length > 0) {
		const firstDriver = axis.drivers[0];
		for (const driver of store.data.configTool.drivers) {
			if (driver.id.equals(firstDriver)) {
				return `${driver.microstepping}${driver.microsteppingInterpolated ? "i" : ""}`
			}
		}
	}
	return getPresetAxisMicrostepping(axis);
}
function setMicrostepping(axis: Axis, value: string): void {
	let microstepping: number, interpolated: boolean;
	if (value.endsWith("i")) {
		microstepping = parseInt(value.substring(0, value.length - 1));
		interpolated = true;
	} else {
		microstepping = parseInt(value);
		interpolated = false;
	}

	for (const driver of store.data.configTool.drivers) {
		if (axis.drivers.some(axisDriver => axisDriver.equals(driver.id))) {
			driver.microstepping = microstepping;
			driver.microsteppingInterpolated = interpolated;
		}
	}
}
function getMicrosteppingOptions(axis: Axis) {
	// Check which interpolations to x256 are supported
	let supportedInterpolations: Array<number> = [];
	for (let i = 1; i < 256; i *= 2) {
		let isSupported = (axis.drivers.length === 0);      // supported by default
		for (const driver of axis.drivers) {
			const boardDefinition = store.data.getBoardDefinition(driver.board);
			if (boardDefinition && boardDefinition.microstepInterpolations.includes(i)) {
				isSupported = true;
				break;
			}
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
function getPresetAxisMicrostepping(axis: Axis): string {
	const boardDefinition = store.data.getBoardDefinition((axis.drivers.length > 0) ? axis.drivers[0].board : null);
	return (boardDefinition && boardDefinition.microstepInterpolations.includes(16)) ? "16i" : "16";
}

function getPresetAxisValue<K extends keyof Axis>(index: number, key: K) {
	return (index < store.preset.move.axes.length) ? store.preset.move.axes[index][key] : null;
}
</script>
