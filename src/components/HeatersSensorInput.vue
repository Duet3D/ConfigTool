<template>
	<b-select :value="value" @change="setValue" :state="isValid" :size="size" title="Assigned sensor channel for this heater">
		<optgroup v-for="(group, name) in sensors" :label="name">
			<option v-for="option in group" :value="option.value" :disabled="option.disabled" v-text="option.text"></option>
		</optgroup>
	</b-select>
</template>

<script>
'use strict'

import { mapState, mapMutations } from 'vuex'

import ExpansionBoards from '../store/ExpansionBoards.js'
import Template from '../store/Template.js'

export default {
	props: {
		index: {
			type: Number,
			required: true
		},
		size: String
	},
	computed: {
		...mapState({
			board: state => state.board,
			template: state => state.template
		}),
		value() {
			if (this.template.firmware < 3) {
				return this.template.heaters[this.index].channel;
			}
			return `${this.template.heaters[this.index].sensor_type}/${this.template.heaters[this.index].sensor_pin}`;
		},
		isValid() {
			if ((this.template.firmware >= 3) && (this.template.heaters[this.index].sensor_type === null || this.template.heaters[this.index].sensor_pin === null)) {
				return false;
			}
		},
		sensors() {
			const sensors = {
				'Thermistors': [],
				'PT1000': [],
				'MAX31855 (K-Type Thermocouple)': [],
				'MAX31856 (K-Type Thermocouple)': [],
				'MAX31865 (PT100)': []
			};

			if (this.template.firmware >= 3) {
				const selectedPort = this.value ? this.value.split('/')[1] : null;

				for (let i = 0; i < this.board.analogPorts.length; i++) {
					const port = this.board.analogPorts[i];
					const disabled = !Template.isSamePin(selectedPort, port) && Template.isPinBlocked(this.template, port);
					sensors.Thermistors.push({
						text: port,
						value: `thermistor/${port}`,
						disabled
					});
					sensors.PT1000.push({
						text: `PT1000 on ${port}`,
						value: `pt1000/${port}`,
						disabled
					});
				}

				for (let i = 0; i < this.board.spiCsPorts.length; i++) {
					const port = this.board.spiCsPorts[i];
					const disabled = !Template.isSamePin(selectedPort, port) && Template.isPinBlocked(this.template, port);
					sensors['MAX31855 (K-Type Thermocouple)'].push({
						text: `MAX31855 on ${port}`,
						value: `thermocouple-max31855/${port}`,
						disabled
					});
					sensors['MAX31856 (K-Type Thermocouple)'].push({
						text: `MAX31856 on ${port}`,
						value: `thermocouple-max31856/${port}`,
						disabled
					});
					sensors['MAX31865 (PT100)'].push({
						text: `MAX31865 on ${port}`,
						value: `rtd-max31865/${port}`,
						disabled
					});
				}

				let expIndex = 1, toolIndex = 121;
				for (let i = 0; i < this.template.expansion_boards.length; i++) {
					const expansionBoard = ExpansionBoards[this.template.expansion_boards[i]];
					const canAddress = expansionBoard.isToolBoard ? toolIndex++ : expIndex++;
					const prefix = (this.template.board === 'duet3') ? `Board ${canAddress} - ` : '';
					const portPrefix = (this.template.board === 'duet3') ? `${canAddress}.` : '';

					for (let k = 0; k < expansionBoard.analogPorts.length; k++) {
						const port = portPrefix + expansionBoard.analogPorts[k];
						const disabled = !Template.isSamePin(selectedPort, port) && Template.isPinBlocked(this.template, port);
						sensors.Thermistors.push({
							text: prefix + expansionBoard.analogPorts[k],
							value: `thermistor/${port}`,
							disabled
						});
						sensors.PT1000.push({
							text: prefix + `PT1000 on ${expansionBoard.analogPorts[k]}`,
							value: `pt1000/${port}`,
							disabled
						});
					}

					for (let k = 0; k < expansionBoard.spiCsPorts.length; k++) {
						const port = portPrefix + expansionBoard.spiCsPorts[k];
						const disabled = !Template.isSamePin(selectedPort, port) && Template.isPinBlocked(this.template, port);
						sensors['MAX31855 (K-Type Thermocouple)'].push({
							text: prefix + `MAX31855 on ${expansionBoard.spiCsPorts[k]}`,
							value: `thermocouple-max31855/${port}`,
							disabled
						});
						sensors['MAX31856 (K-Type Thermocouple)'].push({
							text: prefix + `MAX31856 on ${expansionBoard.spiCsPorts[k]}`,
							value: `thermocouple-max31856/${port}`,
							disabled
						});
						sensors['MAX31865 (PT100)'].push({
							text: prefix + `MAX31865 on ${expansionBoard.spiCsPorts[k]}`,
							value: `rtd-max31865/${port}`,
							disabled
						});
					}
				}
			} else {
				let eIndex = 0;
				for (let i = 0; i < this.board.analogPorts.length; i++) {
					if (this.board.analogPorts[i].indexOf('zprobe') === -1) {
						if (i === 0) {
							sensors.Thermistors.push({ value: 0, text: 'Bed Thermistor' });
							sensors.PT1000.push({ value: 500, text: 'PT1000 on Bed Input' });
						} else if (i === 3 && this.board.name === 'duetm10') {
							sensors.Thermistors.push({ value: 3, text: 'C Thermistor' });
							sensors.PT1000.push({ value: 503, text: 'PT1000 on C Input' });
							eIndex++;
						} else {
							sensors.Thermistors.push({ value: i, text: `E${i - 1} Thermistor` });
							sensors.PT1000.push({ value: 500 + i, text: `PT1000 on E${i - 1} Input` });
							eIndex++;
						}
					}
				}

				for (let i = 0; i < this.board.spiCsPorts.length; i++) {
					sensors['MAX31855 (K-Type Thermocouple)'].push({ value: 100 + i, text: `MAX31855 on CS${i + 1}` });
					sensors['MAX31856 (K-Type Thermocouple)'].push({ value: 150 + i, text: `MAX31856 on CS${i + 1}` });
					sensors['MAX31865 (PT100)'].push({ value: 200 + i, text: `MAX31865 on CS${i + 1}` });
				}

				for (let i = 0; i < this.template.expansion_boards.length; i++) {
					const expansionBoard = ExpansionBoards[this.template.expansion_boards[i]];

					for (let k = 0; k < expansionBoard.analogPorts.length; k++) {
						sensors.Thermistors.push({ value: eIndex + 1, text: `E${eIndex} Thermistor` });
						sensors.PT1000.push({ value: 501 + eIndex, text: `PT1000 on E${eIndex} Input` });
						eIndex++;
					}

					// SPI channels on expansion boards are not yet suported
				}
			}

			return sensors;
		}
	},
	methods: {
		...mapMutations(['updateHeater']),
		setValue(value) {
			if (this.template.firmware < 3) {
				this.updateHeater({ heater: this.index, channel: parseInt(value) })
			} else if (value) {
				const vals = value.split('/');
				this.updateHeater({ heater: this.index, sensor_type: vals[0], sensor_pin: vals[1] });
			}
		}
	}
}
</script>
