<style scoped>
.r25 {
	width: 9.5rem;
}

.table-heaters > tbody > tr > td:first-child,
.table-heaters > tbody > tr > td:nth-child(2) {
	padding-top: 1.125rem;
}
</style>

<template>
	<b-container>
		<b-card header="General Heater Settings">
			<b-checkbox v-model="template.bed.present" v-preset title="Enable the heated bed">Heated Bed</b-checkbox>
			<b-form-row v-if="template.bed.present" class="mt-3 pl-4">
				<b-col>
					<b-form-group label="Bed Heater Output:">
						<b-select v-model.number="template.bed.heater" v-preset title="Output channel for the heated bed" :options="bedHeaters" />
					</b-form-group>
				</b-col>
				<b-col cols="auto">
					<b-form-group label="Control Method:">
						<b-form-radio-group buttons button-variant="outline-primary" v-model="bedPid" v-preset title="Control method for the bed heater" name="bedPid">
							<b-form-radio value="pid">PID</b-form-radio>
							<b-form-radio value="bangbang">Bang-Bang</b-form-radio>
						</b-form-radio-group>
					</b-form-group>
				</b-col>
			</b-form-row>
			<br v-else/>
			<b-checkbox v-model="template.bed_is_nozzle" v-preset title="Check this if you want to connect the first nozzle heater to the hot bed terminal">Assign Bed Heater to First Nozzle</b-checkbox>
			<br/>
			<b-checkbox v-model="template.chamber.present" v-preset title="Enable a heated chamber">Heated Chamber</b-checkbox>
			<b-form-row v-if="template.chamber.present" class="mt-3 pl-4">
				<b-col>
					<b-form-group label="Chamber Heater Output:">
						<b-select v-model.number="template.chamber.heater" v-preset title="Output channel for the heated chamber" :options="chamberHeaters" />
					</b-form-group>
				</b-col>
				<b-col cols="auto">
					<b-form-group label="Control Method:">
						<b-form-radio-group buttons button-variant="outline-primary" v-model="chamberPid" v-preset title="Control method for the chamber heater" name="chamberPid">
							<b-form-radio value="pid">PID</b-form-radio>
							<b-form-radio value="bangbang">Bang-Bang</b-form-radio>
						</b-form-radio-group>
					</b-form-group>
				</b-col>
			</b-form-row>
			<br v-else/>
			<!-- FIXME: If uncommenting the line below, make sure AB is recalculated automatically when R25+BETA change! -->
			<!--<b-checkbox v-if="template.firmware > 1.16" v-model="useSteinhartHart" v-b-tooltip.hover title="RepRapFirmware versions up to v1.16 rely on the β parameter equation to calculate temperatures, however starting from RepRapFirmware 1.17 the Steinhart-Hart equation is used for improved accuarcy.">Use Steinhart-Hart Equation for Higher Accuracy</b-checkbox>-->
		</b-card>

		<b-card no-body class="mt-3">
			<template slot="header">
				<span class="mt-2">Heater Configuration</span>
				<b-button-group class="float-right">
					<b-button size="sm" variant="success" :disabled="!canAddNozzle" @click="addNozzle"><font-awesome-icon icon="plus" /> Add Nozzle</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveNozzle" @click="removeNozzle"><font-awesome-icon icon="minus" /> Remove Nozzle</b-button>
				</b-button-group>
			</template>
			<table class="table mb-0 table-heaters">
				<thead>
					<th>Heater</th>
					<th>Type</th>
					<th>Temp. Limit</th>
					<th>PWM Limit</th>
					<th v-show="!useSteinhartHart">R25</th>
					<th v-show="!useSteinhartHart">β</th>
					<th v-show="useSteinhartHart">A</th>
					<th v-show="useSteinhartHart">B</th>
					<th v-show="template.firmware > 1.16">C</th>
					<th>Sensor Channel</th>
				</thead>
				<tbody>
					<tr v-for="(heater, index) in template.heaters" v-if="heater != null">
						<td>
							{{ (index == 0) ? "Bed" : `E${index - 1}` }}
						</td>
						<td>
							{{ (template.bed.present && template.bed.heater == index) ? "Heated&nbsp;Bed" :
							(template.chamber.present && template.chamber.heater == index) ? "Chamber" :
							"Nozzle" }}
						</td>
						<td>
							<b-input-group append="C">
								<b-form-input v-model.number="heater.temp_limit" v-preset="getPresetHeater(index).temp_limit" title="Maximum allowed temperature of this heater before a temperature fault is raised" min="-273" max="1999" type="number" step="any" required />
							</b-input-group>
						</td>
						<td>
							<b-input-group append="%">
								<b-form-input v-model.number="heater.scale_factor" v-preset="getPresetHeater(index).scale_factor" title="Final PID heater scale factor. You can change this to compensate voltage and heater resistance parameters" :disabled="isPwmLimitDisabled(index)" min="0" max="100" type="number" step="any" required />
							</b-input-group>
						</td>
						<td v-show="!useSteinhartHart" class="r25">
							<thermistor-input :heater="heater" :preset-heater="getPresetHeater(index)" title="Heater thermistor resistance at 25C" :useSteinhartHart="false" parameter="thermistor" unit="Ω" min="1" />
						</td>
						<td v-show="!useSteinhartHart">
							<thermistor-input :heater="heater" :preset-heater="getPresetHeater(index)" title="β model coefficient" :useSteinhartHart="false" parameter="beta" unit="K" min="1" />
						</td>
						<td v-show="useSteinhartHart">
							<thermistor-input :heater="heater" :preset-heater="getPresetHeater(index)" title="A coefficient of the Steinhart-Hart equation" :useSteinhartHart="true" parameter="a" />
						</td>
						<td v-show="useSteinhartHart">
							<thermistor-input :heater="heater" :preset-heater="getPresetHeater(index)" title="B coefficient of the Steinhart-Hart equation" :useSteinhartHart="true" parameter="b" />
						</td>
						<td v-show="template.firmware > 1.16">
							<thermistor-input :heater="heater" :preset-heater="getPresetHeater(index)" title="C coefficient of the Steinhart-Hart equation. May be used to improve the β model parameters too" :useSteinhartHart="useSteinhartHart" parameter="c" />
						</td>
						<td>
							<sensor-select v-model="heater.channel" v-preset="index" title="Assigned sensor channel for this heater" :options="sensors" />
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import ThermistorInput from '../components/HeatersThermistorInput.vue'
import SensorSelect from '../components/HeatersSensorSelect.vue'

export default {
	components: {
		'thermistor-input': ThermistorInput,
		'sensor-select': SensorSelect
	},
	computed: {
		bedHeaters() {
			let heaters = [];
			for(let i = 0; i < this.board.maxHeaters; i++) {
				const isDisabled = ((i == 0 && this.template.bed_is_nozzle) ||
									(this.template.chamber.present && this.template.chamber.heater == i) ||
									(this.template.probe.type == "bltouch" && this.template.probe.pwm_channel == i));
				heaters.push({ text: (i == 0) ? "Bed Heater" : `E${i - 1} Heater`, value: i, disabled: isDisabled });
			}
			return heaters;
		},
		bedPid: {
			get() { return this.template.bed.use_pid ? "pid" : "bangbang"; },
			set(value) { this.template.bed.use_pid = (value == "pid"); }
		},
		chamberHeaters() {
			let heaters = [];
			for(let i = 0; i < this.board.maxHeaters; i++) {
				const isDisabled = ((i == 0 && this.template.bed_is_nozzle) ||
									(this.template.bed.present && this.template.bed.heater == i) ||
									(this.template.probe.type == "bltouch" && this.template.probe.pwm_channel == i));
				heaters.push({ text: (i == 0) ? "Bed Heater" : `E${i - 1} Heater`, value: i, disabled: isDisabled });
			}
			return heaters;
		},
		chamberPid: {
			get() { return this.template.chamber.use_pid ? "pid" : "bangbang"; },
			set(value) { this.template.chamber.use_pid = (value == "pid"); }
		},
		canAddNozzle() {
			const maxNozzles = this.board.maxHeaters -
				(this.template.bed.present ? 1 : 0) -
				(this.template.chamber.present ? 1 : 0) -
				((this.template.probe.type == "bltouch" && this.template.probe.pwm_channel < this.board.maxHeaters) ? 1 : 0);
			return this.template.num_nozzles < maxNozzles;
		},
		canRemoveNozzle() { return this.template.num_nozzles > 0; }
	},
	data() {
		return {
			heaters: [],
			sensors: {
				"Thermistors": [],
				"PT1000": [],
				"MAX31855 (K-Type Thermocouple)": [],
				"MAX31856 (K-Type Thermocouple)": [],
				"MAX31856 (PT100)": []
			},
			useSteinhartHart: false
		}
	},
	methods: {
		getPresetHeater(heater) {
			return (heater >= this.preset.heaters.length) ? this.preset.heaters[this.preset.heaters.length - 1] : this.preset.heaters[heater];
		},
		isPwmLimitDisabled(heater) {
			return ((this.template.bed.present && !this.template.bed.use_pid && this.template.bed.heater == heater) ||
					(this.template.chamber.present && !this.template.chamber.use_pid && this.template.chamber.heater == heater));
		}
	},
	beforeMount() {
		for(let i = 0; i < this.board.maxHeaters; i++) {
			const isChannelAssigned = (this.template.probe.type == "bltouch" && this.template.probe.pwm_channel == i);
			this.heaters.push({ value: 0, text: (i == 0) ? "Bed Output" : `E${i - 1} Output`, disabled: isChannelAssigned });
		}

		if (this.template.firmware < 1.20) {
			delete this.sensors.PT1000;
		}

		for(let i = 0; i < this.board.maxThermistors; i++) {
			if (i == 0) {
				this.sensors.Thermistors.push({ value: 0, text: "Bed Thermistor" });
				if (this.template.firmware >= 1.20) {
					this.sensors.PT1000.push({ value: 500, text: "PT1000 on Bed Input" });
				}
			} else if (i == 3 && this.board.name == "duetm10") {
				this.sensors.Thermistors.push({ value: 3, text: "C Thermistor" });
				if (this.template.firmware >= 1.20) {
					this.sensors.PT1000.push({ value: 503, text: "PT1000 on C Input" });
				}
			} else {
				this.sensors.Thermistors.push({ value: i, text: `E${i - 1} Thermistor` });
				if (this.template.firmware >= 1.20) {
					this.sensors.PT1000.push({ value: 500 + i, text: `PT1000 on E${i - 1} Input` });
				}
			}
		}

		for(let i = 0; i < this.board.maxRtdBoards; i++) {
			this.sensors["MAX31855 (K-Type Thermocouple)"].push({ value: 100 + i, text: `MAX31855 on CS${i + 1}` });
			this.sensors["MAX31856 (K-Type Thermocouple)"].push({ value: 150 + i, text: `MAX31856 on CS${i + 1}` });
			this.sensors["MAX31856 (PT100)"].push({ value: 200 + i, text: `MAX31856 on CS${i + 1}` });
		}
	}
}
</script>
