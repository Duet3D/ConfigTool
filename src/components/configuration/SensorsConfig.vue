<template>
	<scroll-item anchor="Sensors">
		<template #title>
			Temperature Sensors
			<button class="btn btn-sm btn-primary" :disabled="!canAddSensor" @click.prevent="addSensor">
				<i class="bi-plus-circle"></i>
				Add Sensor
			</button>
		</template>
		<template #body>
			<template v-for="(sensor, index) in store.data.sensors.analog">
				<div v-if="sensor" class="card m-2">
					<div class="card-header d-flex justify-content-between align-items-center">
						Sensor #{{ index }}
						<button class="btn btn-sm btn-danger" @click.prevent="deleteSensor(index)">
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
											:preset="getPresetSensorValue(index, 'name')" :max-length="20"
											:placeholder="`Sensor ${index}`" :required="false" />
							</div>
							<div class="col-4">
								<select-input label="Type" title="Type of this sensor" :model-value="sensor.type"
											  @update:model-value="setSensorType(sensor, index, $event)"
											  :options="getSensorTypes(index)"
											  :preset="getPresetSensorValue(index, 'type')" />
							</div>
							<div class="col-3">
								<select-input v-if="sensor.type === AnalogSensorType.dhtHumidity" label="DHT Sensor"
											  title="Existing DHT sensor channel number that the DHT humidity value is fetched from. The corresponding DHT sensor must come before this item"
											  :model-value="getConfigSensorValue(index, 'dhtSensor')"
											  @update:model-value="setConfigSensorValue(index, 'dhtSensor', $event)"
											  :preset="getPresetConfigSensorValue(index, 'dhtSensor')"
											  :options="getDhtSensorOptions(index)" />
								<port-input v-else label="Input Port" title="Input port for this sensor"
											:function="[AnalogSensorType.thermistor, AnalogSensorType.pt1000, AnalogSensorType.linearAnalog].includes(sensor.type) ? ConfigPortFunction.thermistor : ConfigPortFunction.spiCs" :index="index" />
							</div>
							<!-- Thermistor and PT1000 Options-->
							<template v-if="sensor.type === AnalogSensorType.thermistor || sensor.type === AnalogSensorType.pt1000">
								<!-- Thermistor Options-->
								<template v-if="sensor.type === AnalogSensorType.thermistor">
									<div class="col-4">
										<thermistor-calculator :sensor="store.data.configTool.sensors[index]!" />
									</div>
									<div class="col-4">
										<number-input label="Beta Value" title="Beta value of this thermistor"
													  :model-value="getConfigSensorValue(index, 'beta')"
													  @update:model-value="setConfigSensorValue(index, 'beta', $event)"
													  :preset="getPresetConfigSensorValue(index, 'beta')" unit="K" />
									</div>
									<div class="col-4">
										<number-input label="C Coefficient"
													  title="Steinhart-Hart C coefficient (optional, set 0 if unused)"
													  :model-value="getConfigSensorValue(index, 'shC')"
													  @update:model-value="setConfigSensorValue(index, 'shC', $event)"
													  :preset="getPresetConfigSensorValue(index, 'shC')" :factor="1e7"
													  unit="e-7" />
									</div>
								</template>
								<!-- Thermistor and PT1000 Options-->
								<div class="col-4">
									<optional-number-input label="Series resistor"
														   title="Optional configuration of the on-board series resistor. In general this setting should be used"
														   :model-value="getConfigSensorValue(index, 'seriesR')"
														   @update:model-value="setConfigSensorValue(index, 'seriesR', $event)"
														   :preset="getPresetConfigSensorValue(index, 'seriesR')"
														   :min="1" :max="1000000" step="any" unit="Ω" />
								</div>
								<div class="col-4">
									<optional-number-input label="ADC Low Offset"
														   title="ADC low offset correction. This is automatically calibrated on most boards, so this option is usually not required"
														   :model-value="getConfigSensorValue(index, 'adcLowOffset')"
														   @update:model-value="setConfigSensorValue(index, 'adcLowOffset', $event)"
														   :preset="getPresetConfigSensorValue(index, 'adcLowOffset')"
														   :min="-128" :max="127" :step="1" />
								</div>
								<div class="col-4">
									<optional-number-input label="ADC High Offset"
														   title="ADC high offset correction. This is automatically calibrated on most boards, so this option is usually not required"
														   :model-value="getConfigSensorValue(index, 'adcHighOffset')"
														   @update:model-value="setConfigSensorValue(index, 'adcHighOffset', $event)"
														   :preset="getPresetConfigSensorValue(index, 'adcHighOffset')"
														   :min="-128" :max="127" :step="1" />
								</div>
							</template>
							<!-- Linear Analog Sensor -->
							<template v-else-if="sensor.type === AnalogSensorType.linearAnalog">
								<div class="col-4">
									<number-input label="Minimum Temperature"
												  title="The temperature or other value when the ADC output is zero"
												  :model-value="getConfigSensorValue(index, 'minTemp')"
												  @update:model-value="setConfigSensorValue(index, 'minTemp', $event)"
												  :preset="getPresetConfigSensorValue(index, 'minTemp')" :min="-273"
												  :max="1999" step="any" unit="°C" />
								</div>
								<div class="col-4">
									<number-input label="Maximum Temperature"
												  title="The temperature or other value when the ADC output is full scale"
												  :model-value="getConfigSensorValue(index, 'minTemp')"
												  @update:model-value="setConfigSensorValue(index, 'minTemp', $event)"
												  :preset="getPresetConfigSensorValue(index, 'minTemp')" :min="-273"
												  :max="1999" step="any" unit="°C" />
								</div>
								<div class="col-4 d-flex align-items-end">
									<check-input class="mb-1" label="Filter input signal"
												 title="Filter input value. If enabled, the response is slower, but noise is reduced and oversampling is used to increase resolution"
												 :model-value="getConfigSensorValue(index, 'filtered')"
												 @update:model-value="setConfigSensorValue(index, 'filtered', $event)"
												 :preset="getPresetConfigSensorValue(index, 'filtered')" />
								</div>
							</template>
							<!-- MAX31856 and MAX31865-->
							<template v-else-if="sensor.type === AnalogSensorType.max31856 || sensor.type === AnalogSensorType.max31865">
								<!-- MAX31856-->
								<template v-if="sensor.type === AnalogSensorType.max31856">
									<div class="col-3">
										<select-input label="Thermocouple Type" title="Type of this thermocouple"
													  :model-value="getConfigSensorValue(index, 'thermocoupleType')"
													  @update:model-value="setConfigSensorValue(index, 'thermocoupleType', $event)"
													  :preset="getPresetConfigSensorValue(index, 'thermocoupleType')"
													  :options="ThermocoupleTypeOptions" />
									</div>
								</template>
								<!-- MAX31865 -->
								<template v-else-if="sensor.type === AnalogSensorType.max31865">
									<div class="col-3">
										<optional-number-input label="Reference Resistance"
															   title="Optional configuration of the RTD reference resistor. In general this does not need to be set, its default value is 400Ω"
															   :model-value="getConfigSensorValue(index, 'rref')"
															   @update:model-value="setConfigSensorValue(index, 'rref', $event)"
															   :preset="getPresetConfigSensorValue(index, 'rref')"
															   :min="350" :max="10000" step="0.01" unit="Ω" />
									</div>
								</template>
								<!-- MAX31856 and MAX31865-->
								<div class="col-3">
									<select-input label="Mains frequency" title="Local mains frequency"
												  :model-value="getConfigSensorValue(index, 'mainsFrequency')"
												  @update:model-value="setConfigSensorValue(index, 'mainsFrequency', $event)"
												  :preset="getPresetConfigSensorValue(index, 'mainsFrequency')"
												  :options="MainsFrequencies" />
								</div>
							</template>
						</div>
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

<script lang="ts">
import type { SelectOption } from "../inputs/SelectInput.vue";

const ThermocoupleTypeOptions: Array<SelectOption> = "BEJKNRST".split("").map(letter => ({
	text: `Type ${letter}`,
	value: letter
}));

const MainsFrequencies: Array<SelectOption> = [
	{
		text: "50 Hz",
		value: 50
	},
	{
		text: "60 Hz",
		value: 60
	}
];
</script>

<script setup lang="ts">
import { AnalogSensor, AnalogSensorType } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import ThermistorCalculator from "@/components/calculators/ThermistorCalculator.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import OptionalNumberInput from "@/components/inputs/OptionalNumberInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
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
	} else {
		sensor.type = AnalogSensorType.thermistor;
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
	const result: Record<string, Array<SelectOption>> = {
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
				disabled: !store.data.sensors.analog.some((sensor, idx) => (idx < index) && (sensor?.type === AnalogSensorType.dht21 || sensor?.type === AnalogSensorType.dht22))
			}
		];

		result["SPI Daughter Boards"] = [
			{
				text: "K-Type Thermocouple (MAX31855)",
				value: AnalogSensorType.max31855
			},
			{
				text: "Thermocouple (MAX31856)",
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

function getDhtSensorOptions(index: number) {
	const options = new Array<SelectOption>();
	for (let i = 0; i < index; i++) {
		const sensor = store.data.sensors.analog[i];
		if (sensor !== null && (sensor.type == AnalogSensorType.dht21 || sensor.type === AnalogSensorType.dht22)) {
			options.push({
				text: sensor.name ? sensor.name : `Sensor ${i}`,
				value: i
			})
		}
	}
	return options;
}
</script>
