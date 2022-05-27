<style scoped>
.table-endstops tr > th:first-child,
.table-endstops tr > th:nth-child(2) {
	text-align: center;
}
.table-endstops tr > td:first-child,
.table-endstops tr > td:nth-child(2) {
	text-align: center;
	vertical-align: middle;
}
</style>

<template>
	<scroll-item anchor="Endstops" title="Endstops">
		<template #body>
			<table class="table table-striped table-endstops mb-0">
				<thead>
					<tr>
						<th>
							Driver
						</th>
						<th>
							Axis
						</th>
						<th>
							Endstop Type
						</th>
						<th>
							Endstop Location
						</th>
						<th colspan="2">
							Homing Speed
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(configDriver, index) in mappedDrivers">
						<td>
							{{ configDriver.id }}
						</td>
						<td>
							{{ getMappedAxis(configDriver.id).letter }}
						</td>
						<td>
							<select-input title="Type of this endstop"
							              :model-value="getEndstopType(configDriver)" @update:model-value="setEndstopType(configDriver, $event)"
							              :options="getEndstopTypeOptions(configDriver.id.board)" :preset="getPresetEndstopType(index)" />
						</td>
						<td>
							<select-input title="Location of this endstop"
							              :disabled="configDriver.endstop === null"
							              :model-value="configDriver.endstop && configDriver.endstop.highEnd" @update:model-value="setEndstopLocation(configDriver, $event)"
							              :options="EndstopLocations" :preset="getPresetEndstopLocation(index)" />
						</td>
						<td>
							<number-input title="First homing speed"
							              :disabled="configDriver.endstop === null" unit="mm/s"
							              :model-value="configDriver.endstop ? configDriver.endstop.homingSpeeds[0] : 0" @update:model-value="setHomingSpeed(configDriver, 0, $event)" />
						</td>
						<td>
							<number-input title="Second homing speed"
							              :disabled="configDriver.endstop === null" unit="mm/s"
							              :model-value="configDriver.endstop ? configDriver.endstop.homingSpeeds[1] : 0" @update:model-value="setHomingSpeed(configDriver, 1, $event)" />
						</td>
					</tr>
				</tbody>
			</table>
		</template>
	</scroll-item>
</template>

<script lang="ts">
import NumberInput from "@/components/inputs/NumberInput.vue";
import type { SelectOption } from "@/components/inputs/SelectInput.vue";

const EndstopLocations: Array<SelectOption> = [
	{
		text: "High end",
		value: true
	},
	{
		text: "Low end",
		value: false
	}
];
</script>

<script setup lang="ts">
import type { DriverId, EndstopType } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { ConfigDriver, ConfigDriverEndstop } from "@/store/model/ConfigDriver";

const store = useStore();

const mappedDrivers = computed(() => store.data.configTool.drivers.filter(driver => {
	return store.data.move.axes.some(axis => axis.drivers.some(driverId => driver.id.equals(driverId)));
}));

function getMappedAxis(id: DriverId) {
	return store.data.move.axes.find(axis => axis.drivers.some(driverId => id.equals(driverId)))
}

// Endstop Type
function getEndstopType(driver: ConfigDriver): EndstopType | null {
	return (driver.endstop !== null) ? driver.endstop.type : null;
}

function setEndstopType(driver: ConfigDriver, type: EndstopType | null): void {
	if (type === null) {
		driver.endstop = null;
	} else {
		if (driver.endstop === null) {
			driver.endstop = new ConfigDriverEndstop();
		}
		driver.endstop.type = type;
	}
}

function getPresetEndstopType(index: number): EndstopType | null {
	return (index < store.preset.sensors.endstops.length && store.preset.sensors.endstops[index] !== null) ? store.preset.sensors.endstops[index]!.type : null;
}

function getEndstopTypeOptions(board: number | null): Record<string, Array<SelectOption>> {
	const options: Record<string, Array<SelectOption>> = {};

	// Switches
	const switchOptions: Array<SelectOption> = [];
	for (const port of store.data.configTool.getPortsByBoard(board)) {
		// TODO
	}

	// Z-Probes
	const zProbeOptions: Array<SelectOption> = [];
	for (const probeIndex of store.data.configTool.getProbesByBoard(board)) {
		if (store.data.sensors.probes[probeIndex] !== null) {
			zProbeOptions.push({
				text: `Z-Probe #${probeIndex}}`,
				value: probeIndex
			});
		}
	}
	if (zProbeOptions.length > 0) {
		options["Z-Probes"] = zProbeOptions;
	}

	// Other
	options["Other"] = [
		{
			text: "None",
			value: null
		}
	];

	return options;
}

// Endstop Location
function getPresetEndstopLocation(index: number): boolean {
	return (index < store.preset.sensors.endstops.length && store.preset.sensors.endstops[index] !== null) ? store.preset.sensors.endstops[index]!.highEnd : false;
}

function setEndstopLocation(driver: ConfigDriver, highEnd: boolean): void {
	if (driver.endstop !== null) {
		driver.endstop.highEnd = highEnd;
	}
}

// Homing Speeds
function setHomingSpeed(driver: ConfigDriver, index: number, speed: number): void {
	if (driver.endstop !== null) {
		driver.endstop.homingSpeeds[index] = speed;
	}
}
</script>
