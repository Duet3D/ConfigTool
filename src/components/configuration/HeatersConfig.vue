<template>
	<scroll-item anchor="Heaters">
		<template #title>
			Heaters
			<button class="btn btn-sm btn-primary" :disabled="!canAddHeater" @click.prevent="addHeater">
				<i class="bi-plus-circle"></i>
				Add Heater
			</button>
		</template>
		<template #body>
			<table class="table table-striped mb-0">
				<colgroup>
					<col style="width: 12%;">
					<col style="width: 25%;">
					<col style="width: 18%;">
					<col style="width: 25%;">
					<col style="width: 20%;">
					<col style="width: auto;">
				</colgroup>
				<thead>
					<tr>
						<th class="text-center">
							Heater
						</th>
						<th>
							Sensor
						</th>
						<th>
							Control Method
						</th>
						<th>
							Output Ports
						</th>
						<th>
							Max Temperature
						</th>
						<th>
							<!-- Remove -->
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="(heater, index) in store.data.heat.heaters">
						<template v-if="heater !== null">
							<!-- Heater -->
							<tr>
								<td class="text-center align-middle">
									<select-input title="Number of this heater" :model-value="index"
												  @update:model-value="setHeaterNumber(index, $event)"
												  :options="getHeaterNumbers(index)" />
								</td>
								<td>
									<select-input title="Sensor mapped to this heater" v-model="heater.sensor"
												  :preset="getPresetHeaterValue(index, 'sensor')"
												  :options="sensorOptions" />
								</td>
								<td>
									<select-input title="Control method of this heater. It is recommended to use PID control for low to medium-powered heaters (nozzles) and bang-bang for high-powered heaters (heated beds)"
												  v-model="heater.model.pid.used" :preset="getPresetHeaterPid(index)"
												  :options="HeaterControlOptions" :required="false">
										<template #append>
											<button type="button" class="btn"
													:class="getHeaterModelClasses(heater.model)"
													v-title="'Configure model parameters of this heater'"
													@click.prevent="configureHeaterModel(index, heater.model)">
												<i class="bi bi-gear"></i>
											</button>
										</template>
									</select-input>
								</td>
								<td>
									<port-input title="Output port of this heater"
												:board="getSensorBoard(heater.sensor)"
												:function="ConfigPortFunction.heater" :index="index">
										<template #append>
											<button type="button" class="btn btn-outline-success"
													:disabled="!canAddHeaterPort(index)"
													v-title="'Add extra output port to this heater'"
													@click.prevent="pendingHeaterPorts.add(index)">
												<i class="bi bi-plus-circle"></i>
											</button>
										</template>
									</port-input>
								</td>
								<td>
									<number-input title="Maximum temperature of this heater"
												  :disabled="!heater.monitors.some(monitor => monitor.condition === HeaterMonitorCondition.tooHigh)"
												  :model-value="getHeaterMaxTemperature(heater)"
												  @update:model-value="setHeaterMaxTemperature(heater, $event)"
												  :preset="getPresetHeaterValue(index, 'max')" :min="-273" :max="1999"
												  :step="0.1" unit="°C">
										<template #prepend>
											<button type="button" class="btn"
													:class="getHeaterMonitorClasses(heater.monitors)"
													v-title="'Configure monitors of this heater'"
													@click.prevent="configureHeaterMonitors(index, heater.monitors)">
												<i class="bi bi-gear"></i>
											</button>
										</template>
									</number-input>
								</td>
								<td>
									<button class="btn btn-sm btn-danger mt-1"
											@click.prevent="deleteHeater(index)">
										<i class="bi-trash"></i>
									</button>
								</td>
							</tr>
							<!-- Additional Heater Ports -->
							<tr v-for="(_, portIndex) in getAdditionalHeaterPorts(index)">
								<td></td>
								<td></td>
								<td></td>
								<td>
									<port-input :board="getSensorBoard(heater.sensor)"
												:function="ConfigPortFunction.heater" :index="index"
												:secondary-index="portIndex + 1">
										<template #append>
											<button type="button" class="btn btn-outline-danger"
													v-title="'Delete this heater port'"
													@click.prevent="deleteHeaterPort(index, portIndex + 1)">
												<i class="bi bi-trash"></i>
											</button>
										</template>
									</port-input>
								</td>
								<td></td>
								<td></td>
							</tr>
							<!-- Heater Port to be added -->
							<tr v-if="pendingHeaterPorts.has(index)">
								<td></td>
								<td></td>
								<td></td>
								<td>
									<port-input :board="getSensorBoard(heater.sensor)"
												:function="ConfigPortFunction.heater" :index="index"
												:secondary-index="getAdditionalHeaterPorts(index).length + 1"
												@portSet="pendingHeaterPorts.delete(index)">
										<template #append>
											<button type="button" class="btn btn-outline-danger"
													v-title="'Delete this heater port'"
													@click.prevent="pendingHeaterPorts.delete(index)">
												<i class="bi bi-trash"></i>
											</button>
										</template>
									</port-input>
								</td>
								<td></td>
								<td></td>
							</tr>
						</template>
					</template>
				</tbody>
			</table>
			<div v-if="store.data.heat.heaters.some(heater => heater?.model.pid.used)" class="alert alert-info mb-0">
				<i class="bi bi-info-circle"></i>
				Because you have PID heaters configured, it is highly recommended to <a
				   href="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Heaters_tuning"
				   target="_blank">auto-tune</a> these heaters using <a
				   href="https://docs.duet3d.com/en/User_manual/Reference/Gcodes#m303-run-heater-tuning"
				   target="_blank">M303</a>.
			</div>
			<heater-model-dialog v-model="showHeaterModelDialog" :heater-index="heaterModelIndex"
								 :model="heaterModel" />
			<heater-monitors-dialog v-model="showHeaterMonitorsDialog" :heater-index="heaterMonitorIndex"
									:monitors="heaterMonitors" />
		</template>
	</scroll-item>

	<div class="row mt-3">
		<!-- Bed Heaters-->
		<div class="col-6">
			<div class="card">
				<div class="card-header d-flex justify-content-between">
					Bed Heaters
					<button class="btn btn-primary btn-sm">
						<i class="bi bi-plus-circle"></i>
						Add Bed Heater
					</button>
				</div>
				<table class="table table-striped mb-0">
					<thead>
						<th>
							Number
						</th>
						<th>
							Heater
						</th>
					</thead>
					<tbody>
					</tbody>
				</table>
				<div class="alert alert-info mb-0">
					<i class="bi bi-info-circle"></i>
					No Bed Heaters
				</div>
			</div>
		</div>

		<!-- Chamber Heaters-->
		<div class="col-6">
			<div class="card">
				<div class="card-header d-flex justify-content-between">
					Chamber Heaters
					<button class="btn btn-primary btn-sm">
						<i class="bi bi-plus-circle"></i>
						Add Chamber Heater
					</button>
				</div>
				<table class="table table-striped mb-0">
					<thead>
						<th>
							Number
						</th>
						<th>
							Heater
						</th>
					</thead>
					<tbody>
					</tbody>
				</table>
				<div class="alert alert-info mb-0">
					<i class="bi bi-info-circle"></i>
					No Chamber Heaters
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";

const HeaterControlOptions: Array<SelectOption> = [
	{
		text: "PID",
		value: true
	},
	{
		text: "Bang-Bang",
		value: false
	}
];
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Heater, HeaterModel, HeaterMonitor, HeaterMonitorCondition, ModelObject } from "@duet3d/objectmodel";

import ScrollItem from "@/components/ScrollItem.vue";
import HeaterModelDialog from "@/components/dialogs/HeaterModelDialog.vue";
import HeaterMonitorsDialog from "@/components/dialogs/HeaterMonitorsDialog.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { ConfigPort, ConfigPortFunction } from "@/store/model/ConfigPort";

const store = useStore();

// Heater management
const canAddHeater = computed(() => store.data.heat.heaters.length < store.data.limits.heaters!);
function addHeater() {
	const heater = new Heater();
	if (store.preset.heat.heaters.length > store.data.heat.heaters.length) {
		heater.update(store.preset.heat.heaters[store.data.heat.heaters.length])
	} else if (store.preset.heat.heaters.length > 1) {
		heater.update(store.preset.heat.heaters[1]);
	} else if (store.preset.heat.heaters.length > 0) {
		heater.update(store.preset.heat.heaters[0]);
	}
	store.data.heat.heaters.push(heater);
}

function deleteHeater(index: number) {
	store.data.heat.heaters.splice(index, 1);
}

// Heaters
function getHeaterNumbers(index: number) {
	const options: Array<SelectOption> = [];
	for (let i = 0; i < (store.data.limits.heaters ?? 0); i++) {
		options.push({
			text: i.toString(),
			value: i,
			disabled: (i !== index) && (i < store.data.heat.heaters.length) && (store.data.heat.heaters[i] !== null)
		});
	}
	return options;
}

function setHeaterNumber(index: number, newIndex: number) {
	for (const port of store.data.configTool.ports) {
		if (port.function === ConfigPortFunction.heater && port.index === index) {
			// Move associated ports to the new index
			port.index = newIndex;
		}
	}

	// Ensure we have enough items in the heaters array
	while (store.data.heat.heaters.length < newIndex) {
		store.data.heat.heaters.push(null);
	}

	// Move the heater from the old slot to the new one
	store.data.heat.heaters[newIndex] = store.data.heat.heaters[index];
	store.data.heat.heaters[index] = null;

	// Clean up unused items at the end
	while (store.data.heat.heaters[store.data.heat.heaters.length - 1] === null) {
		store.data.heat.heaters.pop();
	}
}

const sensorOptions = computed(() => {
	const result: Array<SelectOption> = [];
	for (let i = 0; i < store.data.sensors.analog.length; i++) {
		if (store.data.sensors.analog[i] !== null) {
			result.push({
				text: !!store.data.sensors.analog[i]?.name ? `${store.data.sensors.analog[i]!.name} (Sensor #${i})` : `Sensor #${i}`,
				value: i
			})
		}
	}
	return result;
});

function getPresetHeaterValue<K extends keyof Heater>(index: number, key: K) {
	return (index < store.preset.heat.heaters.length && store.preset.heat.heaters[index] !== null) ? store.preset.heat.heaters[index]![key] : null;
}

function getPresetHeaterPid(index: number) {
	return (index < store.preset.heat.heaters.length && store.preset.heat.heaters[index] !== null) ? store.preset.heat.heaters[index]!.model.pid.used : (index === 0);
}

function getSensorBoard(sensor: number) {
	for (const port of store.data.configTool.ports) {
		if ((port.function === ConfigPortFunction.thermistor || port.function === ConfigPortFunction.spiCs) && port.index === sensor) {
			return port.canBoard;
		}
	}
	return undefined;
}

function getHeaterMaxTemperature(heater: Heater) {
	for (const monitor of heater.monitors) {
		if (monitor.condition === HeaterMonitorCondition.tooHigh) {
			return monitor.limit!;
		}
	}
	return NaN;
}

function setHeaterMaxTemperature(heater: Heater, temperature: number) {
	heater.max = temperature;
	for (const monitor of heater.monitors) {
		if (monitor.condition === HeaterMonitorCondition.tooHigh) {
			monitor.limit = temperature;
			break;
		}
	}
}

// Heater config dialogs
const showHeaterModelDialog = ref(false), heaterModelIndex = ref(-1), heaterModel = ref<HeaterModel | null>(null);
function configureHeaterModel(index: number, model: HeaterModel) {
	heaterModelIndex.value = index;
	heaterModel.value = model;
	showHeaterModelDialog.value = true;
}
function getHeaterModelClasses(model: HeaterModel) {
	let isValid = isFinite(model.heatingRate) && isFinite(model.deadTime) && isFinite(model.coolingExp) &&
		isFinite(model.coolingRate) && isFinite(model.fanCoolingRate) && isFinite(model.standardVoltage) && isFinite(model.maxPwm);
	if (model.pid.used && model.pid.overridden) {
		isValid = isValid && isFinite(model.pid.p) && isFinite(model.pid.i) && isFinite(model.pid.d);
	}
	return isValid ? "btn-outline-secondary" : "btn-danger is-invalid";
}

const showHeaterMonitorsDialog = ref(false), heaterMonitorIndex = ref(-1), heaterMonitors = ref<Array<HeaterMonitor> | null>(null);
function configureHeaterMonitors(index: number, monitors: Array<HeaterMonitor>) {
	heaterMonitorIndex.value = index;
	heaterMonitors.value = monitors;
	showHeaterMonitorsDialog.value = true;
}
function getHeaterMonitorClasses(monitors: Array<HeaterMonitor>) {
	let isValid = true;
	for (const monitor of monitors) {
		if (monitor.condition !== HeaterMonitorCondition.disabled && (monitor.action === null || !isFinite(monitor.limit!))) {
			isValid = false;
			break;
		}
	}
	return isValid ? "btn-outline-secondary" : "btn-danger is-invalid";
}

// Heater port management
const pendingHeaterPorts = ref(new Set<number>());

function canAddHeaterPort(heaterIndex: number) {
	if (pendingHeaterPorts.value.has(heaterIndex)) {
		return false;
	}

	let numPorts = 0;
	for (const port of store.data.configTool.ports) {
		if (port.function === ConfigPortFunction.heater && port.index === heaterIndex) {
			numPorts++;
		}
	}
	return numPorts < store.data.limits.heaters!;
}

function getAdditionalHeaterPorts(heaterIndex: number) {
	const result: Array<ConfigPort> = [];
	for (const port of store.data.configTool.ports) {
		if (port.function === ConfigPortFunction.heater && port.index === heaterIndex) {
			result.push(port);
		}
	}
	return result.slice(1);
}

function deleteHeaterPort(heaterIndex: number, index: number) {
	let secondaryIndex = 0;
	for (const port of store.data.configTool.ports) {
		if (port.function === ConfigPortFunction.heater && port.index === heaterIndex) {
			if (secondaryIndex === index) {
				store.data.configTool.assignPort(port.toString(), null, heaterIndex);
				break;
			}
			secondaryIndex++;
		}
	}
}
</script>
