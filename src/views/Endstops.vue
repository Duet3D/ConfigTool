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
				<span class="mt-2">{{$t('endstops.endstopConfiguration')}}</span>
				<abbr id="endstop_note" class="float-right" :title="$t('endstops.endstopConfigurationNoteText')">{{$t('endstops.endstopConfigurationNote')}}</abbr>
			</template>

			<table class="table mb-0">
				<thead>
					<th>{{$t('endstops.axis')}}</th>
					<th>{{$t('endstops.endstopType')}}</th>
					<th>{{$t('endstops.endstopLocation')}}</th>
				</thead>
				<tbody>
					<tr v-for="i in [0, 1, 2]">
						<td class="pl-4 pt-3">
							{{ ['X', 'Y', 'Z'][i] }}
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" :checked="template.drives[i].endstop_type" @change="updateDrive({ drive: i, et: $event })" v-preset.left="preset.drives[i].endstop_type" :title="$t('endstops.endstopTypeDescription')" :name="'endstopType' + i" class="w-100">
								<b-form-radio :value="0" class="w-100" v-b-tooltip.bottom :title="$t('endstops.endstopNoneDescription')">{{$t('endstops.endstopNone')}}</b-form-radio>
								<b-form-radio :value="1" :disabled="template.firmware >= 3 && !template.drives[i].endstop_pin" class="w-100" v-b-tooltip.bottom :title="$t('endstops.switchDescription')">
									{{ template.firmware >= 3 ? $t('endstops.switch') : $t('endstops.activeHigh') }}
								</b-form-radio>
								<b-form-radio v-show="template.firmware < 3" :value="2" class="w-100" v-b-tooltip.bottom :title="$t('endstops.activeLowDescription')">{{$t('endstops.activeLow')}}</b-form-radio>
								<b-form-radio :value="3" class="w-100" :disabled="template.probe.type === 'noprobe'" v-b-tooltip.bottom :title="$t('endstops.zprobeDescription')">{{$t('endstops.zprobe')}}</b-form-radio>
								<b-form-radio :value="4" class="w-100" :disabled="!board.hasMotorLoadDetection" v-b-tooltip.bottom :title="$t('endstops.sensorlessDescription')">{{$t('endstops.sensorless')}}</b-form-radio>
							</b-form-radio-group>
						</td>
						<td>
							<b-form-radio-group buttons button-variant="outline-primary" :checked="template.drives[i].endstop_location" v-preset.right="preset.drives[i].endstop_location" @change="updateDrive({ drive: i, el: $event })" :title="$t('endstops.highEndDescription')" :name="'endstopLocation' + i" class="w-100">
								<b-form-radio :value="1" class="w-100" :disabled="template.geometry.type == 'delta'">{{$t('endstops.lowEnd')}}</b-form-radio>
								<b-form-radio :value="2" class="w-100">{{$t('endstops.highEnd')}}</b-form-radio>
							</b-form-radio-group>
						</td>
					</tr>
				</tbody>
			</table>
		</b-card>

		<b-alert :show="template.drives.findIndex(drive => drive.endstop_type === 4) !== -1">
			<strong>{{$t('endstops.note')}}</strong>{{$t('endstops.sensorlessNoteText')}}<a href="https://duet3d.dozuki.com/Wiki/Stall_detection_and_sensorless_homing" target="_blank">Duet3D Wiki</a> for further information.
		</b-alert>

		<b-card class="mt-3" :header="$t('endstops.zprobe')">
			<b-form-row>
				<b-col>
					<b-form-group :label="$t('endstops.probeXOffset')">
						<b-input-group append="mm">
							<b-form-input v-model.number="probeXOffset" v-preset="preset.probe.x_offset" :title="$t('endstops.probeXOffsetDescription')" :disabled="template.probe.type == 'noprobe'" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group :label="$t('endstops.probeYOffset')">
						<b-input-group append="mm">
							<b-form-input v-model.number="probeYOffset" v-preset="preset.probe.y_offset" :title="$t('endstops.probeYOffsetDescription')" :disabled="template.probe.type == 'noprobe'" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group :label="$t('endstops.probeSpeed')">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="probeSpeed" v-preset="preset.probe.speed" :title="$t('endstops.probeSpeedDescription')" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col align-self="center">
					<b-form-checkbox v-model="probeDeploy" v-preset="preset.probe.deploy" :title="$t('endstops.deployDescription')" :disabled="template.probe.type == 'bltouch'">{{$t('endstops.deploy')}}</b-form-checkbox>
				</b-col>
			</b-form-row>

			<b-card no-body :header="$t('endstops.probeType')">
				<b-tabs card pills v-model="probeType">
					<b-tab :title="$t('endstops.noprobe')" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'noprobe' }" value="noprobe">
						{{$t('endstops.noprobeDescription')}}
					</b-tab>
					<b-tab :title="$t('endstops.switch')" :disabled="template.firmware >= 3 && !template.probe.input_pin" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'switch' }" value="switch">
						<z-probe-values></z-probe-values>
						{{$t('endstops.switchProbeDescription')}}
						<template v-if="template.firmware >= 3">
							<br>
							{{$t('endstops.switchNote3')}}<router-link to="Mapping">{{$t('mapping.title')}}</router-link> {{$t('endstops.page')}}.
						</template>

						<template v-if="template.geometry.type === 'delta'">
							<br><br>
							<span>{{$t('endstops.deltaWarning')}}</span>
						</template>
						<template v-else-if="template.firmware < 3" >
							<br><br>
							<span>{{$t('endstops.deltaWarning3')}}<strong>{{$t('endstops.deltaWarning31')}}</strong>{{$t('endstops.deltaWarning32')}}</span>
						</template>
					</b-tab>
					<b-tab :title="$t('endstops.unmodulated')" :disabled="template.firmware >= 3 && !template.probe.input_pin" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'unmodulated' }" value="unmodulated">
						<z-probe-values></z-probe-values>
						{{$t('endstops.unmodulatedDescription')}}
					</b-tab>
					<b-tab :title="$t('endstops.modulated')" :disabled="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.modulation_pin)" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'modulated' }" value="modulated">
						<z-probe-values></z-probe-values>
						{{$t('endstops.modulatedDescription')}}
					</b-tab>
					<b-tab :title="$t('endstops.smartEffector')" :disabled="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.modulation_pin)" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'effector' }" value="effector">
						<z-probe-values>
							<b-col>
								<b-form-group :label="$t('endstops.recoveryTime')">
									<b-input-group append="s">
										<b-form-input v-model.number="template.probe.recovery_time" v-preset :title="$t('endstops.recoveryTimeDescription')" type="number" step="any" required></b-form-input>
									</b-input-group>
								</b-form-group>
							</b-col>
						</z-probe-values>

						Official <a href="https://www.duet3d.com/DeltaSmartEffector" target="_blank">Duet3D Smart Effector</a> for Delta printers (also see <a href="https://www.duet3d.com/wiki/Smart_effector_and_carriage_adapters_for_delta_printer" target="_blank">Duet3D Wiki</a>)
					</b-tab>
					<b-tab title="BLTouch" :disabled="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.pwm_pin)" :title-link-class="{ 'font-weight-bold' : preset.probe.type === 'bltouch' }" value="bltouch">
						<z-probe-values :hide-value="true">
							<b-col v-if="template.firmware < 3">
								<b-form-group :label="$t('endstops.servo')">
									<b-select v-model="pwmChannel" v-b-tooltip.hover :title="$t('endstops.servoDescription')">
										<optgroup v-if="pwmChannels.constructor === Object" v-for="(group, name) in pwmChannels" :label="name" :key="name">
											<option v-for="(item, index) in group" :value="item.value" v-text="item.text" :key="index"></option>
										</optgroup>
										<option v-if="pwmChannels.constructor === Array" v-for="(item, index) in pwmChannels" :value="item.value" v-text="item.text" :key="index"></option>
									</b-select>
								</b-form-group>
							</b-col>
						</z-probe-values>
						<span>{{$t('endstops.bltouchNote')}}<a href="https://duet3d.dozuki.com/Wiki/Connecting_a_Z_probe#Section_BLTouch" target="_blank">Duet3D wiki</a>)</span>
						<br><br>
						<span>{{$t('endstops.bltouchNote1')}}</span>
					</b-tab>
				</b-tabs>

				<b-alert :show="template.firmware >= 3 && (!template.probe.input_pin || !template.probe.pwm_pin)" class="mb-0">
					<strong>{{$t('endstops.note')}}</strong>{{$t('endstops.pwmNote')}}<router-link to="/Mapping">{{$t('mapping.title')}}</router-link>{{$t('endstops.pwmNote1')}}
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
