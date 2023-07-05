<style scoped>
.sensor-list {
	min-width: 9rem;
}
</style>

<template>
	<label v-if="props.label" class="form-label">
		{{ props.label }}:
	</label>
	<div class="d-flex flex-wrap align-items-center gap-1 sensor-list" :class="props.label ? 'mt-1' : ''">
		<span v-if="props.sensors.length === 0" class="me-2 mb-1"
			  :class="props.required ? 'text-danger is-invalid' : 'text-muted'">
			<i class="bi" :class="props.required ? 'bi-exclamation-circle' : 'bi-info-circle'"></i> none
		</span>
		<button v-for="(sensor, index) in props.sensors" type="button" :key="sensor"
				class="btn btn-outline-primary btn-sm text-nowrap"
				v-title="getSensorName(sensor) ?? `Sensor #${sensor}`" @click.prevent="removeSensor(sensor, index)">
			{{ sensor }}
			<i class="bi-x"></i>
		</button>

		<div class="dropdown">
			<button ref="dropdownButton" type="button" class="btn btn-outline-success btn-sm text-nowrap"
					:disabled="availableSensors.length === 0" data-bs-toggle="dropdown" data-bs-auto-close="true"
					@click.prevent="dropdown?.show()">
				<i class="bi-plus"></i>
			</button>

			<ul class="dropdown-menu">
				<li v-for="sensor in availableSensors">
					<a class="dropdown-item" href="#" @click.prevent="addSensor(sensor)">
						{{ sensor }}
						<span class="text-muted fst-italic ms-3">
							{{ getSensorName(sensor) }}
						</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Dropdown } from "bootstrap";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { useStore } from "@/store";
import { BoardType } from "@/store/Boards";
import { ConfigPort, ConfigPortFunction } from "@/store/model/ConfigPort";

const props = withDefaults(defineProps<{
	/**
	 * Optional label to display
	 */
	label?: string;

	/**
	 * Optional board number for board filtering
	 */
	board?: number | null;

	/**
	* Sensor array to manage
	*/
	sensors: Array<number>;

	/**
	 * Whether any sensors are required
	 */
	required?: boolean;
}>(), {
	required: false
});

const emit = defineEmits<{
	(e: "sensorAdded", value: number): void,
	(e: "sensorRemoved", value: number): void
}>();

const store = useStore();

// Dropdown functionality
const dropdownButton = ref<Element | null>(null), dropdown = ref<Dropdown | null>(null);
onMounted(() => {
	if (dropdownButton.value) {
		dropdown.value = new Dropdown(dropdownButton.value);
	}
});
onBeforeUnmount(() => {
	if (dropdown.value) {
		dropdown.value.dispose();
		dropdown.value = null;
	}
});

function addSensor(sensor: number) {
	props.sensors.push(sensor);
	dropdown.value?.hide();
	emit("sensorAdded", sensor);
}

function removeSensor(sensor: number, index: number) {
	props.sensors.splice(index, 1);
	emit("sensorRemoved", sensor);
}

// Sensor list
function getSensorName(index: number) {
	return (index < store.data.sensors.analog.length && store.data.sensors.analog[index] !== null) ? store.data.sensors.analog[index]!.name : null;
}

const numObservableSensors = computed(() => [BoardType.Duet3MB6HC, BoardType.Duet3MB6XD, BoardType.Duet3Mini5PlusEthernet, BoardType.Duet3Mini5PlusWiFi].includes(store.data.boardType!) ? 64 : 32);
const availableSensors = computed(() => {
	const sensorList: Array<number> = [];
	for (let i = 0; i < Math.min(store.data.sensors.analog.length, numObservableSensors.value); i++) {
		if (store.data.sensors.analog[i] !== null && !props.sensors.includes(i)) {
			if (props.board !== undefined) {
				const port = store.data.configTool.ports.find(port => [ConfigPortFunction.sensorSpiCs, ConfigPortFunction.thermistor].includes(port.function!) && port.index === i);
				if (!port || !port.equalsBoard(props.board)) {
					continue;
				}
			}
			sensorList.push(i);
		}
	}
	return sensorList;
});
</script>
