<template>
	<scroll-item id="endstops" title="Endstops" :preview-templates="previewTemplates" :preview-options="previewOptions"
				 url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Sensors_endstops"
				 url-title="Connecting Endstops">
		<template #body>
			<table class="table table-striped mb-0">
				<colgroup>
					<col style="width: auto;">
					<col style="width: auto;">
					<col style="width: 22%;">
					<col style="width: 23%;">
					<col style="width: 20%;">
					<col style="width: 35%;">
				</colgroup>
				<thead>
					<tr>
						<th class="text-center">
							Axis
						</th>
						<th class="text-center">
							Driver
						</th>
						<th>
							Endstop Type
						</th>
						<th>
							Endstop Port
						</th>
						<th>
							Endstop Location
						</th>
						<th>
							Homing Speeds
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="(axis, axisIndex) in store.data.move.axes">
						<tr v-for="(configDriver, configDriverIndex) in getConfigDrivers(axis)">
							<td class="text-center align-middle">
								{{ axis.letter }}
							</td>
							<td class="text-center align-middle">
								{{ configDriver.id }}
							</td>
							<td>
								<select-input v-if="configDriverIndex === 0" title="Type of this endstop"
											  :model-value="getEndstopType(axisIndex)"
											  @update:model-value="setEndstopType(axisIndex, $event)"
											  :options="getEndstopTypeOptions(axis)"
											  :preset="getPresetEndstopType(axisIndex)" />
							</td>
							<td>
								<port-input :function="ConfigPortFunction.endstop" :board="configDriver.id.board"
											:index="configDriver.id.driver"
											:disabled="getEndstopType(axisIndex) !== EndstopType.InputPin"
											title="Input port for this endstop" />
							</td>
							<template v-if="(configDriverIndex === 0) && getEndstopType(axisIndex) !== null">
								<td>
									<select-input title="Location of this endstop"
												  :model-value="getEndstopLocation(axisIndex)"
												  @update:model-value="setEndstopLocation(axisIndex, $event)"
												  :options="EndstopLocationOptions"
												  :preset="getPresetEndstopLocation(axisIndex)" />
								</td>
								<td>
									<homing-speeds-input v-if="getEndstopType(axisIndex) !== null && (axis.letter !== 'Z' || getEndstopType(axisIndex) !== EndstopType.ZProbeAsEndstop)"
														 :speeds="getHomingSpeeds(axis, configDriver)"
														 :preset="getPresetHomingSpeeds(axisIndex)" />
								</td>
							</template>
							<template v-else>
								<td>
									<!-- empty -->
								</td>
								<td>
									<!-- empty -->
								</td>
							</template>
						</tr>
					</template>
				</tbody>
			</table>
		</template>
	</scroll-item>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";
import { computed } from "vue";

const EndstopLocationOptions: Array<SelectOption> = [
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
import { Axis, Endstop, EndstopType, KinematicsName, ProbeType } from "@duet3d/objectmodel";
import type { StoreState } from "pinia";

import ScrollItem from "@/components/ScrollItem.vue";
import HomingSpeedsInput from "@/components/inputs/HomingSpeedsInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import type { ConfigDriver } from "@/store/model/ConfigDriver";
import { ConfigPortFunction } from "@/store/model/ConfigPort";

const store = useStore();

// G-code preview
const previewTemplates = computed(() => {
	const templates = [
		"config/endstops",
		store.data.isDelta ? "homedelta" : "homeall"
	];

	for (let i = 0; i < store.data.move.axes.length; i++) {
		if (store.data.sensors.endstops.length > i && store.data.sensors.endstops[i] !== null) {
			const axis = store.data.move.axes[i];
			if (store.data.canHomeIndividualAxis(axis.letter)) {
				if (/[a-z]/.test(axis.letter)) {
					templates.push(`home'${axis.letter}`);
				} else {
					templates.push(`home${axis.letter.toLowerCase()}`);
				}
			}
		}
	}
	return templates;
});

const previewOptions = computed(() => {
	const options: Array<Record<string, any> | null> = [null, null];
	for (let i = 0; i < store.data.move.axes.length; i++) {
		if (store.data.sensors.endstops.length > i && store.data.sensors.endstops[i] !== null) {
			const axis = store.data.move.axes[i];
			if (store.data.canHomeIndividualAxis(axis.letter)) {
				options.push({
					axis,
					axisIndex: i,
					axisLetter: axis.letter
				});
			}
		}
	}
	return options;
});

// Driver Enumeration
function getConfigDrivers(axis: StoreState<Axis>) {
	const result: Array<ConfigDriver> = [];
	for (const driver of store.data.configTool.drivers) {
		if (axis.drivers.some(axisDriver => axisDriver.equals(driver.id))) {
			result.push(driver);
		}
	}
	return result;
}

// Endstop Type
function getEndstopType(index: number): EndstopType | null {
	return (index < store.data.sensors.endstops.length && store.data.sensors.endstops[index] !== null) ? store.data.sensors.endstops[index]!.type : null;
}

function setEndstopType(index: number, type: EndstopType | null): void {
	if (index < store.data.sensors.endstops.length) {
		if (store.data.sensors.endstops[index]?.type === EndstopType.InputPin) {
			for (const driver of store.data.move.axes[index].drivers) {
				for (const port of store.data.configTool.ports) {
					if (port.function === ConfigPortFunction.endstop && port.equalsBoard(driver.board) && port.index === driver.driver) {
						// Reset mapped endstop ports
						port.function = null;
					}
				}
			}
		}

		if (type === null) {
			store.data.sensors.endstops[index] = null;
		} else {
			if (store.data.sensors.endstops[index] === null) {
				store.data.sensors.endstops[index] = new Endstop();
			}
			store.data.sensors.endstops[index]!.type = type;
		}
	}
}

function getPresetEndstopType(index: number): EndstopType | null {
	return (index < store.preset.sensors.endstops.length && store.preset.sensors.endstops[index] !== null) ? store.preset.sensors.endstops[index]!.type : null;
}

function getEndstopTypeOptions(axis: StoreState<Axis>): Array<SelectOption> {
	// Switches are always supported
	const options: Array<SelectOption> = [
		{
			text: "Switch",
			value: EndstopType.InputPin
		}
	];

	// Probes on remote boards can be selected only if all the drivers are on the same board
	for (let i = 0; i < store.data.sensors.probes.length; i++) {
		const probe = store.data.sensors.probes[i];
		if (probe !== null) {
			let canSelectProbe = true;
			if (probe.type !== ProbeType.none && !axis.drivers.some(axisDriver => axisDriver.board)) {
				canSelectProbe = false;
				for (const port of store.data.configTool.ports) {
					if (port.function === ConfigPortFunction.probeIn && !axis.drivers.some(axisDriver => !port.equalsBoard(axisDriver.board))) {
						canSelectProbe = true;
						break;
					}
				}
			}

			if (canSelectProbe) {
				options.push({
					text: `Probe #${i}`,
					value: EndstopType.ZProbeAsEndstop
				});
			}
		}
	}

	// SG support depends on the corresponding expansion/main board
	if (!store.data.boards.some(board => !store.data.getBoardDefinition(board.canAddress)?.hasSmartDrivers)) {
		options.push({
			text: "Singe Motor Load Detection",
			value: EndstopType.motorStallAny
		});
		options.push({
			text: "Multple Motor Load Detection",
			value: EndstopType.motorStallIndividual
		});
	}

	// No endstop is always possible, too
	options.push({
		text: "None",
		value: null
	});

	return options;
}

// Endstop Location
function getEndstopLocation(axisIndex: number): boolean {
	return (axisIndex < store.data.sensors.endstops.length && store.data.sensors.endstops[axisIndex] !== null) ? store.data.sensors.endstops[axisIndex]!.highEnd : false;
}

function setEndstopLocation(axisIndex: number, highEnd: boolean): void {
	if (axisIndex < store.data.sensors.endstops.length) {
		if (store.data.sensors.endstops[axisIndex] === null) {
			store.data.sensors.endstops[axisIndex] = new Endstop();
		}
		store.data.sensors.endstops[axisIndex]!.highEnd = highEnd;
	}
}

function getPresetEndstopLocation(axisIndex: number): boolean {
	return (axisIndex < store.preset.sensors.endstops.length && store.preset.sensors.endstops[axisIndex] !== null) ? store.preset.sensors.endstops[axisIndex]!.highEnd : false;
}

function getHomingSpeeds(axis: StoreState<Axis>, configDriver: StoreState<ConfigDriver>): Array<number> {
	function getAxisHomingSpeeds(axisLetter: string): Array<number> {
		const axis = store.data.move.axes.find(item => item.letter === axisLetter);
		if (axis && axis.drivers.length > 0) {
			const firstAxisDriver = store.data.configTool.drivers.find(driver => driver.id.equals(axis.drivers[0]));
			if (firstAxisDriver) {
				return firstAxisDriver.homingSpeeds;
			}
		}
		return configDriver.homingSpeeds;
	}

	switch (store.data.move.kinematics.name) {
		case KinematicsName.coreXY:
		case KinematicsName.markForged:
			if (axis.letter === 'X' || axis.letter === 'Y') {
				return getAxisHomingSpeeds('X');
			}
			break;
		case KinematicsName.coreXYUV:
			if (axis.letter === 'X' || axis.letter === 'Y') {
				return getAxisHomingSpeeds('X');
			}
			if (axis.letter === 'U' || axis.letter === 'V') {
				return getAxisHomingSpeeds('U');
			}
			break;
		case KinematicsName.coreXZ:
			if (axis.letter === 'X' || axis.letter === 'Z') {
				return getAxisHomingSpeeds('X');
			}
			break;
		case KinematicsName.delta:
		case KinematicsName.rotaryDelta:
			if (['X', 'Y', 'Z'].includes(axis.letter)) {
				return getAxisHomingSpeeds('X');
			}
			break;
	}
	return configDriver.homingSpeeds;
}

function getPresetHomingSpeeds(axisIndex: number): Array<number> | undefined {
	const presetAxis = (axisIndex < store.preset.move.axes.length && store.preset.move.axes[axisIndex] !== null) ? store.preset.move.axes[axisIndex] : null;
	if (presetAxis !== null) {
		const firstDriver = (presetAxis.drivers.length > 0) ? presetAxis.drivers[0] : null;
		if (firstDriver) {
			for (const driver of store.preset.configTool.drivers) {
				if (driver.id.equals(firstDriver)) {
					return driver.homingSpeeds;
				}
			}
		}
	}
	return undefined;
}
</script>
