<style scoped>
.table-microstepping th:first-child,
.table-microstepping tr > td:first-child {
	min-width: 5rem;
	text-align: center;
}
.table-microstepping tr > td:nth-child(3) {
	min-width: 10rem;
}

.small-text {
	font-size: 0.75rem;
}
</style>

<template>
	<scroll-item anchor="Axes">
		<template #title>
			Axes
			<button class="btn btn-sm btn-primary" :disabled="!canAddAxis" @click="addAxis">
				<i class="bi-plus-circle"></i>
				Add Axis
			</button>
		</template>
		<template #body>
			<table class="table table-striped table-microstepping mb-0">
				<thead>
					<th>
						Axis Letter
					</th>
					<th>
						Drivers
					</th>
					<th>
						Microstepping
					</th>
					<th>
						Steps per mm
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
				</thead>
				<tbody>
					<tr v-for="(axis, index) in store.data.move.axes">
						<td>
							<div v-if="isPersistentAxis(axis)" class="mt-2">
								{{ axis.letter }}
							</div>
							<select-input v-else title="Letter of this axis"
							              :valid="!!axis.letter && isAxisUnique(axis)" :required="!axis.letter || !isAxisUnique(axis)"
							              v-model="axis.letter" :options="getAxisLetterOptions(axis)" :preset="getAxisDefault(index, 'letter')" />
						</td>
						<td>
							<driver-list :drivers="axis.drivers" class="mt-1" />
						</td>
						<td class="lh-1">
							<select-input title="Microstepping for mapped drivers"
							              :model-value="getMicrostepping(axis)" @update:model-value="setMicrostepping(axis, $event)"
							              :options="getMicrosteppingOptions(axis)" :preset="getDefaultMicrostepping(axis)" />
							<span v-show="getMicrostepping(axis).endsWith('i')" class="small-text">
								interpolated to x256
							</span>
						</td>
						<td>
							<steps-per-mm-calculator :axis="axis" />
						</td>
						<td>
							<number-input title="Maximum allowed speed for instantaneous direction changes"
							              :min="0" :step="1" :max="axis.speed" unit="mm/s" hide-unit
							              v-model="axis.jerk" :preset="getAxisDefault(index, 'jerk')" />
						</td>
						<td>
							<number-input title="Maximum allowed speed"
							              :min="0.1" :step="1" unit="mm/s" hide-unit
							              v-model="axis.speed" :preset="getAxisDefault(index, 'speed')" />
						</td>
						<td>
							<number-input title="Acceleration for moves"
							              :min="0.1" :step="1" unit="mm/s²" hide-unit
							              v-model="axis.acceleration" :preset="getAxisDefault(index, 'acceleration')" />
						</td>
						<td>
							<number-input title="Peak current for mapped drivers (not RMS)"
							              :min="0" :max="getMaxCurrent(axis.drivers)" :step="100" unit="mA" hide-unit
							              :required="getMaxCurrent(axis.drivers) > 0" :disabled="getMaxCurrent(axis.drivers) <= 0"
							              v-model="axis.current" :preset="getAxisDefault(index, 'current')" />
						</td>
						<td>
							<button class="btn btn-sm btn-danger mt-1" :disabled="isPersistentAxis(axis)" @click="store.data.move.axes.splice(index, 1)">
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
import { Axis, AxisLetter, DriverId } from "@duet3d/objectmodel";

import ScrollItem from "@/components/ScrollItem.vue";
import StepsPerMmCalculator from "@/components/calculators/StepsPerMmCalculator.vue";
import DriverList from "@/components/inputs/DriverList.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";

const store = useStore();

// Axis management
const canAddAxis = computed(() => store.data.move.axes.length < store.data.limits.axes! && store.data.move.axes.length + store.data.move.extruders.length < store.data.limits.axesPlusExtruders!);
function addAxis() {
	const axis = new Axis();
	if (store.preset.move.axes.length > 0) {
		axis.update(store.preset.move.axes[0]);
		axis.letter = AxisLetter.none;
		axis.drivers.splice(0);
	}
	store.data.move.axes.push(axis);
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
	return getDefaultMicrostepping(axis);
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
function getDefaultMicrostepping(axis: Axis): string {
	const boardDefinition = store.data.getBoardDefinition((axis.drivers.length > 0) ? axis.drivers[0].board : null);
	return (boardDefinition && boardDefinition.microstepInterpolations.includes(16)) ? "16i" : "16";
}

function getAxisDefault(index: number, property: keyof Axis): number | null {
	return (index < store.preset.move.axes.length) ? store.preset.move.axes[index][property] as number | null : null;
}

function getMaxCurrent(drivers: DriverId[]) {
	let maxCurrent: number | undefined;
	for (const driver of drivers) {
		const boardDefinition = store.data.getBoardDefinition(driver.board);
		if (boardDefinition && (maxCurrent == null || maxCurrent < boardDefinition.motorMaxCurrent)) {
			maxCurrent = boardDefinition.motorMaxCurrent;
		}
	}
	return maxCurrent;
}
</script>
