<style scoped>
label.btn {
	align-items: center;
	justify-content: center;
	display: flex;
}

.table td {
	vertical-align: middle;
}
</style>

<template>
	<b-container>
		<b-card no-body>
			<template slot="header">
				<span class="mt-2">Endstop Configuration</span>
				<abbr id="endstop_note" class="float-right" title="When an endstop is hit, the axis position will be set to the corresponding axis minimum/maximum. If your endstop switch is not mounted at the axis end, you will have to add an extra G92 code after the homing move (G1..S1) to your homing files in order to set the new axis position. When homing the Z axis using a Z probe, the firmware will set the new Z position to the specified trigger height">Note</abbr>
			</template>

			<table class="table mb-0">
				<thead>
					<th>Axis</th>
					<th>Endstop Type</th>
					<th>Endstop Location at</th>
				</thead>
				<tbody>
					<tr v-for="i in [0, 1, 2]">
						<td class="pl-4 pt-3">
							{{ ['X', 'Y', 'Z'][i] }}
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" :checked="template.drives[i].endstop_type" @change="updateDrive({ drive: i, et: $event })" v-preset.left="preset.drives[i].endstop_type" title="Endstop type of this axis" :name="'endstopType' + i" class="w-100">
								<b-form-radio :value="0" class="w-100" v-b-tooltip.bottom title="Manual homing via G92">None</b-form-radio>
								<b-form-radio :value="1" :disabled="template.firmware >= 3 && !template.drives[i].endstop_pin" class="w-100" v-b-tooltip.bottom title="Endstop switch pulls signal from GND to +3.3V when triggered (normally-closed switch)">
									{{ template.firmware >= 3 ? 'Switch' : 'Active&nbsp;high&nbsp;(NC)' }}
								</b-form-radio>
								<b-form-radio v-show="template.firmware < 3" :value="2" class="w-100" v-b-tooltip.bottom title="Endstop switch pulls signal from +3.3V to GND when triggered (normally-open switch)">Active&nbsp;low&nbsp;(NO)</b-form-radio>
								<b-form-radio :value="3" class="w-100" :disabled="template.probe.type === 'noprobe'" v-b-tooltip.bottom title="Z-Probe is used">Z-Probe</b-form-radio>
								<b-form-radio :value="4" class="w-100" :disabled="!board.hasMotorLoadDetection" v-b-tooltip.bottom title="Motor stall detection of the stepper drivers">Sensorless</b-form-radio>
							</b-form-radio-group>
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" :checked="template.drives[i].endstop_location" v-preset.right="preset.drives[i].endstop_location" @change="updateDrive({ drive: i, el: $event })" title="Endstop location of this axis" :name="'endstopLocation' + i" class="w-100">
								<b-form-radio :value="1" class="w-100" :disabled="template.geometry.type == 'delta'">Low end</b-form-radio>
								<b-form-radio :value="2" class="w-100">High end</b-form-radio>
							</b-form-radio-group>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>

		<b-alert :show="template.drives.findIndex(drive => drive.endstop_type === 4) !== -1">
			<strong>Note:</strong> Sensorless homing via motor stall detection requires extra configuration steps. See <a href="https://duet3d.dozuki.com/Wiki/Stall_detection_and_sensorless_homing" target="_blank">Duet3D Wiki</a> for further information.
		</b-alert>

		<b-card class="mt-3" header="Z-Probe">
			<b-form-row>
				<b-col>
					<b-form-group label="Probe X Offset:">
						<b-input-group append="mm">
							<b-form-input v-model.number="probeXOffset" v-preset="preset.probe.x_offset" title="Offset of the Z-probe in X direction" :disabled="template.probe.type == 'noprobe'" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Probe Y Offset:">
						<b-input-group append="mm">
							<b-form-input v-model.number="probeYOffset" v-preset="preset.probe.y_offset" title="Offset of the Z-probe in Y direction" :disabled="template.probe.type == 'noprobe'" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Probing Speed:">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="probeSpeed" v-preset="preset.probe.speed" title="Speed at which bed points are probed" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col align-self="center">
					<b-form-checkbox v-model="probeDeploy" v-preset="preset.probe.deploy" title="Deploy or retract a mechanical probe by running macro files" :disabled="template.probe.type == 'bltouch'">Deploy/Retract Probe</b-form-checkbox>
				</b-col>
			</b-form-row>

			<b-card no-body header="Probe Type">
				<b-tabs card pills v-model="probeType">
					<b-tab title="No Z Probe" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'noprobe' }" value="noprobe">
						No Z-probe is installed. The distance between the nozzle and the bed must be manually determined.
					</b-tab>
					<b-tab title="Switch" :disabled="template.firmware >= 3 && !template.probe.input_pin" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'switch' }" value="switch">
						<z-probe-values></z-probe-values>
						A switch is used to determine the distance between nozzle and bed.

						<template v-if="template.geometry.type === 'delta'">
							<br><br>
							<span>This switch must be connected to the E0 endstop terminal!</span>
						</template>
						<template v-else>
							<br><br>
							<span>This switch must be connected to the Z probe terminal and <strong>not</strong> to the Z endstop switch terminal!</span>
						</template>
					</b-tab>
					<b-tab title="Unmodulated or Smart IR Probe" :disabled="template.firmware >= 3 && !template.probe.input_pin" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'unmodulated' }" value="unmodulated">
						<z-probe-values></z-probe-values>
						An umodulated Z-probe is used to determine the distance between nozzle and bed (without trigger signal)
					</b-tab>
					<b-tab title="Simple Modulated IR Probe" :disabled="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.modulation_pin)" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'modulated' }" value="modulated">
						<z-probe-values></z-probe-values>
						A modulated Z-probe is used to determine the distance between nozzle and bed (with trigger signal)
					</b-tab>
					<b-tab title="Smart Effector or Piezo" :disabled="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.modulation_pin)" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'effector' }" value="effector">
						<z-probe-values>
							<b-col>
								<b-form-group label="Recovery Time">
									<b-input-group append="s">
										<b-form-input v-model.number="template.probe.recovery_time" v-preset title="Recovery time of the smart effector/piezo" type="number" step="any" required></b-form-input>
									</b-input-group>
								</b-form-group>
							</b-col>
						</z-probe-values>

						Official <a href="https://www.duet3d.com/DeltaSmartEffector" target="_blank">Duet3D Smart Effector</a> for Delta printers (also see <a href="https://www.duet3d.com/wiki/Smart_effector_and_carriage_adapters_for_delta_printer" target="_blank">Duet3D Wiki</a>)
					</b-tab>
					<b-tab title="BLTouch" :disabled="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.pwm_pin)" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'bltouch' }" value="bltouch">
						<z-probe-values :hide-value="true">
							<b-col v-if="template.firmware < 3">
								<b-form-group label="Servo Control Channel:">
									<b-select v-model="pwmChannel" v-b-tooltip.hover title="PWM channel to control the BLTouch probe with">
										<optgroup v-if="pwmChannels.constructor === Object" v-for="(group, name) in pwmChannels" :label="name" :key="name">
											<option v-for="(item, index) in group" :value="item.value" v-text="item.text" :key="index"></option>
										</optgroup>
										<option v-if="pwmChannels.constructor === Array" v-for="(item, index) in pwmChannels" :value="item.value" v-text="item.text" :key="index"></option>
									</b-select>
								</b-form-group>
							</b-col>
						</z-probe-values>
						<span>Use a BLTouch for Z-probing (also see <a href="https://duet3d.dozuki.com/Wiki/Connecting_a_Z_probe#Section_BLTouch" target="_blank">Duet3D wiki</a>)</span>
						<br><br>
						<span>Make sure you change it to use +3.3V instead of +5V before you connect it or you risk damaging your board!</span>
					</b-tab>
				</b-tabs>

				<b-alert :show="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.pwm_pin)" class="mb-0">
					<strong>Note:</strong> You must specify an input and a PWM control pin on the <router-link to="/Mapping">I/O Mapping</router-link> page if you want to configure a BLTouch probe.
				</b-alert>
			</b-card>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'

import ZProbeValues from '../components/EndstopsZProbeValues.vue'
import Template from '../store/Template.js'

const probeTypes = ['noprobe', 'switch', 'unmodulated', 'modulated', 'effector', 'bltouch'];

export default {
	components: {
		'z-probe-values': ZProbeValues
	},
	computed: {
		...mapState(['board', 'preset', 'template']),
		...mapFields({
			probeXOffset: 'template.probe.x_offset',
			probeYOffset: 'template.probe.y_offset',
			probeSpeed: 'template.probe.speed',
			probeDeploy: 'template.probe.deploy',
			probePwmChannel: 'template.probe.pwm_channel',
			probePwmInverted: 'template.probe.pwm_inverted'
		}),
		pwmChannel: {
			get() {
				return (this.probePwmInverted ? '!' : '') + this.probePwmChannel;
			},
			set(value) {
				console.log(value);

				let inverted = false;
				if (value.startsWith('!')) {
					inverted = true;
					value = value.substring(1);
				}
				this.probePwmChannel = value;
				this.probePwmInverted = inverted;
			}
		},
		pwmChannels() {
			const heaterChannels = [], pwmChannels = [];
			if (this.template.board.startsWith('duetm')) {
				heaterChannels.push({
					text: 'Z Probe MOD',
					value: '64'
				});
			} else {
				for(let i = 0; i < 8; i++) {
					const disabled = (this.template.heaters.length > i) && (this.template.heaters[i] !== null);
					heaterChannels.push({
						text: (i == 0) ? 'Bed Channel' : `E${i - 1} Channel`,
						value: '!' + i,
						disabled
					});

					if (this.template.board.startsWith('duetethernet') || this.template.board.startsWith('duetwifi')) {
						if (i > 2) {
							pwmChannels.push({
								text: `PWM${i - 2}`,
								value: i.toString(),
								disabled
							});
						}
					}
				}
			}

			if (pwmChannels.length > 0) {
				return {
					'Heater Channels': heaterChannels,
					'PWM Channels on DueX Expansion Board': pwmChannels
				};
			}
			return heaterChannels;
		},
		/*pwmChannelPreset() {
			if (this.template.board.startsWith('duetm')) {
				return '64';
			}
			return (this.preset.probe.pwm_inverted ? '!' : '') + this.preset.probe.pwm_channel;
		},*/
		probeType: {
			get() {
				const probeType = this.template.probe.type;
				return probeTypes.findIndex(item => item == probeType);
			},
			set(value) { this.setProbeType(probeTypes[value]); }
		}
	},
	methods: mapMutations(['updateDrive', 'setProbeType'])
}
</script>
