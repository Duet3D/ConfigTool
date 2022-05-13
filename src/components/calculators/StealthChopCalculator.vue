<template>
	<base-calculator ref="calculator" title="Calculate StealthChop PWM Threshold"
	                 :min="0" :max="1048575" :step="1" :disabled="driver.mode !== ConfigDriverMode.stealthChop" :required="driver.mode === ConfigDriverMode.stealthChop"
	                 v-model="props.driver.tpwmThreshold" @show="onShow">
		<span class="text-muted">
			PWM threshold at which the stepper driver changes from StealthChop (quiet) to SpreadCycle (normal)
		</span>

		<form class="mt-n1 row g-3" @submit.prevent="apply">
			<div class="col-6">
				<number-input label="Steps per mm" title="Total steps per mm. You can calculate this in the Axis and Extruder sections as well" :min="1" :step="0.1" v-model="stepsPerMm" />
			</div>
			<div class="col-6">
				<number-input label="Microstepping" title="Microsteps per full step" :min="1" :max="256" :step="1" v-model="microstepping" />
			</div>
			<div class="col-12">
				<number-input label="Maximum StealthChop velocity" title="Velocity at which the stepper driver switches from StealthChop to SpreadCycle" :min="1" :step="1" unit="mm/s" v-model="velocity" />
			</div>
			<div class="col-12">
				<h4>
					Resulting threshold: <span :class="tpwmthrsValid ? 'text-success' : 'text-danger'" v-text="tpwmthrs"></span>
				</h4>
				<span v-show="currentThresholdValid" class="text-muted">
					Current threshold: {{ currentThreshold.toFixed(1) }} mm/s
				</span>
			</div>

			<div class="col mt-3 d-flex justify-content-center">
				<button type="submit" class="btn btn-outline-success" :disabled="!tpwmthrsValid">
					<i class="bi-check-circle"></i>
					Apply
				</button>
				<button type="button" class="btn btn-outline-danger ms-2" @click="cancel">
					<i class="bi-x-circle"></i>
					Cancel
				</button>
			</div>
		</form>
	</base-calculator>
</template>

<script lang="ts">
import { ref } from "vue";

const velocity = ref(50);
</script>

<script setup lang="ts">
import { computed, type Ref } from "vue";

import BaseCalculator from "./BaseCalculator.vue";
import NumberInput from "@/components/inputs/NumberInput.vue"

import { type ConfigDriver, ConfigDriverMode } from "@/store/model/ConfigDriver";
import { useStore } from "@/store";

const props = defineProps<{
	driver: ConfigDriver
}>();

const store = useStore();

const calculator: Ref<typeof BaseCalculator | null> = ref(null);

const microstepping = ref(1), stepsPerMm = ref(80);
const tpwmthrs = computed(() => Math.round((12000000 * microstepping.value) / (256 * stepsPerMm.value * velocity.value)));
const tpwmthrsValid = computed(() => (tpwmthrs.value >= 0 && tpwmthrs.value <= 1048575));
const currentThreshold = computed(() => (12000000 * microstepping.value) / (256 * stepsPerMm.value * props.driver.tpwmThreshold));
const currentThresholdValid = computed(() => isFinite(currentThreshold.value));

function onShow() {
	microstepping.value = props.driver.microstepping;
	for (const axis of store.data.move.axes) {
		if (axis.drivers.some(driver => driver.equals(props.driver.id))) {
			stepsPerMm.value = axis.stepsPerMm;
			return;
		}
	}
	for (const extruder of store.data.move.extruders) {
		if (extruder.driver?.equals(props.driver.id)) {
			stepsPerMm.value = extruder.stepsPerMm;
			return;
		}
	}
}

function apply() {
	props.driver.tpwmThreshold = tpwmthrs.value;
	calculator.value?.hide(true);
}

function cancel() {
	calculator.value?.hide(true);
}
</script>
