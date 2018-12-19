<template>
	<div>
		<b-input-group :append="unit" v-if="unit != undefined">
			<b-form-input ref="inputUnit" v-model.number="heater[parameter]" v-preset="presetHeater[parameter]" :title="title" :disabled="heater.channel >= 100" :min="min" :max="max" type="number" step="any" required />
		</b-input-group>
		<b-form-input v-else ref="inputUnitless" v-model.number="heater[parameter]" v-preset="presetHeater[parameter]" :title="title" :disabled="heater.channel >= 100" :min="min" :max="max" type="number" step="any" required />

		<b-popover :target="inputElement" :show.sync="popoverShown" placement="right" title="Calculate Heater Parameters" triggers="focus" @show="onShow">
			<b-form-group label="Thermistor Preset:">
				<b-select v-model="sensorPreset" :options="sensorPresets" />
			</b-form-group>

			<b-card v-if="sensorPreset == 'custom'" bg-variant="light">
				<p>Measure the resistances of your thermistor at three different temperatures and enter your values below:</p>
				<b-form-row>
					<b-col cols="5">
						<b-form-group horizontal label="T1:">
							<b-input-group append="C">
								<b-input v-model.number="parameters.t1" min="-273" max="1999" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
						<b-form-group horizontal label="T2:">
							<b-input-group append="C">
								<b-input v-model.number="parameters.t2" min="-273" max="1999" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
						<b-form-group horizontal label="T3:">
							<b-input-group append="C">
								<b-input v-model.number="parameters.t3" min="-273" max="1999" type="number" step="any" />
							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col cols="7">
						<b-form-group horizontal label="R1:" label-class="text-right">
							<b-input-group append="Ω">
								<b-input v-model.number="parameters.r1" min="1" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
						<b-form-group horizontal label="R2:" label-class="text-right">
							<b-input-group append="Ω">
								<b-input v-model.number="parameters.r2" min="1" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
						<b-form-group horizontal label="R3:" label-class="text-right">
							<b-input-group append="Ω">
								<b-input v-model.number="parameters.r3" min="1" type="number" step="any" />
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
						<template v-if="useSteinhartHart">
							<h4 :class="{ 'text-danger' : !isValid }">A: {{ isValid ? calculatedParameters.a.toExponential(6) : "error" }}</h4>
							<h4 :class="{ 'text-danger' : !isValid }">B: {{ isValid ? calculatedParameters.b.toExponential(6) : "error" }}</h4>
						</template>
						<template v-else>
							<h4 :class="{ 'text-danger' : !isValid }">R25: {{ isValid ? `${Math.round(calculatedParameters.thermistor)} Ω` : "error" }} </h4>
							<h4 :class="{ 'text-danger' : !isValid }">β: {{ isValid ? `${Math.round(calculatedParameters.beta)} K` : "error" }} </h4>
						</template>
						<h4 class="mb-0" :class="{ 'text-danger' : !isValid }">C: {{ isValid ? (((sensorPreset != "custom" || isThirdPairValid) && calculatedParameters.c != 0) ? calculatedParameters.c.toExponential(6) : "0") : "error" }}</h4>
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

export default {
	computed: {
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
					beta = 1 / b;

					// C may become extremely small so it doesn't matter if it's set to 0
					if (c > -1e-16 && c < 1e-16) {
						c = 0;
					}
				} else {
					// Calculate AB parameters only, don't care about C
					b = 1 / beta;
					a = (1 / (this.parameters.t1 + 273.15)) - b * Math.log(this.parameters.r1);
					c = 0;
				}
				return { thermistor, beta, a, b, c };
			}
			return this.sensorPreset;
		},
		isValid() {
			return isNumber(this.parameters.r1) && isNumber(this.parameters.r2) && isNumber(this.parameters.t1) && isNumber(this.parameters.t2);
		},
		isThirdPairValid() {
			return isNumber(this.parameters.r3) && isNumber(this.parameters.t3);
		}
	},
	data() {
		return {
			parameters,
			sensorPreset: "custom",
			sensorPresets: [
				{ text: 'Semitec 104-GT2 (used by E3D)', value: { thermistor: 100000, beta: 4388, a: 0.57177248e-3, b: 2.116402e-4, c: 0.706e-7 } },
				{ text: 'Honeywell 135-104QAD-J01 (RepRapPro hot ends)', value: { thermistor: 100000, beta: 4138, a: 2.236745e-3, b: 2.4166263e-4, c: 0 } },
				{ text: 'EPCOS B57863S0103F040 (Ormerod bed thermistor)', value: { thermistor: 10000, beta: 3988, a: 1.0445028e-3, b: 2.5075225e-4, c: 0 } },
				{ text: 'Slice Engineering High-Temperature Thermistor', value: { thermistor: 500000, beta: 4723, a: 3.055357e-4, b: 2.117134e-4, c: 1.196220e-7 } },
				{ text: 'Custom', value: "custom" }
			],
			popoverShown: false
		}
	},
	methods: {
		apply() {
			const params = this.calculatedParameters;
			this.heater.thermistor = Math.round(params.thermistor);
			this.heater.beta = Math.round(params.beta);
			this.heater.a = params.a.toExponential(6);
			this.heater.b = params.b.toExponential(6);
			this.heater.c = (this.sensorPreset != 'custom' || this.isThirdPairValid) ? params.c.toExponential(6) : 0;
			this.popoverShown = false;
		},
		inputElement() {
			// This must remain a method!
			return (this.unit == undefined) ? this.$refs.inputUnitless : this.$refs.inputUnit;
		},
		onShow(e) {
			if (!hadInput) {
				this.sensorPreset = 'custom';
				for (let i = 0; i < this.sensorPresets.length; i++) {
					const preset = this.sensorPresets[i].value;
					if (this.heater.thermistor == preset.thermistor && this.heater.beta == preset.beta && this.heater.c == preset.c) {
						this.sensorPreset = preset;
						break;
					}
				}
			}

			e.relatedTarget.style.maxWidth = '390px';
		}
	},
	props: {
		heater: {
			type: Object,
			required: true
		},
		index: Number,
		min: String,
		max: String,
		parameter: {
			type: String,
			required: true
		},
		presetHeater: {
			type: Object,
			required: true
		},
		title: String,
		unit: String,
		useSteinhartHart: Boolean
	},
	watch: {
		parameters: {
			deep: true,
			handler: () => hadInput = true
		}
	}
}
</script>
