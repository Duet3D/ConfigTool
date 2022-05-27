<style>
.table-smart-drivers tr > th:first-child,
.table-smart-drivers tr > td:first-child,
.table-external-drivers tr > th:first-child,
.table-external-drivers tr > td:first-child,
.table-closed-loop-drivers tr > th:first-child,
.table-closed-loop-drivers tr > td:first-child {
	text-align: center;
	vertical-align: middle;
}
.table-external-drivers input {
	max-width: 6rem;
}
</style>

<template>
	<div class="pt-3">
		<a id="Drivers" data-anchor="true"></a>

		<!-- Smart Drivers -->
		<div v-if="smartDrivers.length > 0" class="card">
			<div class="card-header d-flex justify-content-between">
				Smart Drivers
				<a href="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Motors_tuning" target="_blank">
					<i class="bi-info-circle"></i>
					Tuning Stepper Motor Drivers
				</a>
			</div>

			<table class="table table-striped table-smart-drivers mb-0">
				<thead>
					<tr>
						<th>
							Driver
						</th>
						<th>
							Direction
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
						<td>
							{{ driver.id }}
						</td>
						<td>
							<select-input title="Movement direction of this driver"
							              :required="false"
							              v-model="driver.forwards" :options="directionOptions" :preset="true" />
						</td>
						<td>
							<select-input title="Operation mode of this driver. Defaults to SpreadCycle, may be changed to StealthChop to reduce motor noise"
							              :required="false"
							              v-model="driver.mode" :options="getDriverModes(driver)" :preset="ConfigDriverMode.spreadCycle" />
						</td>
						<td>
							<stealth-chop-calculator :driver="driver" />
						</td>
						<td>
							<number-input title="StallGuard threshold value. Only used for sensorless homing"
							              :min="-64" :max="63" :step="1"
							              v-model="driver.sgThreshold" :preset="0" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- External Drivers -->
		<div v-if="externalDrivers.length > 0" class="card mt-3">
			<div class="card-header d-flex justify-content-between">
				External Drivers
				<a href="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Motors_connecting_external" target="_blank">
					<i class="bi-info-circle"></i>
					Connecting External Drivers
				</a>
			</div>
			<table class="table table-striped table-external-drivers mb-0">
				<thead>
					<tr>
						<th>
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
						<td>
							{{ driver.id }}
						</td>
						<td>
							<select-input title="Movement direction of this driver"
							              :required="false"
							              v-model="driver.forwards" :options="directionOptions" :preset="true" />
						</td>
						<td>
							<select-input title="Driver enable polarity of this driver"
							              :required="false"
							              v-model="driver.external.enablePolarity" :options="polarityOptions" :preset="false" />
						</td>
						<td>
							<number-input title="Minimum time for each step pulse"
							              :min="0.1" :step="0.1" unit="µs"
							              v-model="driver.external.minStepPulse" :preset="5" />
						</td>
						<td>
							<number-input title="Minimum step interval"
							              :min="0.1" :step="0.1" unit="µs"
							              v-model="driver.external.minStepInterval" :preset="5" />
						</td>
						<td>
							<number-input title="Time needed to set up the direction pin level"
							              :min="0" :step="0.1" unit="µs"
							              v-model="driver.external.dirSetupTime" :preset="10" />
						</td>
						<td>
							<number-input title="Time to hold the direction pin level"
							              :min="0" :step="0.1" unit="µs"
							              v-model="driver.external.holdTime" :preset="0" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Closed Loop Drivers -->
		<div v-if="closedLoopDrivers.length > 0" class="card mt-3">
			<div class="card-header d-flex justify-content-between">
				Closed Loop Drivers
				<a href="https://docs.duet3d.com/en/User_manual/Tuning/Duet_3_1HCL_tuning" target="_blank">
					<i class="bi-info-circle"></i>
					Tuning Closed-Loop Motor Drivers
				</a>
			</div>

			<table class="table table-striped table-closed-loop-drivers mb-0">
				<thead>
					<tr>
						<th>
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
						<td>
							{{ driver.id }}
						</td>
						<td>
							<select-input title="Encoder type used for closed-loop operation"
							              :required="false"
							              v-model="driver.closedLoop.encoderType" :options="encoderTypeOptions" :preset="ConfigDriverClosedLoopEncoderType.none" />
						</td>
						<td>
							<number-input title="Encoder counts per full step"
							              :min="1" :step="1"
							              :disabled="driver.closedLoop.encoderType === ConfigDriverClosedLoopEncoderType.none"
							              v-model="driver.closedLoop.countsPerFullStep" :preset="5" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup lang="ts">
import StealthChopCalculator from "@/components/calculators/StealthChopCalculator.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";
import { ConfigDriver, ConfigDriverClosedLoopEncoderType, ConfigDriverMode } from "@/store/model/ConfigDriver";
import { ExpansionBoards, getExpansionBoardDefinition } from "@/store/ExpansionBoards";
import { computed } from "vue";

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
