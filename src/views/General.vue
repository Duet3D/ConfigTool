<template>
	<b-container>
		<b-card header="General Preferences">
			<b-form-row>
				<b-col>
					<b-form-group label="Board:">
						<b-form-select :value="template.board" @change="setSelectedBoard($event)" v-preset="preset.board" title="Board on which the firmware runs">
							<option value="duet06">Duet 0.6</option>
							<option value="duet085">Duet 0.8.5</option>
							<option value="duetwifi10">Duet 2 WiFi</option>
							<option value="duetethernet10">Duet 2 Ethernet</option>
							<option value="duetm10">Duet 2 Maestro</option>
							<option value="duet3">Duet 3</option>
						</b-form-select>
					</b-form-group>
				</b-col>

				<b-col>
					<b-form-group label="Firmware version:">
						<b-form-select :value="template.firmware" @change="setFirmware($event)" :disabled="template.board === 'duet3' || template.board.startsWith('duet0')" v-preset="preset.firmware" title="Version of the firmware running on your board">
							<option :value="1.16" disabled>1.16 or older (no longer supported)</option>
							<option :value="1.17" disabled>1.17 to 1.19 (no longer supported)</option>
							<option :value="1.2" disabled>1.20 (no longer supported)</option>
							<option :value="1.21">1.21</option>
							<option :value="2">2.0</option>
							<option :value="2.03">2.03 to 2.05</option>
							<option :value="3">3.0 or later (stable)</option>
						</b-form-select>
					</b-form-group>
				</b-col>

				<b-col v-if="template.standalone">
					<b-form-group label="Printer Name:">
						<b-form-input v-model.trim="name" v-preset="preset.network.name" title="Name of your printer (M550). If you use mDNS, you can access your printer via Myprinter.local" maxlength="40" type="text" required></b-form-input>
					</b-form-group>
				</b-col>
			</b-form-row>

			<b-form-checkbox v-if="template.board === 'duet3'" v-model="standalone" v-preset.left title="Run RepRapFirmware in stand-alone mode without an attached single-board computer">Run in standalone mode without SBC</b-form-checkbox>
			<b-form-checkbox v-model="nvram" v-preset.left title="Load saved configuration parameters on start-up (M501)">Read config-override.g file at end of startup process</b-form-checkbox>
			<b-form-checkbox v-if="board.hasPowerFailureDetection" v-model="autoSaveEnabled" v-preset.left="preset.auto_save.enabled" title="Store the last valid print parameters on the SD card when a power failure occurs (M911)">Save print state on power failure</b-form-checkbox>
			<div v-show="autoSaveEnabled" class="mt-3 pl-4">
				<b-form-row>
					<b-col>
						<b-form-group label="Auto Save Threshold:">
							<b-input-group append="V">
								<b-form-input v-model.number="autoSaveThreshold" type="number" step="any" required></b-form-input>
							</b-input-group>
						</b-form-group>
					</b-col>

					<b-col>
						<b-form-group label="Resume Threshold:">
							<b-input-group append="V">
								<b-form-input v-model.number="autoSaveResumeThreshold" type="number" step="any" required></b-form-input>
							</b-input-group>
						</b-form-group>
					</b-col>

					<b-col cols="6">
						<b-form-group label="G-Codes to run when Auto-Saving is performed:">
							<b-form-input v-model.trim="autoSaveGCodes" type="text" required></b-form-input>
						</b-form-group>
					</b-col>
				</b-form-row>

				<span>Important: The file /sys/resurrect-prologue.g must be set up manually for resume to work (see <a href="https://duet3d.dozuki.com/Wiki/Setting_up_to_resume_a_print_after_a_power_failure#Section_Setting_up_the_sys_resurrect_prologue_g_file" target="_blank">Duet3D wiki</a>)</span>
			</div>
		</b-card>

		<b-card no-body header="Printer Geometry" class="mt-3">
			<b-tabs card pills v-model="geometry">
				<b-tab title="Cartesian" :title-link-class="{ 'font-weight-bold' : preset.geometry.type === 'cartesian' }">
					<geometry-form></geometry-form>
					<span>This machine uses individual motors to drives each axis</span>
				</b-tab>

				<b-tab title="CoreXY" :title-link-class="{ 'font-weight-bold' : preset.geometry.type === 'corexy' }">
					<geometry-form></geometry-form>
					<span>This machine uses coupled motors to position the nozzle on the XY plane</span>
				</b-tab>

				<b-tab title="CoreXZ" :title-link-class="{ 'font-weight-bold' : preset.geometry.type === 'corexz' }">
					<geometry-form></geometry-form>
					<span>This machine uses coupled motors to position the nozzle on the XZ plane</span>
				</b-tab>

				<b-tab title="Delta" :title-link-class="{ 'font-weight-bold' : preset.geometry.type === 'delta' }">
					<b-form-row>
						<b-col>
							<b-form-group label="Delta radius:">
								<b-input-group append="mm">
									<b-form-input v-model.number="deltaRadius" v-preset="preset.geometry.delta_radius" title="Horizontal distance subtended by each rod, measured between joint centres, when the effector is in the centre" :min="printRadius" type="number" step="any" required></b-form-input>
								</b-input-group>
							</b-form-group>
							<b-form-group label="Printable radius:">
								<b-input-group append="mm">
									<b-form-input v-model.number="printRadius" v-preset="preset.geometry.print_radius" title="Safe printing radius" min="1" :max="deltaRadius" type="number" step="any" required></b-form-input>
								</b-input-group>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group label="Minimum Z:">
								<b-input-group append="mm">
									<b-form-input v-model.number="zMin" v-preset="preset.geometry.z_min" title="Minimum allowed Z travel" :max="homedHeight" type="number" step="any" required></b-form-input>
								</b-input-group>
							</b-form-group>
							<b-form-group label="Diagonal rod length:">
								<b-input-group append="mm">
									<b-form-input v-model.number="rodLength" v-preset="preset.geometry.rod_length" title="Distance between the centre of your towers and the joint at the effector" min="1" type="number" step="any" required></b-form-input>
								</b-input-group>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group label="Homed height:">
								<b-input-group append="mm">
									<b-form-input v-model.number="homedHeight" v-preset="preset.geometry.homed_height" title="Maximum build height of your printer" :min="homedHeight" min="1" :max="maxCarriageTravel" type="number" step="any" required></b-form-input>
								</b-input-group>
							</b-form-group>
							<b-form-group label="Maximum carriage travel:">
								<b-input-group append="mm">
									<b-form-input v-model.number="maxCarriageTravel" v-preset="preset.geometry.max_carriage_travel" title="Maximum travel length in Z direction" type="number" required></b-form-input>
								</b-input-group>
							</b-form-group>
						</b-col>
					</b-form-row>

					<span>This machine uses towers to position the nozzle</span>
				</b-tab>
			</b-tabs>
		</b-card>

		<b-card header="Homing Preferences" class="mt-3">
			<b-form-row>
				<b-col>
					<b-form-group label="Homing Speed (First Pass):">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="homingSpeedFast" v-preset="preset.homing_speed_fast" title="Homing is performed in two stages. First pass means the initial homing run" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Homing Speed (Second Pass):">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="homingSpeedSlow" v-preset="preset.homing_speed_slow" title="Second pass means the second homing run after the endstops were triggered for the first time" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Travel Speed:">
						<b-input-group append="mm/s">
							<b-form-input v-model.number="travelSpeed" v-preset="preset.travel_speed" title="Speed for travel moves during homing" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col align-self="center">
					<b-form-group label="Z Dive Height:">
						<b-input-group append="mm">
							<b-form-input v-model.number="zDiveHeight" v-preset="preset.z_dive_height" title="Z lift amount for bed probing and for cartesian homing files" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
			</b-form-row>

			<b-checkbox v-show="template.geometry.type === 'delta'" v-model="slowHoming" v-preset.left="preset.slow_homing" title="Reduce homing speed. Recommended for initial calibration" class="mb-2">Set initial homing speed to 10% for calibration and add a note to homedelta.g</b-checkbox>
			<b-checkbox v-model="lowDiveHeight" v-preset.left="preset.geometry.low_dive_height" title="Generate an extra M558 code in config.g that you can remove after initial calibration">Set dive height to 30mm for initial calibration</b-checkbox>
		</b-card>

		<b-modal ref="modalDuet06" title="Check your board" size="lg" cancel-title="No" cancel-variant="danger" ok-title="Yes" ok-variant="success" @ok="setBoardSeriesResistor(4700)" @cancel="setBoardSeriesResistor(1000)">
			<h4>Is your Duet 0.6 board marked with a note saying "4.7K" or was it shipped with an original RepRapPro Ormerod 2?</h4>
			<br>
			<span class="text-muted">Note: Older Duet 0.6 boards use 1 kΩ series resistors.</span>
		</b-modal>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { mapFields, mapMultiRowFields } from 'vuex-map-fields'

import GeneralGeometryForm from '../components/GeneralGeometryForm.vue'

const geometryTypes = ['cartesian', 'corexy', 'corexz', 'delta'];

export default {
	components: {
		'geometry-form' : GeneralGeometryForm
	},
	computed: {
		...mapState(['board', 'preset', 'template']),
		...mapFields({
			name: 'template.network.name',
			standalone: 'template.standalone',
			nvram: 'template.nvram',
			autoSaveEnabled: 'template.auto_save.enabled',
			autoSaveThreshold: 'template.auto_save.save_threshold',
			autoSaveResumeThreshold: 'template.auto_save.resume_threshold',
			autoSaveGCodes: 'template.auto_save.gcodes_to_run',
			deltaRadius: 'template.geometry.delta_radius',
			zMin: 'template.geometry.z_min',
			homedHeight: 'template.geometry.homed_height',
			rodLength: 'template.geometry.rod_length',
			maxCarriageTravel: 'template.geometry.max_carriage_travel',
			homingSpeedFast: 'template.homing_speed_fast',
			homingSpeedSlow: 'template.homing_speed_slow',
			travelSpeed: 'template.travel_speed',
			zDiveHeight: 'template.z_dive_height',
			slowHoming: 'template.slow_homing',
			lowDiveHeight: 'template.geometry.low_dive_height'
		}),
		geometry: {
			get() {
				const geometryType = this.template.geometry.type;
				return geometryTypes.findIndex(item => item === geometryType);
			},
			set(value) { this.setGeometry(geometryTypes[value]); }
		},
		printRadius: {
			get() { return this.template.geometry.print_radius; },
			set(value) { this.setPrintRadius(value); }
		}
	},
	methods: {
		...mapActions(['setBoard']),
		...mapMutations(['setFirmware', 'setBoardSeriesResistor', 'setGeometry', 'setPrintRadius']),
		setSelectedBoard(value) {
			this.setBoard(value);
			if (value === 'duet06') {
				// Determine Duet 0.6 series resistor
				this.$refs.modalDuet06.show();
			}
		}
	}
}
</script>
