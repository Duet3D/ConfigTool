<style scoped>
.reduce-padding {
	padding-bottom: 0.25rem;
}

.small-text {
	font-size: 0.75rem;
}

tr > th:first-child,
tr > td:first-child {
	padding-top: 1.25rem;
	text-align: center;
	width: 4.5rem;
}
tr > td:nth-child(2) > select {
	width: 8.5rem;
}
tr > td:nth-child(3) > select {
	width: 8rem;
}
tr > td:nth-child(4) > div,
tr > td:nth-child(6) > input,
tr > td:nth-child(8) > input {
	width: 5.5rem;
}
tr > td:nth-child(5) > input {
	width: 7rem;
}
tr > td:last-child > select {
	width: 6rem;
}
</style>

<template>
	<tr>
		<td v-text="getDriveCaption(index)"></td>
		<td>
			<b-select :value="direction" @change="updateDrive({ drive: index, forwards: $event })" v-preset="presetDrive.direction" title="Direction of this drive">
				<option :value="false">Backwards</option>
				<option :value="true">Forwards</option>
			</b-select>
		</td>
		<td v-show="board.stepperDriver==''">
			<b-select v-model="driverOption" v-preset title="Stepper Driver">
				<option v-for="(value, name) in stepperDriverTimings" v-bind:key="name" v-bind:value="name">{{name}}</option>
			</b-select> 
			
			<b-form-group label="Stepper Timings:" v-show="drive.stepperDriver == 'Custom'">
				<timing-input :drive="drive" :index="index"/>
			</b-form-group>
		</td>
		<!--td :class="{ 'reduce-padding' : drive.microstepping_interpolation }">
			<b-select v-model="microsteppingOption" v-preset="presetMicrosteppingOption" title="Microstepping value (M350)" :disabled="!board.microstepping">
				<option value="1">x1</option>
				<option v-if="board.microsteppingInterpolation" value="1_i" class="hidden">x1 (on)</option>
				<option value="2">x2</option>
				<option v-if="board.microsteppingInterpolation" value="2_i" class="hidden">x2 (on)</option>
				<option value="4">x4</option>
				<option v-if="board.microsteppingInterpolation" value="4_i" class="hidden">x4 (on)</option>
				<option value="8">x8</option>
				<option v-if="board.microsteppingInterpolation" value="8_i" class="hidden">x8 (on)</option>
				<option value="16">x16</option>
				<option value="16_i">x16 (on)</option>
				<option value="32">x32</option>
				<option v-if="board.microsteppingInterpolation" value="32_i" class="hidden">x32 (on)</option>
				<option value="64">x64</option>
				<option v-if="board.microsteppingInterpolation" value="64_i" class="hidden">x64 (on)</option>
				<option value="128">x128</option>
				<option v-if="board.microsteppingInterpolation" value="128_i" class="hidden">x128 (on)</option>
				<option value="256">x256</option>
			</b-select>
			<br>
			<span v-if="drive.microstepping_interpolation" class="small-text">interpolated to x256</span>
		</td-->
		<td>
			<steps-per-mm-input :index="index" :drive="drive" :preset-drive="presetDrive"></steps-per-mm-input>
		</td>
		<td>
			<b-form-input v-model.number="instantDv" v-preset="presetDrive.instant_dv" title="Maximum allowed instantenous speed change (M566)" min="0.1" :max="drive.max_speed" type="number" step="any" required></b-form-input>
		</td>
		<td>
			<b-form-input v-model.number="maxSpeed" v-preset="presetDrive.max_speed" title="Maximum allowed speed (M203)" :min="drive.instant_dv" type="number" step="any" required></b-form-input>
		</td>
		<td>
			<b-form-input v-model.number="acceleration" v-preset="presetDrive.acceleration" title="Drive acceleration (M201)" min="1" type="number" step="any" required></b-form-input>
		</td>
		<td>
			<b-form-input v-model.number="current" v-preset="presetDrive.current" title="Motor current (M906)" min="300" :max="board.motorLimitCurrent" type="number" step="any" required></b-form-input>
			<span v-if="current >= board.motorWarningCurrent" v-b-tooltip.hover title="Your specified motor current exceeds the safe range. You may have to use extra cooling to prevent damage of your stepper drivers!" class="text-warning small-text">
				<font-awesome-icon icon="exclamation-triangle"></font-awesome-icon> <u class="ml-1">Warning!</u>
			</span>
		</td>
		<td v-if="template.firmware < 3">
			<b-select v-model.number="driver" :options="drivers" v-preset="index" title="Motor driver (M584)"></b-select>
		</td>
	</tr>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'

import MotorsStepsPerMmInput from './MotorsStepsPerMmInput.vue'
import StepperTimingInput from '../components/StepperTimingInput.vue'

export default {
	data() {
		return {
			stepperDriverTimings: {
				"DRV8825": "1.9:1.9:0.65:0.65",
				"A4988": "1.0:1.0:0.2:0.2",
				"A4982": "1.0:1.0:0.2:0.2",
				"A5984": "1.0:1.0:0.4:0.4",
				"TMC220x": "0.1:0.1:0.02:0.02",
				"TMC222x": "0.1:0.1:0.02:0.02",
				"THB6128": "0.5:0.5:0.5:0.5",
				"Custom": "1.0:1.0:0.4:0.4",
			},
		}
	},
	components: {
		'steps-per-mm-input': MotorsStepsPerMmInput,
		'timing-input': StepperTimingInput

	},
	computed: {
		...mapState(['board', 'preset', 'template']),
		drive() { return this.template.drives[this.index]; },
		presetDrive() { return this.preset.drives[Math.min(this.index, this.preset.drives.length - 1)]; },
		direction: {
			get() { return this.drive.direction == 1; },
			set(value) {
				this.updateDrive({
					drive: this.index,
					direction: value
				});
			}
		},
		driverOption: {
			get() {
				return this.drive.stepperDriver;
			},
			set(value) {	
				this.updateDrive({
					drive: this.index,
					stepperDriver: value,
					stepperDriverTimings: this.stepperDriverTimings[value]

				});
			}
		},
		microsteppingOption: {
			get() { return this.drive.microstepping + (this.drive.microstepping_interpolation ? '_i' : ''); },
			set(value) {
				const values = value.split('_');
				this.updateDrive({
					drive: this.index,
					microstepping: parseInt(values[0]),
					interpolated: values.length > 1
				});
			}
		},
		presetMicrosteppingOption() { return this.presetDrive.microstepping + (this.presetDrive.microstepping_interpolation ? '_i' : ''); },
		instantDv: {
			get() { return this.drive.instant_dv; },
			set(value) {
				this.updateDrive({
					drive: this.index,
					instantDv: value
				});
			}
		},
		maxSpeed: {
			get() { return this.drive.max_speed; },
			set(value) {
				this.updateDrive({
					drive: this.index,
					maxSpeed: value
				});
			}
		},
		acceleration: {
			get() { return this.drive.acceleration; },
			set(value) {
				this.updateDrive({
					drive: this.index,
					acceleration: value
				});
			}
		},
		current: {
			get() { return this.drive.current; },
			set(value) {
				this.updateDrive({
					drive: this.index,
					current: value
				});
			}
		},
		driver: {
			get() { return this.drive.driver; },
			set(value) {
				this.updateDrive({
					drive: this.index,
					driver: value
				});
			}
		}
	},
	methods: {
		...mapMutations(['updateDrive']),
		getDriveCaption(drive) {
			switch (drive) {
				case 0: return 'X';
				case 1: return 'Y';
				case 2: return 'Z';
				default: return 'E' + (drive - 3);
			}
		}
	},
	props: {
		index: {
			type: Number,
			required: true
		},
		drivers: {
			type: Array,
			required: true
		}
	}
}
</script>
