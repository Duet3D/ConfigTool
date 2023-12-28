<style>
.table-external-drivers input {
	max-width: 6rem;
}
</style>

<template>
	<section id="drivers" class="pt-3">
		<!-- Smart Drivers -->
		<card v-if="smartDrivers.length > 0" title="Smart Drivers" :preview-templates="['config/drivers/smart']"
			  url-title="Tuning Stepper Motor Drivers"
			  url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Motors_tuning">
			<template #append>
				<table class="table table-striped table-smart-drivers mb-0">
					<colgroup>
						<col style="width: auto;">
						<col style="width: 15%;">
						<col style="width: 15%;">
						<col style="width: 20%;">
						<col style="width: 16%;">
						<col style="width: 15%;">
						<col style="width: 20%;">
					</colgroup>
					<thead>
						<tr>
							<th class="text-center">
								Driver
							</th>
							<th>
								Type
							</th>
							<th>
								Direction
							</th>
							<th>
								Motor Current
							</th>
							<th>
								Mode
							</th>
							<th>
								StealthChop PWM Threshold
							</th>
							<th>
								StallGuard Threshold
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="driver in smartDrivers">
							<td class="text-center align-middle">
								{{ driver.id }}
							</td>
							<td>
								<select-input title="Type of this driver. This is unapplicable for on-board drivers" :required="false"
											  v-model="driver.type" :options="driverTypeOptions" :preset="ConfigDriverType.none"
												:disabled="(!!store.data.boardDefinition?.stm?.stepper.driverType)" />
							</td>
							<td>
								<select-input title="Movement direction of this driver" :required="false"
											  v-model="driver.forwards" :options="directionOptions" :preset="true" />
							</td>
							<td>
								<number-input title="Peak current for mapped drivers (not RMS). If this setting is not available, map this driver to an axis or extruder first"
											  :disabled="!hasMotorsMapped(driver)" :min="0" :max="getMaxCurrent(driver)"
											  :step="100" unit="mA" :model-value="getCurrent(driver)"
											  @update:model-value="setCurrent(driver, $event)"
											  :preset="getPresetCurrent(driver)" />
							</td>
							<td>
								<select-input title="Operation mode of this driver. Defaults to SpreadCycle, may be changed to StealthChop to reduce motor noise"
											  :required="false" v-model="driver.mode" :options="getDriverModes(driver)"
											  :preset="ConfigDriverMode.spreadCycle" />
							</td>
							<td>
								<stealth-chop-calculator :driver="driver" />
							</td>
							<td>
								<number-input title="StallGuard threshold value. Only used for sensorless homing"
											  :min="-64" :max="63" :step="1" v-model="driver.sgThreshold" :preset="0" />
							</td>
						</tr>
					</tbody>
				</table>
			</template>
		</card>

		<!-- Motor Current Reduction -->
		<card v-if="smartDrivers.length > 0" class="mt-3" title="Motor Current Reduction"
			  :preview-templates="['config/drivers/currentReduction']">
			<div class="row">
				<div class="col d-flex align-items-center">
					<check-input label="Reduce motor currents when idle" title="Reduce motor current on inactivity"
								 :model-value="store.data.move.idle.timeout > 0"
								 @update:model-value="store.data.move.idle.timeout = $event ? 30 : 0"
								 :preset="store.preset.move.idle.timeout > 0" />
				</div>
				<div class="col">
					<number-input label="Idle current percentage"
								  title="Motor current will be reduced to this percentage on inactivity"
								  :disabled="store.data.move.idle.timeout <= 0" v-model="store.data.move.idle.factor"
								  :preset="store.preset.move.idle.factor" :factor="100" unit="%" :min="0" :max="100"
								  :step="1" />
				</div>
				<div class="col">
					<number-input label="Idle timeout"
								  title="Maximum time for the machine to idle before current reduction is applied"
								  :disabled="store.data.move.idle.timeout <= 0" v-model="store.data.move.idle.timeout"
								  :preset="store.preset.move.idle.timeout" unit="s" />
				</div>
			</div>
		</card>

		<!-- External Drivers -->
		<card v-if="externalDrivers.length > 0" class="mt-3" title="External Drivers"
			  :preview-templates="['config/drivers/external']" url-title="Connecting External Drivers"
			  url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Motors_connecting_external">
			<template #append>
				<table class="table table-striped table-external-drivers mb-0">
					<thead>
						<tr>
							<th class="text-center">
								Driver
							</th>
							<th>
								Direction
							</th>
							<th>
								Enable Polarity
							</th>
							<th>
								Min. Step Pulse
							</th>
							<th>
								Min. Step Interval
							</th>
							<th>
								Dir. Setup Time
							</th>
							<th>
								Dir. Hold Time
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="driver in externalDrivers">
							<td class="text-center align-middle">
								{{ driver.id }}
							</td>
							<td>
								<select-input title="Movement direction of this driver" :required="false"
											  v-model="driver.forwards" :options="directionOptions" :preset="true" />
							</td>
							<td>
								<select-input title="Driver enable polarity of this driver" :required="false"
											  v-model="driver.external.enablePolarity" :options="polarityOptions"
											  :preset="false" />
							</td>
							<td>
								<number-input title="Minimum time for each step pulse" :min="0.1" :step="0.1" unit="µs"
											  v-model="driver.external.minStepPulse" :preset="5" />
							</td>
							<td>
								<number-input title="Minimum step interval" :min="0.1" :step="0.1" unit="µs"
											  v-model="driver.external.minStepInterval" :preset="5" />
							</td>
							<td>
								<number-input title="Time needed to set up the direction pin level" :min="0" :step="0.1"
											  unit="µs" v-model="driver.external.dirSetupTime" :preset="10" />
							</td>
							<td>
								<number-input title="Time to hold the direction pin level" :min="0" :step="0.1"
											  unit="µs" v-model="driver.external.holdTime" :preset="0" />
							</td>
						</tr>
					</tbody>
				</table>
			</template>
		</card>

		<!-- Closed Loop Drivers -->
		<card v-if="closedLoopDrivers.length > 0" class="mt-3" title="Closed Loop Drivers"
			  :preview-templates="['config/drivers/closedLoop']" url-title="Tuning Closed-Loop Motor Drivers"
			  url="https://docs.duet3d.com/en/User_manual/Tuning/Duet_3_1HCL_tuning">
			<template #append>
				<table class="table table-striped table-closed-loop-drivers mb-0">
					<thead>
						<tr>
							<th class="text-center">
								Driver
							</th>
							<th>
								Encoder Type
							</th>
							<th>
								Encoder Counts per Full Step
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="driver in closedLoopDrivers">
							<td class="text-center align-middle">
								{{ driver.id }}
							</td>
							<td>
								<select-input title="Encoder type used for closed-loop operation" :required="false"
											  v-model="driver.closedLoop.encoderType" :options="encoderTypeOptions"
											  :preset="ConfigDriverClosedLoopEncoderType.none" />
							</td>
							<td>
								<number-input title="Encoder counts per full step" :min="1" :step="1"
											  :disabled="driver.closedLoop.encoderType === ConfigDriverClosedLoopEncoderType.none"
											  v-model="driver.closedLoop.countsPerFullStep" :preset="5" />
							</td>
						</tr>
					</tbody>
				</table>
			</template>
		</card>
	</section>
</template>

<script setup lang="ts">
import { computed } from "vue";

import Card from "@/components/Card.vue";
import StealthChopCalculator from "@/components/calculators/StealthChopCalculator.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";
import { ConfigDriver, ConfigDriverClosedLoopEncoderType, ConfigDriverMode, ConfigDriverType } from "@/store/model/ConfigDriver";
import { ExpansionBoards, getExpansionBoardDefinition } from "@/store/ExpansionBoards";
import { ConfigSectionType } from "@/store/sections";

const store = useStore();

// General
const directionOptions: Array<SelectOption> = [
	{
		text: "Forwards",
		value: true
	},
	{
		text: "Backwards",
		value: false
	}
];

const driverTypeOptions: Array<SelectOption> = [
	{
		text: "None",
		value: ConfigDriverType.none
	},
	{
		text: "StepDir",
		value: ConfigDriverType.stepDir
	},
	{
		text: "TMC2208",
		value: ConfigDriverType.tmc2208
	},
	{
		text: "TMC2209",
		value: ConfigDriverType.tmc2209
	},
	{
		text: "TMC2240",
		value: ConfigDriverType.tmc2240
	},
	{
		text: "TMC2660",
		value: ConfigDriverType.tmc2660
	},
	{
		text: "TMC5160",
		value: ConfigDriverType.tmc5160
	}
];

// Smart Drivers
const smartDrivers = computed(() => {
	const result = [];
	for (const driver of store.data.configTool.drivers) {
		if (!driver.id.board && store.data.boardDefinition) {
			if ((driver.id.driver < store.data.boardDefinition.numDrivers && store.data.boardDefinition.hasSmartDrivers) ||
				(driver.id.driver >= store.data.boardDefinition.numDrivers && store.data.configTool.expansionBoard !== null && ExpansionBoards[store.data.configTool.expansionBoard].hasSmartDrivers)) {
				result.push(driver);
			}
		} else {
			const board = store.data.boards.find(board => board.canAddress === driver.id.board);
			if (board) {
				const boardDefinition = getExpansionBoardDefinition(board);
				if (boardDefinition?.hasSmartDrivers) {
					result.push(driver);
				}
			}
		}
	}
	return result;
});

function getDriverModes(driver: ConfigDriver) {
	const options: Array<SelectOption> = [
		{
			text: "SpreadCycle",
			value: ConfigDriverMode.spreadCycle
		},
		{
			text: "StealthChop",
			value: ConfigDriverMode.stealthChop
		}
	];

	if (store.data.getBoardDefinition(driver.id.board)?.hasClosedLoopDrivers) {
		options.push({
			text: "Closed Loop",
			value: ConfigDriverMode.closedLoop
		});
	}

	return options;
}

function hasMotorsMapped(driver: ConfigDriver) {
	for (const axis of store.data.move.axes) {
		if (axis.drivers.some(item => item.equals(driver.id))) {
			return true;
		}
	}

	for (const extruder of store.data.move.extruders) {
		if (extruder.driver?.equals(driver.id)) {
			return true;
		}
	}

	return false;
}

function getMaxCurrent(driver: ConfigDriver) {
	return store.data.getBoardDefinition(driver.id.board)?.motorMaxCurrent;
}

function getCurrent(driver: ConfigDriver) {
	for (const axis of store.data.move.axes) {
		if (axis.drivers.some(item => item.equals(driver.id))) {
			return axis.current;
		}
	}

	for (const extruder of store.data.move.extruders) {
		if (extruder.driver?.equals(driver.id)) {
			return extruder.current;
		}
	}

	return NaN;
}

function setCurrent(driver: ConfigDriver, value: number) {
	for (const axis of store.data.move.axes) {
		if (axis.drivers.some(item => item.equals(driver.id))) {
			axis.current = value;
			return;
		}
	}

	for (const extruder of store.data.move.extruders) {
		if (extruder.driver?.equals(driver.id)) {
			extruder.current = value;
			return;
		}
	}
}

function getPresetCurrent(driver: ConfigDriver) {
	for (const axis of store.preset.move.axes) {
		if (axis.drivers.some(item => item.equals(driver.id))) {
			return axis.current;
		}
	}

	for (const extruder of store.preset.move.extruders) {
		if (extruder.driver?.equals(driver.id)) {
			return extruder.current;
		}
	}

	return undefined;
}

// External Drivers
const externalDrivers = computed(() => {
	const result = [];
	for (const driver of store.data.configTool.drivers) {
		if (!driver.id.board && store.data.boardDefinition) {
			if ((driver.id.driver < store.data.boardDefinition.numDrivers && !store.data.boardDefinition.hasSmartDrivers) ||
				(driver.id.driver >= store.data.boardDefinition.numDrivers && store.data.configTool.expansionBoard !== null && !ExpansionBoards[store.data.configTool.expansionBoard].hasSmartDrivers)) {
				result.push(driver);
			}
		} else {
			const board = store.data.boards.find(board => board.canAddress === driver.id.board);
			if (board) {
				const boardDefinition = getExpansionBoardDefinition(board);
				if (boardDefinition && !boardDefinition.hasSmartDrivers) {
					result.push(driver);
				}
			}
		}
	}
	return result;
});

const polarityOptions: Array<SelectOption> = [
	{
		text: "Active Low",
		value: false
	},
	{
		text: "Active High",
		value: true
	}
];

// Closed Loop Drivers
const closedLoopDrivers = computed(() => {
	const result = [];
	for (const driver of store.data.configTool.drivers) {
		const boardDefinition = store.data.getBoardDefinition(driver.id.board);
		if (boardDefinition?.hasClosedLoopDrivers) {
			result.push(driver);
		}
	}
	return result;
});

const encoderTypeOptions: Array<SelectOption> = [
	{
		text: "None",
		value: ConfigDriverClosedLoopEncoderType.none
	},
	{
		text: "Quadrature encoder on linear axis",
		value: ConfigDriverClosedLoopEncoderType.quadratureOnAxis
	},
	{
		text: "Quadrature encoder on motor shaft",
		value: ConfigDriverClosedLoopEncoderType.quadratureOnMotor
	},
	{
		text: "Magnetic encoder on motor shaft",
		value: ConfigDriverClosedLoopEncoderType.magnetic
	}
];
</script>
