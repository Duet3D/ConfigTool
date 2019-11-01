<style scoped>
.min-popover-width {
	min-width: 390px;
}
</style>

<template>
	<div>
		<b-input-group :append="unit" v-if="unit !== undefined">
			<b-form-input :id="id" v-model.number="value" v-preset="presetHeater[parameter]" :title="title" :disabled="heater.channel >= 100" :min="min" :max="max" type="number" step="any" required></b-form-input>
		</b-input-group>
		<b-form-input v-else :id="id" v-model.number="value" v-preset="presetHeater[parameter]" :title="title" :disabled="heater.channel >= 100" :min="min" :max="max" type="number" step="any" required></b-form-input>

		<b-popover :target="id" :show.sync="popoverShown" placement="right" title="Calculate Heater Parameters" custom-class="min-popover-width" triggers="focus" @show="onShow">
			<b-form-group label="Thermistor Preset:">
				<b-select v-model="sensorPreset" :options="sensorPresets"></b-select>
			</b-form-group>

			<b-card v-if="sensorPreset == 'custom'" bg-variant="light">
				<p>Measure the resistances of your thermistor at three different temperatures and enter your values below:</p>
				<b-form-row>
					<b-col cols="5">
						<b-form-group label-cols="3" label="T1:">
							<b-input-group append="C">
								<b-input v-model.number="parameters.t1" min="-273" max="1999" type="number" step="any" required></b-input>
							</b-input-group>
						</b-form-group>
						<b-form-group label-cols="3" label="T2:">
							<b-input-group append="C">
								<b-input v-model.number="parameters.t2" min="-273" max="1999" type="number" step="any" required></b-input>
							</b-input-group>
						</b-form-group>
						<b-form-group label-cols="3" label="T3:">
							<b-input-group append="C">
								<b-input v-model.number="parameters.t3" min="-273" max="1999" type="number" step="any"></b-input>
							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col cols="7">
						<b-form-group label-cols="3" label="R1:" label-class="text-right">
							<b-input-group append="Ω">
								<b-input v-model.number="parameters.r1" min="1" type="number" step="any" required></b-input>
							</b-input-group>
						</b-form-group>
						<b-form-group label-cols="3" label="R2:" label-class="text-right">
							<b-input-group append="Ω">
								<b-input v-model.number="parameters.r2" min="1" type="number" step="any" required></b-input>
							</b-input-group>
						</b-form-group>
						<b-form-group label-cols="3" label="R3:" label-class="text-right">
							<b-input-group append="Ω">
								<b-input v-model.number="parameters.r3" min="1" type="number" step="any"></b-input>
							</b-input-group>
						</b-form-group>
					</b-col>
				</b-form-row>
				<span>The third pair is optional.</span>
			</b-card>

			<b-card class="mt-3">
				<h3 class="mb-3">Resulting Coefficients:</h3>
				<b-form-row class="mb-0">
					<b-col>
						<h4 :class="{ 'text-danger' : !isValid }">R25: {{ isValid ? `${Math.round(calculatedParameters.thermistor)} Ω` : 'error' }} </h4>
						<h4 :class="{ 'text-danger' : !isValid }">β: {{ isValid ? `${(calculatedParameters.b && isThirdPairValid) ? Math.round(1 / calculatedParameters.b) : calculatedParameters.beta} K` : 'error' }} </h4>
						<h4 class="mb-0" :class="{ 'text-danger' : !isValid }" v-show="template.firmware > 1.16">C: {{ isValid ? (((sensorPreset != 'custom' || isThirdPairValid) && calculatedParameters.c != 0) ? calculatedParameters.c.toExponential(6) : '0') : 'error' }}</h4>
					</b-col>
					<b-col cols="auto" align-self="center">
						<b-button size="sm" variant="primary" :disabled="!isValid" @click="apply">
							<font-awesome-icon icon="check"></font-awesome-icon> Set
						</b-button>
					</b-col>
				</b-form-row>
			</b-card>
		</b-popover>
	</div>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'

const popoverTemplate = '<div class="popover calc-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>';

const parameters = {
	t1: 25,
	t2: 220,
	t3: '',
	r1: 10000,
	r2: 1360,
	r3: ''
}
let hadInput = false

let idCounter = 0;

export default {
	computed: {
		...mapState(['template']),
		calculatedParameters() {
			if (this.sensorPreset.constructor === String) {
				let beta = Math.log(this.parameters.r2 / this.parameters.r1) / ((1 / (this.parameters.t2 + 273.15)) -
					(1 / (this.parameters.t1 + 273.15)));
				let thermistor = this.parameters.r1 * Math.exp(beta * ((1 / 298.15) - (1 / (this.parameters.t1 + 273.15))));

				// Check if we can calculate ABC or only AB
				let a, b, c;
				if (this.isThirdPairValid) {
					// T3+R3 are valid, so we can calculate all the ABC coefficients
					const l1 = Math.log(this.parameters.r1), l2 = Math.log(this.parameters.r2), l3 = Math.log(this.parameters.r3);
					const g2 = ((1 / (this.parameters.t2 + 273.15)) - (1 / (this.parameters.t1 + 273.15))) / (l2 - l1);
					const g3 = ((1 / (this.parameters.t3 + 273.15)) - (1 / (this.parameters.t1 + 273.15))) / (l3 - l1);

					c = ((g3 - g2) / (l3 - l2)) / (l1 + l2 + l3);
					if (!isNumber(c)) {
						a = b = c = 0;
					} else {
						b = g2 - c * (l1 * l1 + l1 * l2 + l2 * l2);
						a = (1 / (this.parameters.t1 + 273.15)) - (b + l1 * l1 * c) * l1;
					}

					// Recalculate R25 and beta
					const x = 1 / (2 * c) * (a - 1 / 298.15);
					const y = Math.sqrt(Math.pow(b / (3 * c), 3) + Math.pow(x, 2));
					thermistor = Math.exp(Math.pow(y - x, 1 / 3) - Math.pow(y + x, 1 / 3));
					beta = Math.round(1 / b);

					// C may become extremely small so it doesn't matter if it's set to 0
					if (c > -1e-16 && c < 1e-16) {
						c = 0;
					}
				} else {
					// Round beta and don't care about C
					beta = Math.round(beta);
					c = 0;
				}
				return { thermistor, beta, c };
			}
			return this.sensorPreset;
		},
		heater() { return this.template.heaters[this.index]; },
		isValid() { return isNumber(this.parameters.r1) && isNumber(this.parameters.r2) &&
						   isNumber(this.parameters.t1) && isNumber(this.parameters.t2); },
		isThirdPairValid() { return ((this.sensorPreset !== 'custom') || (isNumber(this.parameters.r3) && isNumber(this.parameters.t3))) &&
									this.template.firmware > 1.16; },
		value: {
			get() { return this.heater[this.parameter]; },
			set(value) {
				const payload = { heater: this.index };
				payload[this.parameter] = value;
				this.updateHeater(payload);
			}
		}
	},
	data() {
		return {
			id: `thermistorInput${idCounter++}`,
			parameters,
			sensorPreset: 'custom',
			sensorPresets: [
				{ text: 'EPCOS B57863S0103F040 (10k, RepRapPro beds)', value: { thermistor: 10000, beta: 3988, c: 0 } },
				{ text: 'EPCOS B57560G1104F (100k)', value: { thermistor: 100000, beta: 4092, c: 0 } },
				{ text: 'Hisens 3950 1% up to 300°C (Simple ONE and All In ONE hot ends)', value: { thermistor: 10000, beta: 4100, c: 0 } },
				{ text: 'Honeywell 135-104QAD-J01 (RepRapPro hot ends)', value: { thermistor: 100000, beta: 4138, c: 0 } },
				{ text: 'QWG-104F-3950 (QU-BD silicone bed)', value: { thermistor: 100000, beta: 3950, c: 0 } },
				{ text: 'Semitec 104-GT2 (E3D hot ends)', value: { thermistor: 100000, b: 0.00021164021164021165, beta: 4388, c: 0.706e-7 } },
				{ text: 'Slice Engineering High-Temperature Thermistor', value: { thermistor: 500000, beta: 4723, c: 1.196220e-7 } },
				{ text: 'Custom', value: 'custom' }
			],
			popoverShown: false
		}
	},
	methods: {
		...mapMutations(['updateHeater']),
		apply() {
			const params = this.calculatedParameters;
			this.updateHeater({
				heater: this.index,
				thermistor: Math.round(params.thermistor),
				beta: (this.isThirdPairValid && params.b) ? Math.round(1 / params.b) : params.beta,
				// AB are no longer supported (and can be derived from r25 and beta)
				c: this.isThirdPairValid ? parseFloat(params.c.toExponential(6)) : 0
			});
			this.popoverShown = false;
		},
		onShow(e) {
			if (!hadInput) {
				this.sensorPreset = 'custom';
				for (let i = 0; i < this.sensorPresets.length; i++) {
					const preset = this.sensorPresets[i].value;
					const beta = (this.isThirdPairValid && preset.b) ? Math.round(1 / preset.b) : preset.beta;
					if (this.heater.thermistor === preset.thermistor && this.heater.beta === beta && this.heater.c === preset.c) {
						this.sensorPreset = preset;
						break;
					}
				}
			}
		}
	},
	props: {
		index: {
			type: Number,
			required: true
		},
		presetHeater: {
			type: Object,
			required: true
		},
		min: String,
		max: String,
		parameter: {
			type: String,
			required: true
		},
		title: String,
		unit: String
	},
	watch: {
		parameters: {
			deep: true,
			handler: () => hadInput = true
		}
	}
}
</script>
