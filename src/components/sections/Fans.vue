<template>
	<config-section :type="ConfigSectionType.Fans" title="Fans">
		<template #append-title>
			<button class="btn btn-sm btn-primary" :disabled="!canAddFan" @click.prevent="addFan">
				<i class="bi-plus-circle"></i>
				Add Fan
			</button>
		</template>
		<template #body>
			<template v-for="(fan, index) in store.data.fans">
				<div v-if="fan !== null" class="card m-2">
					<div class="card-header d-flex justify-content-between align-items-center">
						Fan #{{ index }}
						<button class="btn btn-sm btn-danger" @click.prevent="store.data.fans.splice(index, 1)">
							<i class="bi-trash"></i>
						</button>
					</div>
					<div class="card-body">
						<div class="row g-3">
							<div class="col-2">
								<select-input label="Number" title="Number of this fan" :model-value="index"
											  @update:model-value="setFanNumber(index, $event)"
											  :options="getFanNumbers(index)" />
							</div>
							<div class="col-2">
								<text-input label="Name" title="Optional name of this fan" v-model="fan.name"
											:max-length="20" :required="false"
											:preset="getPresetFanValue(index, 'name')" :placeholder="`Fan ${index}`" />
							</div>
							<div class="col-3">
								<port-input label="PWM Port" title="PWM output port for this fan"
											:function="ConfigPortFunction.fan" :index="index" />
							</div>
							<div class="col-3">
								<port-input label="Tacho Port"
											title="Optional fan tach port for this fan (e.g. from 4-pin PWM fans)"
											:function="ConfigPortFunction.fanTacho" :index="index" />
							</div>
							<div class="col-2">
								<number-input label="Blip Time"
											  title="Fan will be run at full PWM for this number of seconds when started from standstill"
											  unit="s" :min="0" :step="0.1" v-model="fan.blip"
											  :preset="getPresetFanValue(index, 'blip')" />
							</div>
							<div class="col-2">
								<number-input label="Minimum Speed" title="Minimum fan speed" unit="%" :factor="100"
											  :min="0" :max="fan.max * 100" :step="0.1" v-model="fan.min"
											  :preset="getPresetFanValue(index, 'min')" />
							</div>
							<div class="col-2">
								<number-input label="Maximum Speed" title="Maximum fan speed" unit="%" :factor="100"
											  :min="fan.min * 100" :max="100" :step="0.1" v-model="fan.max"
											  :preset="getPresetFanValue(index, 'max')" />
							</div>
							<div class="col-2">
								<number-input label="Initial Speed" title="Initial fan speed on start-up" :factor="100"
											  unit="%" :min="0" :max="100" :step="0.1" v-model="fan.requestedValue"
											  :preset="getPresetFanValue(index, 'requestedValue')" />
							</div>
							<div class="col-2">
								<sensor-list label="Monitored Sensors" :board="getFanBoard(index)"
											 :sensors="fan.thermostatic.sensors"
											 @sensorAdded="onFanSensorAdded(fan.thermostatic)"
											 @sensorRemoved="onFanSensorRemoved(fan.thermostatic)" />
							</div>
							<div class="col-4">
								<two-number-input first-label="Thermostatic Trigger Temperature"
												  second-label="Thermostatic Temperature Range"
												  v-model:first-value="fan.thermostatic.lowTemperature"
												  v-model:second-value="fan.thermostatic.highTemperature"
												  :first-preset="getPresetFanThermostaticValue(index, 'lowTemperature')"
												  :second-preset="getPresetFanThermostaticValue(index, 'highTemperature')"
												  button-title="Control fan within a specified temperature range from 0-100%"
												  first-title="Lower temperature threshold"
												  second-title="Upper temperature threshold"
												  :disabled="fan.thermostatic.sensors.length === 0" :min="-273"
												  :max="1999" :step="0.1" unit="°C" is-range>
									<template #button>
										<i class="bi bi-sliders"></i>
									</template>
									<template #separator>
										-
									</template>
								</two-number-input>
							</div>
						</div>
					</div>
				</div>
			</template>

			<div v-if="store.data.fans.length === 0" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Fans
			</div>
		</template>
	</config-section>
</template>

<script setup lang="ts">
import { Fan, FanThermostaticControl } from "@duet3d/objectmodel";
import { computed } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";
import SensorList from "@/components/inputs/SensorList.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import TwoNumberInput from "@/components/inputs/TwoNumberInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigSectionType } from "@/store/sections";

const store = useStore();

// Fan management
const canAddFan = computed(() => store.data.fans.length < store.data.limits.fans!);
function addFan() {
	const fan = new Fan();
	if (store.preset.fans.length > store.data.fans.length) {
		fan.update(store.preset.fans[store.data.fans.length])
	} else if (store.preset.fans.length > 0) {
		fan.update(store.preset.fans[0]);
	}
	store.data.fans.push(fan);
}

// Fans
function getFanNumbers(index: number) {
	const options: Array<SelectOption> = [];
	for (let i = 0; i < (store.data.limits.fans ?? 0); i++) {
		options.push({
			text: i.toString(),
			value: i,
			disabled: (i !== index) && (i < store.data.fans.length) && (store.data.fans[i] !== null)
		});
	}
	return options;
}

function setFanNumber(index: number, newIndex: number) {
	for (const port of store.data.configTool.ports) {
		if ([ConfigPortFunction.fan, ConfigPortFunction.fanTacho].includes(port.function!) && port.index === index) {
			// Move associated ports to the new index
			port.index = newIndex;
		}
	}

	// Ensure we have enough items in the fans array
	while (store.data.fans.length < newIndex) {
		store.data.fans.push(null);
	}

	// Move the fan from the old slot to the new one
	store.data.fans[newIndex] = store.data.fans[index];
	store.data.fans[index] = null;

	// Clean up unused items at the end
	while (store.data.fans[store.data.fans.length - 1] === null) {
		store.data.fans.pop();
	}
}

function getPresetFanValue<K extends keyof Fan>(index: number, key: K) {
	if (index < store.preset.fans.length) {
		const presetFan = store.preset.fans[index];
		if (presetFan !== null) {
			return presetFan[key];
		}
	}
	return null;
}

function getFanBoard(index: number) {
	return store.data.configTool.ports.find(port => port.function === ConfigPortFunction.fan && port.index === index)?.canBoard;
}

function onFanSensorAdded(ft: FanThermostaticControl) {
	if (ft.lowTemperature === null) {
		ft.lowTemperature = 45;
	}
	if (ft.highTemperature === null) {
		ft.highTemperature = 45;
	}
}

function onFanSensorRemoved(ft: FanThermostaticControl) {
	if (ft.sensors.length === 0) {
		ft.lowTemperature = ft.highTemperature = null;
	}
}

function getPresetFanThermostaticValue<K extends keyof FanThermostaticControl>(index: number, key: K) {
	if (index < store.preset.fans.length) {
		const presetFan = store.preset.fans[index];
		if (presetFan !== null) {
			return presetFan.thermostatic[key];
		}
	}
	return null;
}
</script>
