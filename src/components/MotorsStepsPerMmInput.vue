<style scoped>
.set-button {
	margin-top: 0.05rem;
}
</style>

<template>
	<div>
		<b-form-input :id="id" v-model.number="stepsPerMm" v-preset="presetDrive.steps_per_mm" :title="$t('motors.steps.steps')" min="1" type="number" step="any" required></b-form-input>
		<b-popover :target="id" :show.sync="popoverShown" placement="right" :title="$t('motors.steps.calculate')" triggers="focus">
			<b-form>
				<b-form-group :label="$t('motors.steps.angle')">
					<b-select v-model.number="stepAngle">
						<option value="0.9">0.9° (400 steps per rev)</option>
						<option value="1.8">1.8° (200 steps per rev)</option>
						<option value="7.5">7.5° (48 steps per rev)</option>
					</b-select>
				</b-form-group>
				<b-form-group v-if="driveType != 'extruder'" label-cols="5" :label="$t('motors.steps.driveType')">
					<b-select v-model="driveType">
						<option value="belt">{{$t('motors.steps.belt')}}</option>
						<option value="leadscrew">{{$t('motors.steps.leadscrew')}}</option>
					</b-select>
				</b-form-group>
				<template v-if="driveType == 'belt'">
					<b-form-group label-cols="5" :label="$t('motors.steps.preset')">
						<b-select v-model="beltPreset">
							<option v-for="option in belt.presets" :value="option.value" v-text="option.text"></option>
							<option value="custom">{{$t('motors.steps.custom')}}</option>
						</b-select>
					</b-form-group>
					<b-form-group label-cols="5" :label="$t('motors.steps.beltPitch')">
						<b-input-group append="mm">
							<b-form-input v-model.number="belt.pitch" min="0.1" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
					<b-form-group label-cols="5" :label="$t('motors.steps.pulleyTeeth')">
						<b-form-input v-model.number="belt.pulleyTeeth" min="1" type="number" step="1" required></b-form-input>
					</b-form-group>
				</template>
				<template v-else-if="driveType == 'leadscrew'">
					<b-form-group label-cols="5" :label="$t('motors.steps.preset')">
						<b-select v-model="leadscrewPreset">
							<optgroup v-for="(group, name) in leadscrew.presets" :label="name">
								<option v-for="option in group" :value="option.value" v-text="option.text"></option>
							</optgroup>
							<option value="custom">{{$t('motors.steps.custom')}}</option>
						</b-select>
					</b-form-group>
					<b-form-group label-cols="5" :label="$t('motors.steps.lead')">
						<b-input-group append="mm">
							<b-form-input v-model.number="leadscrew.lead" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
					<b-form-group label-cols="5" :label="$t('motors.steps.gear')">
						<table>
							<tr>
								<td>
									<b-form-input v-model.number="leadscrew.ratio1" class="no-spinners" type="number" step="any" required></b-form-input>
								</td>
								<td>:</td>
								<td>
									<b-form-input v-model.number="leadscrew.ratio2" class="no-spinners" type="number" step="any" required></b-form-input>
								</td>
							</tr>
						</table>
					</b-form-group>
				</template>
				<template v-else>
					<b-form-group label-cols="5" :label="$t('motors.steps.hob')">
						<b-input-group append="mm" class="mt-2">
							<b-form-input v-model.number="extruder.hob" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
					<b-form-group label-cols="5" :label="$t('motors.steps.gear')">
						<table>
							<tr>
								<td>
									<b-form-input v-model.number="extruder.ratio1" class="no-spinners" type="number" step="any" required></b-form-input>
								</td>
								<td>:</td>
								<td>
									<b-form-input v-model.number="extruder.ratio2" class="no-spinners" type="number" step="any" required></b-form-input>
								</td>
							</tr>
						</table>
					</b-form-group>
					<b-form-group label-cols="5" :label="$t('motors.steps.amount')">
						<b-input-group append="mm" class="mt-2">
							<b-form-input v-model.number="extruder.amountExtruded" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
					<b-form-group label-cols="5" :label="$t('motors.steps.actually')">
						<b-input-group append="mm" class="mt-2">
							<b-form-input v-model.number="extruder.actuallyExtruded" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</template>
				<b-card bg-variant="light">
					<p>{{$t('motors.steps.resulting')}}</p>
					<h3 :class="{ 'text-danger' : !isValid }">
						{{ isValid ? calculatedSteps.toFixed(2) : $t('motors.steps.error') }}
						<b-button size="sm" variant="primary" class="float-right set-button" :disabled="!isValid" @click="apply">
							<font-awesome-icon icon="check"></font-awesome-icon> {{$t('motors.steps.set')}}
						</b-button>
					</h3>
					<span>{{$t('motors.steps.at')}} x{{ drive.microstepping }} {{$t('motors.steps.microstepping')}}</span>
				</b-card>
			</b-form>
		</b-popover>
	</div>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'

let idCounter = 0;

export default {
	computed: {
		...mapState(['preset', 'template']),
		beltPreset: {
			get() {
				for (let i in this.belt.presets) {
					const preset = this.belt.presets[i];
					if (preset.value == this.belt.pitch) {
						return preset.value;
					}
				}
				return 'custom';
			},
			set(value) {
				if (value !== 'custom') {
					this.belt.pitch = value;
				}
			}
		},
		leadscrewPreset: {
			get() {
				for (let key in this.leadscrew.presets) {
					for (let i in this.leadscrew.presets[key]) {
						const preset = this.leadscrew.presets[key][i];
						if (preset.value == this.leadscrew.lead) {
							return preset.value;
						}
					}
				}
				return 'custom';
			},
			set(value) {
				if (value !== 'custom') {
					this.leadscrew.lead = value;
				}
			}
		},
		calculatedSteps() {
			switch (this.driveType) {
				case 'belt':
					return (360.0 * this.drive.microstepping) / (this.belt.pulleyTeeth * this.belt.pitch * this.stepAngle);

				case 'leadscrew': 
					let leadscrewRatio = this.leadscrew.ratio2 / this.leadscrew.ratio1;
					return (360.0 * this.drive.microstepping * leadscrewRatio) / (this.leadscrew.lead * this.stepAngle);

				case 'extruder':
					let gearsRatio = this.extruder.ratio2 / this.extruder.ratio1;
					let correctionFactor = this.extruder.amountExtruded / this.extruder.actuallyExtruded;
					return (360.0 * this.drive.microstepping * gearsRatio * correctionFactor) / (this.extruder.hob * this.stepAngle * Math.PI);
			}
			return 0;
		},
		stepsPerMm: {
			get() { return this.drive.steps_per_mm; },
			set(value) {
				this.updateDrive({
					drive: this.index,
					stepsPerMm: value
				});
			}
		},
		isValid() { return isNumber(this.calculatedSteps); }
	},
	data() {
		return {
			id: `stepsPerMmInput${idCounter++}`,
			popoverShown: false,
			stepAngle: 1.8,
			driveType: (this.index < 2) ? 'belt' : ((this.index === 2) ? 'leadscrew' : 'extruder'),
			belt: {
				presets: [
					{ text: 'GT2', value: 2 },
					{ text: 'MXL', value: 2.03 },
					{ text: 'T2.5', value: 2.5 },
					{ text: 'T5', value: 5 }
				],
				pitch: 2,
				pulleyTeeth: 20
			},
			leadscrew: {
				presets: {
					Metric: [
						{ text: 'M5', value: 0.8 },
						{ text: 'M6', value: 1 },
						{ text: 'M8', value: 1.25 }
					],
					Trapezoid: [
						{ text: 'TR1.5', value: 1.5 },
						{ text: 'TR3', value: 3 },
						{ text: 'TR4', value: 4 },
						{ text: 'TR6', value: 6 }
					]
				},
				lead: 0.8,
				ratio1: 1,
				ratio2: 1
			},
			extruder: {
				hob: 7,
				ratio1: 1,
				ratio2: 3,
				amountExtruded: 10,
				actuallyExtruded: 10
			}
		}
	},
	methods: {
		...mapMutations(['updateDrive']),
		apply() {
			this.stepsPerMm = parseFloat(this.calculatedSteps.toFixed(2));
			this.popoverShown = false;
		}
	},
	props: {
		index: {
			type: Number,
			required: true
		},
		drive: {
			type: Object,
			required: true
		},
		presetDrive: {
			type: Object,
			required: true
		}
	}
}
</script>
