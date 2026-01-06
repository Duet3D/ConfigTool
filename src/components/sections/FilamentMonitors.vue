<template>
	<config-section :type="ConfigSectionType.FilamentMonitors" title="Filament Monitors">
		<template #append-title>
			<button class="btn btn-sm btn-primary" :disabled="!canAddMonitor" @click.prevent="addMonitor">
				<i class="bi-plus-circle"></i>
				Add Filament Monitor
			</button>
		</template>
		<template #body>
			<template v-for="(monitor, index) in store.data.sensors.filamentMonitors">
				<div v-if="monitor" class="card m-2">
					<div class="card-header d-flex justify-content-between align-items-center">
						Filament Monitor #{{ index }}
						<button class="btn btn-sm btn-danger" @click.prevent="deleteMonitor(index)">
							<i class="bi-trash"></i>
						</button>
					</div>
					<div class="card-body">
						<div class="row g-3">
							<!-- Generic Filament Monitor Options -->
							<div class="col-2">
								<select-input label="Extruder" title="Extruder drive mapped to this filament monitor" :model-value="index"
											  @update:model-value="setMonitorNumber(index, $event)"
											  :options="getExtruders(index)" />
							</div>
							<div class="col-3">
								<select-input label="Type" title="Type of this filament monitor" :model-value="monitor.type"
											  @update:model-value="setMonitorType(index, $event)"
											  :options="FilamentMonitorOptions"
											  :preset="getPresetMonitorValue(index, 'type')" />
							</div>
							<div class="col-3">
								<port-input label="Input Port" title="Input port for this sensor"
											:function="ConfigPortFunction.filamentMonitor"
											:index="index" />
							</div>
							<div class="col-4">
								<select-input label="Enable Mode" title="Filament monitor enable mode" v-model="monitor.enableMode"
											  :options="EnableModeOptions"
											  :preset="getPresetMonitorValue(index, 'enableMode')" />
							</div>

							<!-- Rotating Magnet-->
							<template v-if="monitor.type === FilamentMonitorType.rotatingMagnet">
								<div class="col-3">
									<number-input label="Min Detection %" title="Minimum detection percentage allowed before a filament error is triggered" unit="%" :min="0" :max="500" :step="1"
												  v-model="(monitor as RotatingMagnetFilamentMonitor).configured.percentMin" />
								</div>
								<div class="col-3">
									<number-input label="Max Detection %" title="Maximum detection percentage allowed before a filament error is triggered" unit="%" :min="0" :max="500" :step="1"
												  v-model="(monitor as RotatingMagnetFilamentMonitor).configured.percentMax" />
								</div>
								<div class="col-3">
									<number-input label="Min Extrusion Length" title="Minimum extrusion length before a commanded/measured comparison is done" unit="mm" :min="0.01"
												  v-model="(monitor as RotatingMagnetFilamentMonitor).configured.sampleDistance" />
								</div>
								<div class="col-3">
									<number-input label="MM per Revolution" title="Millimetres of filament per revolution of the rotating magnet" unit="mm"
												  v-model="(monitor as RotatingMagnetFilamentMonitor).configured.mmPerRev" />
								</div>
								<div class="col-3">
									<check-input label="Check All Moves" title="Check all extruder motion. If disabled, only extruding moves with combined motion are monitored"
												 v-model="(monitor as RotatingMagnetFilamentMonitor).configured.allMoves" />
								</div>
							</template>

							<!-- Laser -->
							<template v-else-if="monitor.type === FilamentMonitorType.laser">
								<div class="col-3">
									<number-input label="Min Detection %" title="Minimum detection percentage allowed before a filament error is triggered" unit="%" :min="0" :max="500" :step="1"
												  v-model="(monitor as LaserFilamentMonitor).configured.percentMin" />
								</div>
								<div class="col-3">
									<number-input label="Max Detection %" title="Maximum detection percentage allowed before a filament error is triggered" unit="%" :min="0" :max="500" :step="1"
												  v-model="(monitor as LaserFilamentMonitor).configured.percentMax" />
								</div>
								<div class="col-3">
									<number-input label="Min Extrusion Length" title="Minimum extrusion length before a commanded/measured comparison is done" unit="mm" :min="0.01"
												  v-model="(monitor as LaserFilamentMonitor).configured.sampleDistance" />
								</div>
								<div class="col-3">
									<number-input label="Calibration Factor" title="Filament movement reported by the laser sensor is multiplied by this value before being compared with the commanded extrusion. Intended for use with sensors that use the laser to read movement of a wheel that is turned by the filament" :min="0.01" :step="0.01"
												  v-model="(monitor as LaserFilamentMonitor).configured.calibrationFactor" />
								</div>
								<div class="col-3">
									<check-input label="Check All Moves" title="Check all extruder motion. If disabled, only extruding moves with combined motion are monitored"
												 v-model="(monitor as LaserFilamentMonitor).configured.allMoves" />
								</div>
							</template>

							<!-- Pulsed -->
							<template v-else-if="monitor.type === FilamentMonitorType.pulsed">
								<div class="col-3">
									<number-input label="Min Detection %" title="Minimum detection percentage allowed before a filament error is triggered" unit="%" :min="0" :max="500" :step="1"
												  v-model="(monitor as PulsedFilamentMonitor).configured.percentMin" />
								</div>
								<div class="col-3">
									<number-input label="Max Detection %" title="Maximum detection percentage allowed before a filament error is triggered" unit="%" :min="0" :max="500" :step="1"
												  v-model="(monitor as PulsedFilamentMonitor).configured.percentMax" />
								</div>
								<div class="col-3">
									<number-input label="Min Extrusion Length" title="Minimum extrusion length before a commanded/measured comparison is done" unit="mm" :min="0.01"
												  v-model="(monitor as PulsedFilamentMonitor).configured.sampleDistance" />
								</div>
								<div class="col-3">
									<number-input label="MM per Pulse" title="Millimetres of filament per pulse of the filament monitor" unit="mm"
												  v-model="(monitor as PulsedFilamentMonitor).configured.mmPerPulse" />
								</div>
							</template>
						</div>
					</div>
				</div>
			</template>

			<div v-if="!store.data.sensors.filamentMonitors.some(sensor => sensor !== null)" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Filament Monitors
			</div>
		</template>
	</config-section>
</template>

<script lang="ts">
const FilamentMonitorOptions: Array<SelectOption> = [
	{
		text: "Simple",
		value: FilamentMonitorType.simple
	},
	{
		text: "Rotating Magnet",
		value: FilamentMonitorType.rotatingMagnet
	},
	{
		text: "Laser",
		value: FilamentMonitorType.laser
	},
	{
		text: "Pulsed",
		value: FilamentMonitorType.pulsed
	}
];

const EnableModeOptions: Array<SelectOption> = [
	{
		text: "Always enabled",
		value: FilamentMonitorEnableMode.alwaysEnabled
	},
	{
		text: "Enabled when printing",
		value: FilamentMonitorEnableMode.enabled
	},
	{
		text: "Disabled",
		value: FilamentMonitorEnableMode.disabled
	}
];
</script>

<script setup lang="ts">
import { FilamentMonitor, FilamentMonitorEnableMode, FilamentMonitorType, initObject, LaserFilamentMonitor, LaserFilamentMonitorConfigured, PulsedFilamentMonitor, PulsedFilamentMonitorConfigured, RotatingMagnetFilamentMonitor, RotatingMagnetFilamentMonitorConfigured } from "@duet3d/objectmodel";
import { computed } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigSectionType } from "@/store/sections";
import NumberInput from "../inputs/NumberInput.vue";

const store = useStore();

// Filament monitor management
const canAddMonitor = computed(() => store.data.sensors.filamentMonitors.length < store.data.move.extruders.length);
function addMonitor() {
	const monitor = initObject(FilamentMonitor, {
		type: FilamentMonitorType.simple,
		enableMode: FilamentMonitorEnableMode.enabled
	});
	store.data.sensors.filamentMonitors.push(monitor);
}

function deleteMonitor(index: number) {
	store.data.sensors.filamentMonitors[index] = null;
	while (store.data.sensors.filamentMonitors.length > 0 && store.data.sensors.filamentMonitors[store.data.sensors.filamentMonitors.length - 1] === null) {
		store.data.sensors.filamentMonitors.pop();
	}
}

function getExtruders(currentIndex: number) {
	const options = new Array<SelectOption>();
	for (let i = 0; i < store.data.move.extruders.length; i++) {
		options.push({
			text: `${i}`,
			value: i,
			disabled: (i !== currentIndex) && (i < store.data.sensors.filamentMonitors.length) && store.data.sensors.filamentMonitors[i] !== null
		});
	}
	return options;
}

function setMonitorNumber(currentIndex: number, newIndex: number) {
	// Make sure array is large enough
	while (store.data.sensors.filamentMonitors.length <= newIndex) {
		store.data.sensors.filamentMonitors.push(null);
	}

	// Move monitor
	const monitors = store.data.sensors.filamentMonitors;
	if (newIndex < 0 || newIndex >= monitors.length) {
		return;
	}
	const temp = monitors[currentIndex];
	monitors[currentIndex] = monitors[newIndex];
	monitors[newIndex] = temp;

	// Clean up nulls at end
	while (monitors.length > 0 && monitors[monitors.length - 1] === null) {
		monitors.pop();
	}
}

// Filament Monitors
function setMonitorType(index: number, type: FilamentMonitorType) {
	switch (type) {
		case FilamentMonitorType.simple:
			store.data.sensors.filamentMonitors[index] = initObject(FilamentMonitor, {
				type: FilamentMonitorType.simple,
				enableMode: FilamentMonitorEnableMode.enabled
			});
			break;
		case FilamentMonitorType.rotatingMagnet:
			store.data.sensors.filamentMonitors[index] = initObject(RotatingMagnetFilamentMonitor, {
				type: FilamentMonitorType.rotatingMagnet,
				configured: initObject(RotatingMagnetFilamentMonitorConfigured, {
					percentMin: 60,
					percentMax: 160,
					sampleDistance: 3,
					mmPerRev: 25.1,
					allMoves: false
				}),
				enableMode: FilamentMonitorEnableMode.enabled
			});
			break;
		case FilamentMonitorType.laser:
			store.data.sensors.filamentMonitors[index] = initObject(LaserFilamentMonitor, {
				type: FilamentMonitorType.laser,
				configured: initObject(LaserFilamentMonitorConfigured, {
					calibrationFactor: 1.0,
					percentMin: 60,
					percentMax: 160,
					sampleDistance: 3,
					allMoves: false
				}),
				enableMode: FilamentMonitorEnableMode.enabled
			});
			break;
		case FilamentMonitorType.pulsed:
			store.data.sensors.filamentMonitors[index] = initObject(PulsedFilamentMonitor, {
				type: FilamentMonitorType.pulsed,
				configured: initObject(PulsedFilamentMonitorConfigured, {
					percentMin: 60,
					percentMax: 160,
					mmPerPulse: 1,
					sampleDistance: 5
				}),
				enableMode: FilamentMonitorEnableMode.enabled
			});
			break;
		case FilamentMonitorType.unknown:
			console.error("Cannot set filament monitor to unknown type");
			break;
		default:
			const _exhaustiveCheck: never = type;
			break;
	}
}

function getPresetMonitorValue<K extends keyof FilamentMonitor>(index: number, key: K) {
	if (index < store.preset.sensors.filamentMonitors.length) {
		const presetSensor = store.preset.sensors.filamentMonitors[index];
		if (presetSensor !== null) {
			return presetSensor[key];
		}
	}
	return null;
}
</script>
