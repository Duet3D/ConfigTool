<template>
	<base-calculator ref="calculator" label="Resistance at 25°C" title="Calculate Thermistor Parameters"
	                 :min="100" :max="1000000" :step="1"
	                 v-model="props.sensor.r25" unit="Ω">
		<template #prepend>
			<span class="input-group-text" v-title="'Heater thermistor resistance at 25°C'">
				<i class="bi bi-calculator"></i>
			</span>
		</template>
		<template #append>
			<span class="input-group-text">
				Ω
			</span>
		</template>

		<form class="row g-3" @submit.prevent="apply">
			<div class="col-12">
				<select-input class="mb-3" label="Thermistor Preset" v-model="preset" :options="ThermistorPresets" :required="false" />
			</div>

			<template v-if="preset === null">
				<span class="mt-0">
					Measure the resistances of your thermistor at three different temperatures and enter your values below:
				</span>
				<div class="col-6">
					<div class="row mb-3">
						<label class="col-sm-auto col-form-label">
							T1:
						</label>
						<div class="col-sm">
							<number-input v-model="t1" :min="-273.15" :max="1999" step="any" :required="false" unit="°C" />
						</div>
					</div>
					<div class="row mb-3">
						<label class="col-sm-auto col-form-label">
							T2:
						</label>
						<div class="col-sm">
							<number-input v-model="t2" :min="-273.15" :max="1999" step="any" :required="false" unit="°C" />
						</div>
					</div>
					<div class="row mb-3">
						<label class="col-sm-auto col-form-label">
							T3:
						</label>
						<div class="col-sm">
							<number-input v-model="t3" :min="-273.15" :max="1999" step="any" :required="false" unit="°C" />
						</div>
					</div>
				</div>

				<div class="col-6">
					<div class="row mb-3">
						<label class="col-sm-auto col-form-label">
							R1:
						</label>
						<div class="col-sm">
							<number-input v-model="r1" :min="100" :max="1000000" :step="1" :required="false" unit="Ω" />
						</div>
					</div>
					<div class="row mb-3">
						<label class="col-sm-auto col-form-label">
							R2:
						</label>
						<div class="col-sm">
							<number-input v-model="r2" :min="100" :max="1000000" :step="1" :required="false" unit="Ω" />
						</div>
					</div>
					<div class="row">
						<label class="col-sm-auto col-form-label">
							R3:
						</label>
						<div class="col-sm">
							<number-input v-model="r3" :min="100" :max="1000000" :step="1" :required="false" unit="Ω" />
						</div>
					</div>
				</div>
			</template>

			<div class="col-12 mt-0">
				<h4 class="mb-2">
					Resulting coefficients:
				</h4>
				<ul class="fs-5 mb-2">
					<li>
						R25:
						<span :class="{ 'text-danger' : !isFinite(calculatedR25) }">
							{{ isFinite(calculatedR25) ? `${calculatedR25} Ω` : 'error' }}
						</span>
					</li>
					<li>
						β: 
						<span :class="{ 'text-danger' : !isFinite(calculatedBeta) }">
							{{ isFinite(calculatedBeta) ? `${calculatedBeta} K` : 'error' }}
						</span>
					</li>
					<li v-if="preset !== null || isThirdPairValid">
						C:
						<span :class="{ 'text-danger' : !isFinite(calculatedShC) }">
							{{ isFinite(calculatedShC) ? ((calculatedShC !== 0) ? calculatedShC.toExponential(6) : '0') : 'error' }}
						</span> 
					</li>
				</ul>
				<span class="text-muted">
					See also <a href="https://en.wikipedia.org/wiki/Steinhart%E2%80%93Hart_equation" target="_blank">Steinhart-Hart</a> and <a href="https://en.wikipedia.org/wiki/Thermistor#B_or_%CE%B2_parameter_equation">β parameter</a> equations.
				</span>
			</div>

			<div class="col mt-4 d-flex justify-content-center">
				<button type="submit" class="btn btn-success"
						:disabled="!isFinite(calculatedR25) || !isFinite(calculatedBeta) || !isFinite(calculatedShC)">
					<i class="bi-check-circle"></i>
					Apply
				</button>
				<button type="button" class="btn btn-danger ms-2" @click="cancel">
					<i class="bi-x-circle"></i>
					Cancel
				</button>
			</div>
		</form>
	</base-calculator>
</template>

<script lang="ts">
import { computed, ref } from "vue";

interface ThermistorPreset {
	r25: number;
	beta: number;
	shC: number;
}

interface ThermistorPresetSelectOption {
	text: string;
	value: ThermistorPreset | null;
}

const ThermistorPresets: Array<ThermistorPresetSelectOption> = [
	{ text: 'EPCOS B57863S0103F040 (10k, RepRapPro beds)', value: { r25: 10000, beta: 3988, shC: 0 } },
	{ text: 'EPCOS B57560G1104F (100k)', value: { r25: 100000, beta: 4092, shC: 0 } },
	{ text: 'Hisens 3950 1% up to 300°C (Simple ONE and All In ONE hot ends)', value: { r25: 10000, beta: 4100, shC: 0 } },
	{ text: 'Honeywell 135-104QAD-J01 (RepRapPro hot ends)', value: { r25: 100000, beta: 4138, shC: 0 } },
	{ text: 'QWG-104F-3950 (QU-BD silicone bed)', value: { r25: 100000, beta: 3950, shC: 0 } },
	{ text: 'Semitec 104-GT2 (E3D hot ends)', value: { r25: 100000, beta: 4388, shC: 0.706e-7 } },
	{ text: 'Slice Engineering High-Temperature Thermistor', value: { r25: 500000, beta: 4723, shC: 1.196220e-7 } },
	{ text: 'Custom', value: null }
];

const preset = ref<ThermistorPreset | null>(null);

const t1 = ref(5), t2 = ref(25), t3 = ref(45);
const r1 = ref(25000), r2 = ref(10000), r3 = ref(4000);
const isThirdPairValid = computed(() => isFinite(t3.value) && isFinite(r3.value) && r3.value > 0);

const r25 = ref(100000), beta = ref(4098), shC = ref(0);

const calculatedR25 = computed(() => {
	if (preset.value !== null) {
		return preset.value.r25;
	}
	if (!isFinite(t1.value) || !isFinite(r1.value) || !isFinite(t2.value) || !isFinite(r2.value)) {
		return NaN;
	}

	if (isThirdPairValid.value){
		// Use full SH coefficients
		const l1 = Math.log(r1.value), l2 = Math.log(r2.value), l3 = Math.log(r3.value);
		const g2 = ((1 / (t2.value + 273.15)) - (1 / (t1.value + 273.15))) / (l2 - l1);
		const g3 = ((1 / (t3.value + 273.15)) - (1 / (t1.value + 273.15))) / (l3 - l1);

		const c = ((g3 - g2) / (l3 - l2)) / (l1 + l2 + l3);
		const b = g2 - c * (l1 * l1 + l1 * l2 + l2 * l2);
		const a = (1 / (t1.value + 273.15)) - (b + l1 * l1 * c) * l1;

		// Calculate R25
		const x = 1 / (2 * c) * (a - 1 / 298.15);
		const y = Math.sqrt(Math.pow(b / (3 * c), 3) + Math.pow(x, 2));
		return Math.round(Math.exp(Math.pow(y - x, 1 / 3) - Math.pow(y + x, 1 / 3)));
	}

	// Fallback to B-parameter equation
	return Math.round(r1.value * Math.exp(calculatedBeta.value * ((1 / 298.15) - (1 / (t1.value + 273.15)))));
});
const calculatedBeta = computed(() => {
	if (preset.value !== null) {
		return preset.value.beta;
	}
	if (!isFinite(t1.value) || !isFinite(r1.value) || !isFinite(t2.value) || !isFinite(r2.value)) {
		return NaN;
	}

	if (isFinite(t3.value) && isFinite(r3.value)){
		// Use full SH coefficients
		const l1 = Math.log(r1.value), l2 = Math.log(r2.value), l3 = Math.log(r3.value);
		const g2 = ((1 / (t2.value + 273.15)) - (1 / (t1.value + 273.15))) / (l2 - l1);
		const g3 = ((1 / (t3.value + 273.15)) - (1 / (t1.value + 273.15))) / (l3 - l1);

		// Calculate beta
		const c = ((g3 - g2) / (l3 - l2)) / (l1 + l2 + l3);
		const b = g2 - c * (l1 * l1 + l1 * l2 + l2 * l2);
		return Math.round(1 / b);
	}

	// Fallback to B-parameter equation
	return Math.round(Math.log(r2.value / r1.value) / ((1 / (t2.value + 273.15)) - (1 / (t1.value + 273.15))));
});
const calculatedShC = computed(() => {
	if (preset.value !== null) {
		return preset.value.shC;
	}
	if (isThirdPairValid.value) {
		const l1 = Math.log(r1.value), l2 = Math.log(r2.value), l3 = Math.log(r3.value);
		const g2 = ((1 / (t2.value + 273.15)) - (1 / (t1.value + 273.15))) / (l2 - l1);
		const g3 = ((1 / (t3.value + 273.15)) - (1 / (t1.value + 273.15))) / (l3 - l1);

		// C may become extremely small so it doesn't matter if it's set to 0
		const c = ((g3 - g2) / (l3 - l2)) / (l1 + l2 + l3);
		return (c > -1e-16 && c < 1e-16) ? 0 : parseFloat(c.toExponential(6));
	}
	return 0;
});
</script>

<script setup lang="ts">
import BaseCalculator from "./BaseCalculator.vue";

import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";

import type { ConfigTempSensor } from "@/store/model/ConfigTempSensor";

const props = defineProps<{
	sensor: ConfigTempSensor
}>();

const calculator = ref<typeof BaseCalculator | null>(null);

function onShow() {
	r25.value = props.sensor.r25;
	beta.value = props.sensor.beta;
	shC.value = props.sensor.shC;
}

function apply() {
	props.sensor.r25 = calculatedR25.value;
	props.sensor.beta = calculatedBeta.value;
	props.sensor.shC = calculatedShC.value;
	calculator.value?.hide(true);
}

function cancel() {
	calculator.value?.hide(true);
}
</script>
