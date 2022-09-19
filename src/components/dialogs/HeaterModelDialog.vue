<template>
	<base-dialog :title="`Model Parameters for Heater ${props.heaterIndex}`" class="modal-lg" :model-value="props.modelValue"
				 @update:model-value="emit('update:modelValue', $event)">
		<div v-if="props.model !== null" class="row g-3">
			<div class="col-4">
				<number-input label="Heating rate"
							  title="Heating rate in °C/sec at full power when the heater temperature is close to ambient"
							  v-model="props.model.heatingRate" :preset="getPreset('heatingRate')" :min="0.01"
							  :max="100" :step="0.001" unit="°C/s" />
			</div>
			<div class="col-4">
				<number-input label="Dead time" title="Dead time in seconds" v-model="props.model.deadTime" :min="0"
							  :preset="getPreset('deadTime')" :max="100" :step="0.1" unit="s" />
			</div>
			<div class="col-4">
				<number-input label="Cooling curve exponent" title="Exponent of the cooling rate curve"
							  v-model="props.model.coolingExp" :preset="getPreset('coolingExp')" :step="0.1" />
			</div>
			<div class="col-3">
				<number-input label="Basic cooling rate"
							  title="Cooling rate in °C/sec when the heater is 100C above ambient. The cooling rate is calculated as K/((Th-Ta)/100)^E where Th is the heater temperature and Ta is	the ambient temperature"
							  v-model="props.model.coolingRate" :preset="getPreset('coolingRate')" :step="0.001"
							  unit="°C/s" />
			</div>
			<div class="col-3">
				<number-input label="Fan cooling rate"
							  title="Cooling rate in °C/sec when the heater is 100C above ambient and the fan is turned on. The cooling rate is calculated as K_basic/((Th-Ta)/100)^E + K_fan/((Th-Ta)/100)^E*F where F is the fan PWM in the range 0 to 1"
							  v-model="props.model.fanCoolingRate" :preset="getPreset('fanCoolingRate')" :step="0.001"
							  unit="°C/s" />
			</div>
			<div class="col-3">
				<number-input label="VIN supply voltage"
							  title="VIN supply voltage at which the heating rate was calibrated. This allows the PID controller to compensate for changes in supply voltage. A value of zero disables compensation for changes in VIN"
							  v-model="props.model.standardVoltage" :preset="getPreset('standardVoltage')" :min="0"
							  :step="0.1" unit="V" />
			</div>
			<div class="col-3">
				<number-input label="Maximum PWM value"
							  title="Maximum PWM to be used with this heater on a scale of 0 to 100%"
							  v-model="props.model.maxPwm" :preset="getPreset('maxPwm')" :min="0" :max="100" :step="1"
							  :factor="100" unit="%">
					<template #prepend>
						<button type="button" class="btn"
								:class="props.model.inverted ? 'btn-primary' : 'btn-outline-secondary'"
								v-title="'Invert PWM/bang-bang signal for inverted temperature control (e.g. with Peltier elements)'"
								@click.prevent="props.model!.inverted = !props.model!.inverted">
							<i class="bi bi-exclamation-lg"></i>
						</button>
					</template>
				</number-input>
			</div>
			<template v-if="props.model.pid.used">
				<div class="col-3 d-flex align-items-end">
					<check-input label="Override PID parameters"
								 title="Override model-defined PID parameters using M301"
								 v-model="props.model.pid.overridden" :preset="getPidPreset('overridden')" />
				</div>
				<div class="col-3">
					<number-input label="Kp" title="Proportional value of the heater's PID loop"
								  :disabled="!props.model.pid.overridden" v-model="props.model.pid.p"
								  :preset="getPidPreset('p')" :step="0.00001" />
				</div>
				<div class="col-3">
					<number-input label="Ki" title="Integral value of the heater's PID loop"
								  :disabled="!props.model.pid.overridden" v-model="props.model.pid.i"
								  :preset="getPidPreset('i')" :step="0.0001" />
				</div>
				<div class="col-3">
					<number-input label="Kd" title="Derivative value of the heater's PID loop"
								  :disabled="!props.model.pid.overridden" v-model="props.model.pid.d"
								  :preset="getPidPreset('d')" :step="0.001" />
				</div>
			</template>
		</div>
		<div v-else class="text-danger">
			error, no heater selected
		</div>
	</base-dialog>
</template>

<script setup lang="ts">
import type { HeaterModel, HeaterModelPID } from "@duet3d/objectmodel";
import { computed } from "vue";

import BaseDialog from "./BaseDialog.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import { useStore } from "@/store";

const props = defineProps<{
	modelValue: boolean,
	heaterIndex: number,
	model: HeaterModel | null
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

const store = useStore();

function getPreset<K extends keyof HeaterModel>(key: K) {
	return (props.heaterIndex < store.preset.heat.heaters.length) && (store.preset.heat.heaters[props.heaterIndex] !== null) ? store.preset.heat.heaters[props.heaterIndex]!.model[key] : null;
}

function getPidPreset<K extends keyof HeaterModelPID>(key: K) {
	return (props.heaterIndex < store.preset.heat.heaters.length) && (store.preset.heat.heaters[props.heaterIndex] !== null) ? store.preset.heat.heaters[props.heaterIndex]!.model.pid[key] : null;
}
</script>
