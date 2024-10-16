<template>
	<base-dialog :title="`Heater Monitors for Heater #${heaterIndex}`" class="modal-lg" :model-value="props.modelValue"
				 @update:model-value="emit('update:modelValue', $event)" content-is-body>
		<template v-if="props.monitors">
			<table class="table table-striped mt-1">
				<colgroup>
					<col style="width: 22%;">
					<col style="width: 30%;">
					<col style="width: 20%;">
					<col style="width: 28%;">
					<col style="width: auto;">
				</colgroup>
				<thead>
					<tr>
						<th>
							Condition
						</th>
						<th>
							Action
						</th>
						<th>
							Limit
						</th>
						<th>
							Sensor
						</th>
						<th>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(monitor, index) in props.monitors">
						<td>
							<select-input title="Condition of this heater monitor to trigger"
										  v-model="monitor.condition" :options="ConditionOptions"
										  :preset="getPreset(index, 'condition')" />
						</td>
						<td>
							<select-input title="Action to perform when the heater monitor is triggered"
										  :disabled="monitor.condition === HeaterMonitorCondition.disabled"
										  v-model="monitor.action" :options="ActionOptions"
										  :preset="getPreset(index, 'action')" />
						</td>
						<td>
							<number-input title="Limit of this heater monitor to set"
										  :disabled="monitor.condition === HeaterMonitorCondition.disabled"
										  v-model="monitor.limit as number" :preset="getPreset(index, 'limit')"
										  unit="°C" :min="-273" :max="1999" :step="0.1" />
						</td>
						<td>
							<select-input title="Sensor to monitor"
										  :disabled="monitor.condition === HeaterMonitorCondition.disabled"
										  v-model="monitor.sensor" :options="sensors"
										  :preset="getPreset(index, 'sensor')" />
						</td>
						<td>
							<button type="button" class="btn btn-sm btn-danger mt-1"
									@click.stop.prevent="props.monitors?.splice(index, 1)">
								<i class="bi-trash"></i>
							</button>
						</td>
					</tr>
				</tbody>
			</table>

			<div class="w-100 text-center mb-3">
				<button type="button" class="btn btn-sm btn-primary" :disabled="!canAddMonitors"
						@click.prevent="addMonitor">
					<i class="bi bi-plus"></i>
					Add Heater Monitor
				</button>
			</div>
		</template>
		<div v-else class="modal-body text-danger">
			error, no heater selected
		</div>
	</base-dialog>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue"
import { HeaterMonitorAction, HeaterMonitorCondition } from "@duet3d/objectmodel"
import { SelectionDirection } from "monaco-editor";

const ConditionOptions: Array<SelectOption> = [
	{
		text: "Disabled",
		value: HeaterMonitorCondition.disabled
	},
	{
		text: "Too High",
		value: HeaterMonitorCondition.tooHigh
	},
	{
		text: "Too Low",
		value: HeaterMonitorCondition.tooLow
	}
];

const ActionOptions: Array<SelectOption> = [
	{
		text: "Generate Fault",
		value: HeaterMonitorAction.generateFault
	},
	{
		text: "Switch Off Permantently",
		value: HeaterMonitorAction.permanentSwitchOff
	},
	{
		text: "Switch Off Temporarily",
		value: HeaterMonitorAction.temporarySwitchOff
	},
	{
		text: "Shut Down Heater",
		value: HeaterMonitorAction.shutDown
	}
];
</script>

<script setup lang="ts">
import { HeaterMonitor } from "@duet3d/objectmodel";
import { computed } from "vue";

import BaseDialog from "./BaseDialog.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";

const props = defineProps<{
	modelValue: boolean,
	heaterIndex: number,
	monitors: Array<HeaterMonitor> | null
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

const store = useStore();

const canAddMonitors = computed(() => (props.monitors !== null) && props.monitors.length < store.data.limits.monitorsPerHeater!);
function addMonitor() {
	let presetMonitor: HeaterMonitor | null = null;
	if (props.heaterIndex < store.preset.heat.heaters.length && store.preset.heat.heaters[props.heaterIndex] !== null) {
		const presetHeater = store.preset.heat.heaters[props.heaterIndex]!;
		if (props.monitors!.length < presetHeater.monitors.length) {
			presetMonitor = presetHeater.monitors[props.monitors!.length];
		} else if (props.monitors!.length > 0) {
			presetMonitor = presetHeater.monitors[0];
		}
	}

	const monitor = new HeaterMonitor();
	if (presetMonitor !== null) {
		monitor.update(presetMonitor);
	} else {
		monitor.condition = HeaterMonitorCondition.tooHigh;
		monitor.action = HeaterMonitorAction.generateFault;
		monitor.limit = 285;
		monitor.sensor = (props.heaterIndex < store.data.heat.heaters.length && store.data.heat.heaters[props.heaterIndex] !== null) ? store.data.heat.heaters[props.heaterIndex]!.sensor : -1;
	}
	props.monitors?.push(monitor);
}

function getPreset<K extends keyof HeaterMonitor>(index: number, key: K) {
	return (props.heaterIndex < store.preset.heat.heaters.length) && (store.preset.heat.heaters[props.heaterIndex] !== null) &&
		(index < store.preset.heat.heaters[props.heaterIndex]!.monitors.length) ? store.preset.heat.heaters[props.heaterIndex]!.monitors[index][key] : null;
}

const sensors = computed(() => {
	const result: Array<SelectOption> = [];
	for (let i = 0; i < store.data.sensors.analog.length; i++) {
		const sensor = store.data.sensors.analog[i];
		if (sensor !== null) {
			result.push({
				text: sensor.name ? `${sensor.name} (Sensor #${i})` : `Sensor #${i}`,
				value: i
			});
		}
	}
	return result;
});
</script>
