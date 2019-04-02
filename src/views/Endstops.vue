<template>
	<b-container>
		<b-card header="Z-Probe">
			<b-form-row>
				<b-col>
					<b-form-group label="Probe X Offset:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.probe.x_offset" v-preset title="Offset of the Z-probe in X direction" :disabled="template.probe.type == 'noprobe'" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Probe Y Offset:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.probe.y_offset" v-preset title="Offset of the Z-probe in Y direction" :disabled="template.probe.type == 'noprobe'" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Probing Speed:">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="template.probe.speed" v-preset title="Speed at which bed points are probed" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col align-self="center">
					<b-form-checkbox v-model="template.probe.deploy" v-preset title="Deploy or retract a mechanical probe by running macro files" :disabled="template.probe.type == 'bltouch'">Deploy/Retract Probe</b-form-checkbox>
				</b-col>
			</b-form-row>

			<b-card no-body header="Probe Type">
				<b-tabs card pills v-model="probeType">
					<b-tab title="No Z Probe" value="noprobe">
						No Z-probe is installed. The distance between the nozzle and the bed must be manually determined.
					</b-tab>
					<b-tab title="Switch" value="switch">
						<z-probe-values />
						A switch is used to determine the distance between nozzle and bed.

						<template v-if="template.geometry.type == 'delta'">
							<br/><br/>
							<span>This switch must be connected to the E0 endstop terminal!</span>
						</template>
						<template v-else>
							<br/><br/>
							<span>This switch must be connected to the Z probe terminal and <strong>not</strong> to the Z endstop switch terminal!</span>
						</template>
					</b-tab>
					<b-tab title="Unmodulated or Smart IR Probe" value="unmodulated">
						<z-probe-values />
						An umodulated Z-probe is used to determine the distance between nozzle and bed (without trigger signal)
					</b-tab>
					<b-tab title="Simple Modulated IR Probe" value="modulated">
						<z-probe-values />
						A modulated Z-probe is used to determine the distance between nozzle and bed (with trigger signal)
						</b-tab>
					<!--<b-tab title="Ultrasonic Probe" value="ultrasonic">
						<z-probe-values />
						An ultrasonic Z-probe is used to determine the distance between nozzle and bed
					</b-tab>-->
					<b-tab title="Smart Effector or Piezo" value="effector">
						<z-probe-values>
							<b-col>
								<b-form-group label="Recovery Time">
									<b-input-group append="s">
										<b-form-input v-model.number="template.probe.recovery_time" v-preset title="Recovery time of the smart effector/piezo" type="number" step="any" required />
									</b-input-group>
								</b-form-group>
							</b-col>
						</z-probe-values>

						Official <a href="https://www.duet3d.com/DeltaSmartEffector" target="_blank">Duet3D Smart Effector</a> for Delta printers (also see <a href="https://www.duet3d.com/wiki/Smart_effector_and_carriage_adapters_for_delta_printer" target="_blank">Duet3D Wiki</a>)
					</b-tab>
					<b-tab title="BLTouch" value="bltouch">
						<z-probe-values :hide-value="true">
							<b-col>
								<b-form-group label="Servo Control Channel:">
									<b-select v-model="pwmChannel" v-preset="pwmChannelPreset" title="PWM channel to control the BLTouch probe with">
										<optgroup v-if="pwmChannels.constructor === Object" v-for="(group, name) in pwmChannels" :label="name" :key="name">
											<option v-for="(item, index) in group" :value="item.value" v-text="item.text" :key="index" />
										</optgroup>
										<option v-if="pwmChannels.constructor === Array" v-for="(item, index) in pwmChannels" :value="item.value" v-text="item.text" :key="index" />
									</b-select>
								</b-form-group>
							</b-col>
						</z-probe-values>
						<span>Use a BLTouch for Z-probing (also see <a href="https://duet3d.dozuki.com/Wiki/Connecting_a_Z_probe#Section_BLTouch" target="_blank">Duet3D wiki</a>)</span>
						<br/><br/>
						<span>Make sure you change it to use +3.3V instead of +5V before you connect it or you risk damaging your board!</span>
					</b-tab>
				</b-tabs>
			</b-card>
		</b-card>

		<b-card class="mt-3" no-body>
			<template slot="header">
				<span class="mt-2">Endstop Configuration</span>
				<abbr id="endstop_note" class="float-right" title="When an endstop is hit, the axis position will be set to the corresponding axis minimum/maximum. If your endstop switch is not mounted at the axis end, you will have to add an extra G92 code after the homing move (G1..S1) to your homing files in order to set the new axis position. When homing the Z axis using a Z probe, the firmware will set the new Z position to the specified trigger height">Note</abbr>
			</template>

			<table class="table mb-0">
				<thead>
					<th>Axis</th>
					<th>Endstop Type</th>
					<th>Endstop Location</th>
				</thead>
				<tbody>
					<tr v-for="i in 3">
						<td class="pl-4 pt-3">{{ ['X', 'Y', 'Z'][i - 1] }}</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" v-model="template.drives[i - 1].endstop_type" :name="'endstopType' + i" class="w-100">
								<b-form-radio :value="0" class="w-100" v-b-tooltip.hover title="Manual homing via G92">None</b-form-radio>
								<b-form-radio :value="1" class="w-100" v-b-tooltip.hover title="Endstop switch pulls signal from GND to +3.3V when triggered (normally-closed switch)">Active high (NC)</b-form-radio>
								<b-form-radio :value="2" class="w-100" v-b-tooltip.hover title="Endstop switch pulls signal from +3.3V to GND when triggered (normally-open switch)">Active low (NO)</b-form-radio>
								<b-form-radio :value="3" class="w-100" :disabled="template.probe.type == 'noprobe'" v-b-tooltip.hover title="Z-Probe is used">Z-Probe</b-form-radio>
								<b-form-radio :value="4" class="w-100" :disabled="!board.hasMotorLoadDetection" v-b-tooltip.hover title="Motor stall detection of the stepper drivers">Motor Stall Detection</b-form-radio>
							</b-form-radio-group>
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" v-model="template.drives[i - 1].endstop_location" :name="'endstopLocation' + i" class="w-100">
								<b-form-radio :value="1" class="w-100" :disabled="template.geometry.type == 'delta'">At low end</b-form-radio>
								<b-form-radio :value="2" class="w-100">At high end</b-form-radio>
							</b-form-radio-group>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>

		<b-card class="mt-3" header="Homing Preferences">
			<b-form-row>
				<b-col>
					<b-form-group label="Homing Speed (First Pass):">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="template.homing_speed_fast" v-preset title="Homing is performed in two stages. First pass means the initial homing run" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Homing Speed (Second Pass):">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="template.homing_speed_slow" v-preset title="Second pass means the second homing run after the endstops were triggered for the first time" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Travel Speed:">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="template.travel_speed" v-preset title="Speed for travel moves during homing" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col align-self="center">
					<b-form-group label="Z Dive Height:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.z_dive_height" v-preset title="Z lift amount for bed probing and for cartesian homing files" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
			</b-form-row>

			<template v-if="template.geometry.type == 'delta'">
				<b-checkbox v-model="template.slow_homing" v-preset title="Recommended for initial calibration">Set initial homing speed to 10% for calibration and add a note to homedelta.g</b-checkbox>
				<br/>
			</template>
			<b-checkbox v-model="template.geometry.low_dive_height" v-preset title="Generate an extra M558 code in config.g that you can remove after initial calibration">Set dive height to 30mm for initial calibration</b-checkbox>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import ZProbeValues from '../components/EndstopsZProbeValues.vue'

const probeTypes = ["noprobe", "switch", "unmodulated", "modulated", /*"ultrasonic",*/ "effector", "bltouch"];

export default {
	beforeMount() {
		let heaterChannels = [], pwmChannels = [];
		if (this.template.board.startsWith("duetm")) {
			heaterChannels = [{ text: "Z Probe MOD", value: { channel: 64, inverted: false } }];
		} else {
			for(let i = 0; i < this.board.maxHeaters; i++) {
				const heaterAssigned = (this.template.heaters.length > i) && (this.template.heaters[i] != null);
				heaterChannels.push({
					text: (i == 0) ? "Bed Channel" : `E${i - 1} Channel`,
					value: { channel: i, inverted: true },
					disabled: heaterAssigned
				});

				if (this.template.board.startsWith("duetethernet") || this.template.board.startsWith("duetwifi")) {
					if (i > 2) {
						pwmChannels.push({ text: `PWM${i - 2}`, value: { channel: i, inverted: false }, disabled: heaterAssigned });
					}
				}
			}
		}

		if (pwmChannels.length > 0) {
			this.pwmChannels = {
				"Heater Channels": heaterChannels,
				"PWM Channels on DueX Expansion Board": pwmChannels
			};
		} else {
			this.pwmChannels = heaterChannels;
		}
	},
	components: {
		"z-probe-values": ZProbeValues
	},
	computed: {
		pwmChannel: {
			get() {
				return { channel: this.template.probe.pwm_channel, inverted: this.template.probe.pwm_inverted };
			},
			set(value) {
				this.template.probe.pwm_channel = value.channel;
				this.template.probe.pwm_inverted = value.inverted;
			}
		},
		pwmChannelPreset: {
			get() {
				if (this.template.board.startsWith("duetm")) {
					return { channel: 64, inverted: false };
				}
				return { channel: this.preset.probe.pwm_channel, inverted: this.preset.probe.pwm_inverted };
			}
		},
		probeType: {
			get() {
				const probeType = this.template.probe.type;
				return probeTypes.findIndex(item => item == probeType);
			},
			set(value) {
				const prevProbeType = this.template.probe.type;
				this.template.probe.type = probeTypes[value];

				// Set default probe speed when switching to/from effector
				if (this.template.probe.type == "effector") {
					this.template.probe.speed = 20;
				} else if (prevProbeType == "effector") {
					this.template.probe.speed = this.preset.probe.speed;
				}
			}
		}
	},
	data() {
		return {
			pwmChannels: []
		}
	}
}
</script>
