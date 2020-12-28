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
		<b-card :header="$t('heaters.general')">
			<b-row>
				<b-col :cols="template.firmware < 3 ? 12 : 6">
					<b-checkbox v-model="bedPresent" :disabled="template.firmware >= 3" v-preset.left="preset.bed.present" :title="$t('heaters.bedDescription')">{{$t('heaters.bed')}}</b-checkbox>
					<b-form-row v-show="bedPresent" class="mt-3 pl-4">
						<b-col v-if="template.firmware < 3">
							<b-form-group :label="$t('heaters.bedOutput')">
								<b-select v-model.number="bedHeater" v-preset="preset.bed.heater" :title="$t('heaters.bedOutputDescription')" :options="bedHeaters"></b-select>
							</b-form-group>
						</b-col>
						<b-col cols="auto">
							<b-form-group :label="$t('heaters.bedControl')">
								<b-form-radio-group buttons button-variant="outline-primary" v-model="bedPid" v-preset="preset.bed.use_pid" :title="$t('heaters.bedControlDescription')" name="bedPid">
									<b-form-radio :value="true">PID</b-form-radio>
									<b-form-radio :value="false">Bang-Bang</b-form-radio>
								</b-form-radio-group>
							</b-form-group>
						</b-col>
					</b-form-row>
				</b-col>

				<b-col v-if="template.firmware < 3" cols="12">
					<b-checkbox v-model="bedIsNozzle" v-preset.left="preset.bed_is_nozzle" :title="$t('heaters.bedNozzleDescription')">{{$t('heaters.bedNozzle')}}</b-checkbox>
				</b-col>

				<b-col :cols="template.firmware < 3 ? 12 : 6">
					<b-checkbox v-model="chamberPresent" :disabled="template.firmware >= 3" v-preset.left="preset.chamber.present" :title="$t('heaters.chamberDescription')">{{$t('heaters.chamber')}}</b-checkbox>
					<b-form-row v-show="chamberPresent" class="mt-3 pl-4">
						<b-col v-if="template.firmware < 3">
							<b-form-group :label="$t('heaters.chamberOutput')">
								<b-select v-model.number="chamberHeater" v-preset :title="$t('heaters.chamberOutputDescription')" :options="chamberHeaters"></b-select>
							</b-form-group>
						</b-col>
						<b-col cols="auto">
							<b-form-group :label="$t('heaters.chamberControl')">
								<b-form-radio-group buttons button-variant="outline-primary" v-model="chamberPid" v-preset="preset.chamber.use_pid" :title="$t('heaters.chamberControlDescription')" name="chamberPid">
									<b-form-radio :value="true">PID</b-form-radio>
									<b-form-radio :value="false">Bang-Bang</b-form-radio>
								</b-form-radio-group>
							</b-form-group>
						</b-col>
					</b-form-row>
				</b-col>
			</b-row>
		</b-card>

		<b-card no-body class="mt-3">
			<template #header>
				<span class="mt-2">{{$t('heaters.configuration')}}</span>
				<b-button-group v-if="template.firmware < 3" class="float-right">
					<b-button size="sm" variant="success" :disabled="!canAddNozzle" @click="addNozzle()">
						<font-awesome-icon icon="plus"></font-awesome-icon> {{$t('heaters.addNozzle')}}
					</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveNozzle" @click="removeNozzle()">
						<font-awesome-icon icon="minus"></font-awesome-icon> {{$t('heaters.removeNozzle')}}
					</b-button>
				</b-button-group>
			</template>

			<table class="table mb-0 table-heaters">
				<thead>
					<th>{{$tc('heaters.title', 1)}}</th>
					<th>{{$t('heaters.type')}}</th>
					<th>{{$t('heaters.tempLimit')}}</th>
					<th>{{$t('heaters.pwmLimit')}}</th>
					<th>R25</th>
					<th>β</th>
					<th>C</th>
					<th v-if="template.firmware < 3">{{$t('heaters.sensorChannel')}}</th>
				</thead>
				<tbody>
					<tr v-for="(heater, index) in template.heaters" :key="index" v-if="heater != null">
						<td>
							{{ (template.firmware < 3) ? ((index === 0) ? 'Bed' : `E${index - 1}`) : index }}
						</td>
						<td>
							{{ (template.bed.present && template.bed.heater === index) ? $t('heaters.bed')
								: (template.chamber.present && template.chamber.heater === index) ? $t('heaters.chamber')
									: $t('heaters.nozzle') }}
						</td>
						<td class="limit">
							<b-input-group append="C">
								<b-form-input :value="heater.temp_limit" @input="updateHeater({ heater: index, tempLimit: parseFloat($event) })" v-preset="getPresetHeater(index).temp_limit" :title="$t('heaters.tempLimitDescription')" min="-273" max="1999" type="number" step="any" required></b-form-input>
							</b-input-group>
						</td>
						<td class="pwm">
							<b-input-group append="%">
								<b-form-input :value="heater.scale_factor" @input="updateHeater({ heater: index, pwmLimit: parseFloat($event) })" v-preset="getPresetHeater(index).scale_factor" :title="$t('heaters.pwmLimitDescription')" :disabled="isPwmLimitDisabled(index)" min="0" max="100" type="number" step="any" required></b-form-input>
							</b-input-group>
						</td>
						<td class="thermistor">
							<thermistor-input :index="index" :preset-heater="getPresetHeater(index)" :title="$t('heaters.thermistorResistance')" parameter="thermistor" unit="Ω" min="1"></thermistor-input>
						</td>
						<td class="beta">
							<thermistor-input :index="index" :preset-heater="getPresetHeater(index)" :title="$t('heaters.beta')" parameter="beta" unit="K" min="1"></thermistor-input>
						</td>
						<td>
							<thermistor-input :index="index" :preset-heater="getPresetHeater(index)" :title="$t('heaters.coefficient')" parameter="c"></thermistor-input>
						</td>
						<td v-if="template.firmware < 3">
							<sensor-input :index="index" v-preset="index"></sensor-input>
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
import SensorInput from '../components/HeatersSensorInput.vue'

import Template from '../store/Template.js'

export default {
	components: {
		'thermistor-input': ThermistorInput,
		'sensor-input': SensorInput
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
			for(let i = 0; i < Template.getMaxHeaters(this.template); i++) {
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
			for(let i = 0; i < Template.getMaxHeaters(this.template); i++) {
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
