<template>
	<scroll-item anchor="Sensors">
		<template #title>
			Temperature Sensors
			<button class="btn btn-sm btn-primary" :disabled="!canAddSensor" @click="addSensor">
				<i class="bi-plus-circle"></i>
				Add Sensor
			</button>
		</template>
		<template #body>
			<template v-for="(sensor, index) in store.data.sensors.analog">
				<div v-if="sensor" class="card m-2">
					<div class="card-header d-flex justify-content-between align-items-center">
						Sensor #{{ index }}
						<button class="btn btn-sm btn-danger" @click="deleteSensor(index)">
							<i class="bi-trash"></i>
						</button>
					</div>
					<div class="card-body">
						<div class="row g-3">
							<!-- Generic Sensor Options -->
							<div class="col-2">
								<select-input label="Number" title="Number of this sensor" :model-value="index"
											  @update:model-value="setSensorNumber(index, $event)"
											  :options="getSensorNumbers(index)" />
							</div>
							<div class="col-3">
								<text-input label="Name" title="Name of this sensor" :model-value="sensor.name ?? ''"
											@update:model-value="sensor.name = ($event === '') ? null : $event"
											:preset="getPresetSensorValue(index, 'name')"
											:max-length="20" :placeholder="`Sensor ${index}`" :required="false" />
							</div>
							<div class="col-4">
								<select-input label="Type" title="Type of this sensor" :model-value="sensor.type"
											  @update:model-value="setSensorType(sensor, index, $event)"
											  :options="getSensorTypes(index)"
											  :preset="getPresetSensorValue(index, 'type')" />
							</div>
							<div class="col-3">
								<port-input label="Input Port" title="Input port for this sensor"
											:function="ConfigPortFunction.thermistor" :index="index" />
							</div>
							<!-- Thermistor Options-->
							<template v-if="sensor.type === AnalogSensorType.thermistor">
								<div class="col-3">
									<thermistor-calculator :sensor="store.data.configTool.sensors[index]!" />
								</div>
								<div class="col-3">
									<number-input label="Beta Value"
												  title="Beta value of this thermistor"
												  :model-value="getConfigSensorValue(index, 'beta')"
												  @update:model-value="setConfigSensorValue(index, 'beta', $event)"
												  :preset="getPresetConfigSensorValue(index, 'beta')" unit="K" />
								</div>
								<div class="col-3">
									<number-input label="C Coefficient"
												  title="Steinhart-Hart C coefficient (optional, set 0 if unused)"
												  :model-value="getConfigSensorValue(index, 'shC')"
												  @update:model-value="setConfigSensorValue(index, 'shC', $event)"
												  :preset="getPresetConfigSensorValue(index, 'shC')"
												  :factor="1e7" unit="e-7" />
								</div>
							</template>
							<div class="col-3">
								Override series resistor
							</div>
							<div class="col-3">
								<number-input label="ADC Low Offset"
											  title="ADC low offset correction (ignored if the hardware supports automatic ADC gain and offset calibration)"
											  :model-value="getConfigSensorValue(index, 'adcLowOffset') ?? 0"
											  @update:model-value="setConfigSensorValue(index, 'adcLowOffset', $event)"
											  :preset="getPresetConfigSensorValue(index, 'adcLowOffset')" />
							</div>

							Rnnn Series resistor value. Leave blank to use the default for your board.
							Lnnn ADC low offset correction, default 0 (ignored if the hardware supports automatic ADC
							gain and offset calibration)
							Hnnn ADC high offset correction, default 0 (ignored if the hardware supports automatic ADC
							gain and offset calibration)
						</div>
						<!-- PT1000 Options -->
						Rnnn Series resistor value. Leave blank to use the default for your board.
						Lnnn ADC low offset correction, default 0 (ignored if the hardware supports automatic ADC gain
						and offset calibration)
						Hnnn ADC high offset correction, default 0 (ignored if the hardware supports automatic ADC gain
						and offset calibration)
						<!-- Linear Analog -->
						Fn F0 = unfiltered (fast response), F1 = filtered (slower response, but noise reduced and ADC
						oversampling used to increase resolution). F1 is only available when using a port intended for
						thermistors, not when using a general input port.
						Bnnn The temperature or other value when the ADC output is zero
						Cnnn The temperature or other value when the ADC output is full scale
						<!-- DHT Humdity-->
						Pnnn DHT sensor number, format [existing sensor.output sensor]
						<!-- MAX31856 Options-->
						K"c" The thermistor type letter, default K
						Fnn (where nn is 50 or 60) The local mains frequency. Readings will be timed to optimise
						rejection of interference at this frequency.
						<!-- MAX31865 -->
						Rnnn Series resistor value. Leave blank to use the default for your board.
						Fnn (where nn is 50 or 60) The local mains frequency. Readings will be timed to optimise
						rejection of interference at this frequency.
					</div>
				</div>
			</template>

			<div v-if="!store.data.sensors.analog.some(sensor => sensor !== null)" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Sensors defined
			</div>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { AnalogSensor, AnalogSensorType } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import ThermistorCalculator from "@/components/calculators/ThermistorCalculator.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";
import TextInput from "@/components/inputs/TextInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigTempSensor } from "@/store/model/ConfigTempSensor";
import { ExpansionBoardType } from "@/store/ExpansionBoards";
import { PortType } from "@/store/BaseBoard";

const store = useStore();

// Sensor management
const canAddSensor = computed(() => store.data.sensors.analog.length < store.data.limits.sensors!);
function addSensor() {
	const sensor = new AnalogSensor();
	if (store.preset.sensors.analog.length > store.data.sensors.analog.length) {
		sensor.update(store.preset.sensors.analog[store.data.sensors.analog.length])
	} else if (store.preset.sensors.analog.length > 0) {
		sensor.update(store.preset.sensors.analog[0]);
	}
	store.data.sensors.analog.push(sensor);
	store.data.configTool.sensors.push(new ConfigTempSensor());
}

function deleteSensor(index: number) {
	store.data.sensors.analog.splice(index, 1);
	store.data.configTool.sensors.splice(index, 1);
}

// Sensors
function getSensorNumbers(index: number) {
	const options: Array<SelectOption> = [];
	for (let i = 0; i < (store.data.limits.sensors ?? 0); i++) {
		options.push({
			text: i.toString(),
			value: i,
			disabled: (i !== index) && (i < store.data.sensors.analog.length) && (store.data.sensors.analog[i] !== null)
		});
	}
	return options;
}

function setSensorNumber(index: number, newIndex: number) {
	for (const port of store.data.configTool.ports) {
		if ([ConfigPortFunction.spiCs, ConfigPortFunction.thermistor].includes(port.function!) && port.index === index) {
			// Move associated ports to the new index
			port.index = newIndex;
		}
	}

	// Ensure we have enough items in the sensor array
	while (store.data.sensors.analog.length < newIndex) {
		store.data.sensors.analog.push(null);
	}

	// Move the sensor from the old slot to the new one
	store.data.sensors.analog[newIndex] = store.data.sensors.analog[index];
	store.data.sensors.analog[index] = null;

	// Clean up unused items at the end
	while (store.data.sensors.analog[store.data.sensors.analog.length - 1] === null) {
		store.data.sensors.analog.pop();
	}
}

function getSensorTypes(index: number) {
	// Embedded ADC
	const result: Record<string, Array<SelectOption>> =  {
		"Embedded ADC": [
			{
				text: "Thermistor",
				value: AnalogSensorType.thermistor
			},
			{
				text: "PT1000",
				value: AnalogSensorType.pt1000
			},
			{
				text: "Linear Analog",
				value: AnalogSensorType.linearAnalog
			}
		]
	};

	// Built-In
	const builtInTypes: Array<SelectOption> = [];
	if (store.data.boardDefinition?.hasSmartDrivers) {
		builtInTypes.push({
			text: "Smart Drivers",
			value: AnalogSensorType.drivers
		});

		if (store.data.boardDefinition.expansionBoards.has(ExpansionBoardType.DueX2) || store.data.boardDefinition.expansionBoards.has(ExpansionBoardType.DueX5)) {
			builtInTypes.push({
				text: "Smart Drivers (Duex)",
				value: AnalogSensorType.driversDuex
			});
		}
	}
	if (store.data.boards.find(board => !board.canAddress)?.mcuTemp !== null) {
		builtInTypes.push({
			text: "MCU Temperature",
			value: AnalogSensorType.mcuTemp
		});
	}
	if (builtInTypes.length > 0) {
		result["Built-In Sensors"] = builtInTypes;
	}

	// DHT + SPI
	if (store.data.configTool.ports.some(port => port.capabilities.has(PortType.spiCs))) {
		result["DHT Sensors"] = [
			{
				text: "DHT21",
				value: AnalogSensorType.dht21
			},
			{
				text: "DHT22",
				value: AnalogSensorType.dht22
			},
			{
				text: "DHT Humidity",
				value: AnalogSensorType.dhtHumidity,
				disabled: true //!store.data.sensors.analog.some((sensor, idx) => (idx < index) && (sensor?.type === AnalogSensorType.dht21 || sensor?.type === AnalogSensorType.dht22))
			}
		];

		result["SPI Daughter Boards"] = [
			{
				text: "K-Type Thermocouple (MAX31855)",
				value: AnalogSensorType.max31855
			},
			{
				text: "K-Type Thermocouple (MAX31856)",
				value: AnalogSensorType.max31856
			},
			{
				text: "PT100 (MAX31865)",
				value: AnalogSensorType.max31865
			}
		];
	}

	return result;
}

function getSensorPortFunctions(sensorType: AnalogSensorType) {
	const result = new Set<ConfigPortFunction>();
	switch (sensorType) {
		case AnalogSensorType.currentLoop:
		case AnalogSensorType.dht11:
		case AnalogSensorType.dht21:
		case AnalogSensorType.dht22:
		case AnalogSensorType.dhtHumidity:
		case AnalogSensorType.max31855:
		case AnalogSensorType.max31856:
		case AnalogSensorType.max31865:
			result.add(ConfigPortFunction.spiCs);
			break;

		case AnalogSensorType.drivers:
		case AnalogSensorType.driversDuex:
		case AnalogSensorType.mcuTemp:
		case AnalogSensorType.unknown:
			// none
			break;

		case AnalogSensorType.linearAnalog:
		case AnalogSensorType.pt1000:
		case AnalogSensorType.thermistor:
			result.add(ConfigPortFunction.thermistor);
			break;

		default:
			const _exhaustiveCheck: never = sensorType;
			break;
	}
	return result;
}

function setSensorType(sensor: AnalogSensor, index: number, type: AnalogSensorType) {
	// Clear ports that are no longer used
	const newPortFunctions = getSensorPortFunctions(type);
	for (const port of store.data.configTool.ports) {
		if ([ConfigPortFunction.spiCs, ConfigPortFunction.thermistor].includes(port.function!) && !newPortFunctions.has(port.function!) && port.index === index) {
			port.function = null;
		}
	}

	// Assign new sensor type
	sensor.type = type;
}

function getPresetSensorValue<K extends keyof AnalogSensor>(index: number, key: K) {
	if (index < store.preset.sensors.analog.length) {
		const presetSensor = store.preset.sensors.analog[index];
		if (presetSensor !== null) {
			return presetSensor[key];
		}
	}
	return null;
}

function getConfigSensorValue<K extends keyof ConfigTempSensor>(index: number, key: K) {
	if (index < store.data.configTool.sensors.length) {
		const sensor = store.data.configTool.sensors[index];
		if (sensor !== null) {
			return sensor[key];
		}
	}
	throw new Error(`Failed to find key ${key}`);
}

function setConfigSensorValue<K extends keyof ConfigTempSensor>(index: number, key: K, value: ConfigTempSensor[K]) {
	if (index < store.data.configTool.sensors.length) {
		const sensor = store.data.configTool.sensors[index];
		if (sensor !== null) {
			sensor[key] = value;
		}
	}
}

function getPresetConfigSensorValue<K extends keyof ConfigTempSensor>(index: number, key: K) {
	if (index < store.preset.configTool.sensors.length) {
		const presetSensor = store.preset.configTool.sensors[index];
		if (presetSensor !== null) {
			return presetSensor[key];
		}
	}
	return null;
}
</script>
