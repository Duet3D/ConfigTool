<style scoped>
.limit,
.pwm {
	min-width: 6.5rem;
}
.thermistor {
	min-width: 8.5rem;
}
.beta {
	min-width: 7rem;
}

.table-heaters > tbody > tr > td:first-child,
.table-heaters > tbody > tr > td:nth-child(2) {
	padding-top: 1.125rem;
}

select {
	min-width: 10rem;
}
</style>

<template>
	<b-container>
		<b-card header="General Heater Settings">
			<b-checkbox v-model="bedPresent" v-preset.left="preset.bed.present" title="Enable the heated bed">Heated Bed</b-checkbox>
			<b-form-row v-show="bedPresent" class="mt-3 pl-4">
				<b-col>
					<b-form-group label="Bed Heater Output:">
						<b-select v-model.number="bedHeater" v-preset="preset.bed.heater" title="Output channel for the heated bed" :options="bedHeaters"></b-select>
					</b-form-group>
				</b-col>
				<b-col cols="auto">
					<b-form-group label="Control Method:">
						<b-form-radio-group buttons button-variant="outline-primary" v-model="bedPid" v-preset="preset.bed.use_pid" title="Control method for the bed heater" name="bedPid">
							<b-form-radio :value="true">PID</b-form-radio>
							<b-form-radio :value="false">Bang-Bang</b-form-radio>
						</b-form-radio-group>
					</b-form-group>
				</b-col>
			</b-form-row>
			<b-checkbox v-model="bedIsNozzle" v-preset.left="preset.bed_is_nozzle" title="Check this if you want to connect the first nozzle heater to the hot bed terminal">Assign Bed Heater to First Nozzle</b-checkbox>
			<b-checkbox v-model="chamberPresent" v-preset.left="preset.chamber.present" title="Enable a heated chamber">Heated Chamber</b-checkbox>
			<b-form-row v-show="chamberPresent" class="mt-3 pl-4">
				<b-col>
					<b-form-group label="Chamber Heater Output:">
						<b-select v-model.number="chamberHeater" v-preset title="Output channel for the heated chamber" :options="chamberHeaters"></b-select>
					</b-form-group>
				</b-col>
				<b-col cols="auto">
					<b-form-group label="Control Method:">
						<b-form-radio-group buttons button-variant="outline-primary" v-model="chamberPid" v-preset="preset.chamber.use_pid" title="Control method for the chamber heater" name="chamberPid">
							<b-form-radio :value="true">PID</b-form-radio>
							<b-form-radio :value="false">Bang-Bang</b-form-radio>
						</b-form-radio-group>
					</b-form-group>
				</b-col>
			</b-form-row>
		</b-card>

		<b-card no-body class="mt-3">
			<template slot="header">
				<span class="mt-2">Heater Configuration</span>
				<b-button-group class="float-right">
					<b-button size="sm" variant="success" :disabled="!canAddNozzle" @click="addNozzle()">
						<font-awesome-icon icon="plus"></font-awesome-icon> Add Nozzle
					</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveNozzle" @click="removeNozzle()">
						<font-awesome-icon icon="minus"></font-awesome-icon> Remove Nozzle
					</b-button>
				</b-button-group>
			</template>
			<table class="table mb-0 table-heaters">
				<thead>
					<th>Heater</th>
					<th>Type</th>
					<th>Temp. Limit</th>
					<th>PWM Limit</th>
					<th>R25</th>
					<th>β</th>
					<th>C</th>
					<th>Sensor Channel</th>
				</thead>
				<tbody>
					<tr v-for="(heater, index) in template.heaters" v-if="heater != null">
						<td>
							{{ (index === 0) ? 'Bed' : `E${index - 1}` }}
						</td>
						<td>
							{{ (template.bed.present && template.bed.heater === index) ? 'Heated&nbsp;Bed'
								: (template.chamber.present && template.chamber.heater === index) ? 'Chamber'
									: 'Nozzle' }}
						</td>
						<td class="limit">
							<b-input-group append="C">
								<b-form-input :value="heater.temp_limit" @input="updateHeater({ heater: index, tempLimit: parseFloat($event) })" v-preset="getPresetHeater(index).temp_limit" title="Maximum allowed temperature of this heater before a temperature fault is raised" min="-273" max="1999" type="number" step="any" required></b-form-input>
							</b-input-group>
						</td>
						<td class="pwm">
							<b-input-group append="%">
								<b-form-input :value="heater.scale_factor" @input="updateHeater({ heater: index, pwmLimit: parseFloat($event) })" v-preset="getPresetHeater(index).scale_factor" title="Final PID heater scale factor. You can change this to compensate voltage and heater resistance parameters" :disabled="isPwmLimitDisabled(index)" min="0" max="100" type="number" step="any" required></b-form-input>
							</b-input-group>
						</td>
						<td class="thermistor">
							<thermistor-input :index="index" :preset-heater="getPresetHeater(index)" title="Heater thermistor resistance at 25C" parameter="thermistor" unit="Ω" min="1"></thermistor-input>
						</td>
						<td class="beta">
							<thermistor-input :index="index" :preset-heater="getPresetHeater(index)" title="β model coefficient" parameter="beta" unit="K" min="1"></thermistor-input>
						</td>
						<td>
							<thermistor-input :index="index" :preset-heater="getPresetHeater(index)" title="C coefficient of the Steinhart-Hart equation. May be used to improve the β model parameters too" parameter="c"></thermistor-input>
						</td>
						<td>
							<b-select :value="heater.channel" @change="updateHeater({ heater: index, channel: parseInt($event) })" v-preset="getPresetHeaterIndex(index)" title="Assigned sensor channel for this heater">
								<optgroup v-for="(group, name) in sensors" :label="name">
									<option v-for="option in group" :value="option.value" v-text="option.text"></option>
								</optgroup>
							</b-select>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapFields, mapMultiRowFields } from 'vuex-map-fields'

import ThermistorInput from '../components/HeatersThermistorInput.vue'

export default {
	components: {
		'thermistor-input': ThermistorInput
	},
	computed: {
		...mapState(['board', 'preset', 'template']),
		...mapGetters(['canAddNozzle', 'canRemoveNozzle']),
		...mapFields({
			bedPid: 'template.bed.use_pid',
			chamberPid: 'template.chamber.use_pid'
		}),
		...mapMultiRowFields(['template.heaters']),
		bedHeaters() {
			const heaters = [];
			for(let i = 0; i < this.board.maxHeaters; i++) {
				const isDisabled = ((i === 0 && this.template.bed_is_nozzle) ||
									(this.template.chamber.present && this.template.chamber.heater === i) ||
									(this.template.probe.type === 'bltouch' && this.template.probe.pwm_channel === i));
				heaters.push({
					text: (i === 0) ? 'Bed Heater' : `E${i - 1} Heater`,
					value: i,
					disabled: isDisabled
				});
			}
			return heaters;
		},
		bedPresent: {
			get() { return this.template.bed.present; },
			set(value) { this.updateBed({ present: value }); }
		},
		bedHeater: {
			get() { return this.template.bed.heater; },
			set(value) { this.updateBed({ heater: value }); }
		},
		bedIsNozzle: {
			get() { return this.template.bed_is_nozzle; },
			set(value) { this.updateBed({ isNozzle: value }); }
		},
		chamberHeaters() {
			const heaters = [];
			for(let i = 0; i < this.board.maxHeaters; i++) {
				const isDisabled = ((i === 0 && this.template.bed_is_nozzle) ||
									(this.template.bed.present && this.template.bed.heater === i) ||
									(this.template.probe.type === 'bltouch' && this.template.probe.pwm_channel === i));
				heaters.push({
					text: (i === 0) ? 'Bed Heater' : `E${i - 1} Heater`,
					value: i,
					disabled: isDisabled
				});
			}
			return heaters;
		},
		chamberPresent: {
			get() { return this.template.chamber.present; },
			set(value) { this.updateChamber({ present: value }); }
		},
		chamberHeater: {
			get() { return this.template.chamber.heater; },
			set(value) { this.updateChamber({ heater: value }); }
		},
		sensors() {
			const sensors = {
				'Thermistors': [],
				'PT1000': [],
				'MAX31855 (K-Type Thermocouple)': [],
				'MAX31856 (K-Type Thermocouple)': [],
				'MAX31865 (PT100)': []
			};

			for (let i = 0; i < this.board.maxThermistors; i++) {
				if (i === 0) {
					sensors.Thermistors.push({ value: 0, text: 'Bed Thermistor' });
					sensors.PT1000.push({ value: 500, text: 'PT1000 on Bed Input' });
				} else if (i === 3 && this.board.name === 'duetm10') {
					sensors.Thermistors.push({ value: 3, text: 'C Thermistor' });
					sensors.PT1000.push({ value: 503, text: 'PT1000 on C Input' });
				} else {
					sensors.Thermistors.push({ value: i, text: `E${i - 1} Thermistor` });
					sensors.PT1000.push({ value: 500 + i, text: `PT1000 on E${i - 1} Input` });
				}
			}

			for (let i = 0; i < this.board.maxRtdBoards; i++) {
				sensors['MAX31855 (K-Type Thermocouple)'].push({ value: 100 + i, text: `MAX31855 on CS${i + 1}` });
				sensors['MAX31856 (K-Type Thermocouple)'].push({ value: 150 + i, text: `MAX31856 on CS${i + 1}` });
				sensors['MAX31865 (PT100)'].push({ value: 200 + i, text: `MAX31865 on CS${i + 1}` });
			}

			return sensors;
		}
	},
	methods: {
		...mapMutations(['addNozzle', 'removeNozzle', 'updateBed', 'updateChamber', 'updateHeater']),
		getPresetHeaterIndex(heater) {
			return (heater >= this.preset.heaters.length) ? this.preset.heaters.length - 1 : heater;
		},
		getPresetHeater(heater) {
			return this.preset.heaters[this.getPresetHeaterIndex(heater)];
		},
		isPwmLimitDisabled(heater) {
			return ((this.template.bed.present && !this.template.bed.use_pid && this.template.bed.heater === heater) ||
					(this.template.chamber.present && !this.template.chamber.use_pid && this.template.chamber.heater == heater));
		}
	}
}
</script>
