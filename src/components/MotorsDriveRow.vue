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
	width: 9rem;
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
			<b-select v-model.number="drive.direction" v-preset="presetDrive.direction" title="Direction of this drive">
				<option value="0">Backwards</option>
				<option value="1">Forwards</option>
			</b-select>
		</td>
		<td :class="{ 'reduce-padding' : drive.microstepping_interpolation }">
			<b-select v-model="microsteppingOption" v-preset="presetDrive.microsteppingOption" title="Microstepping value (M350)" :disabled="!board.microstepping">
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
			<br/>
			<span v-if="drive.microstepping_interpolation" class="small-text">interpolated to x256</span>
		</td>
		<td>
			<steps-per-mm-input :drive="drive" :presetDrive="presetDrive" :index="index" />
		</td>
		<td>
			<b-form-input v-model.number="drive.instant_dv" v-preset="presetDrive.instant_dv" title="Maximum allowed instantenous speed change (M566)" min="0.1" :max="drive.max_speed" type="number" step="any" required />
		</td>
		<td>
			<b-form-input v-model.number="drive.max_speed" v-preset="presetDrive.max_speed" title="Maximum allowed speed (M203)" :min="drive.instant_dv" type="number" step="any" required />
		</td>
		<td>
			<b-form-input v-model.number="drive.acceleration" v-preset="presetDrive.acceleration" title="Drive acceleration (M201)" min="1" type="number" step="any" required />
		</td>
		<td>
			<b-form-input v-model.number="drive.current" v-preset="presetDrive.current" title="Motor current (M906)" min="300" :max="board.motorLimitCurrent" type="number" step="any" required />
				<span v-if="drive.current >= board.motorWarningCurrent" v-b-tooltip.hover title="Your specified motor current exceeds the safe range. You may have to use extra cooling to prevent damage of your stepper drivers!" class="text-warning small-text"><font-awesome-icon icon="exclamation-triangle" /> <u class="ml-1">Warning!</u></span>
		</td>
		<td>
			<b-select v-model.number="drive.driver" :options="drivers" v-b-tooltip.hover title="Motor driver (M584)" />
		</td>
	</tr>
</template>

<script>
'use strict';

import MotorsStepsPerMmInput from './MotorsStepsPerMmInput.vue'

export default {
	components: {
		'steps-per-mm-input': MotorsStepsPerMmInput
	},
	computed: {
		microsteppingOption: {
			get() {
				return this.drive.microstepping + (this.drive.microstepping_interpolation ? "_i" : "");
			},
			set(value) {
				const values = value.split('_');
				this.drive.microstepping = parseInt(values[0]);
				this.drive.microstepping_interpolation = values.length > 1;
			}
		}
	},
	methods: {
		getDriveCaption(drive) {
			switch (drive) {
				case 0: return "X";
				case 1: return "Y";
				case 2: return "Z";
				default: return "E" + (drive - 3);
			}
		}
	},
	props: {
		index: Number,
		drive: Object,
		presetDrive: Object,
		drivers: Array
	}
}
</script>
