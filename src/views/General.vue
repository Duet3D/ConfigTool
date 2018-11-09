<template>
	<b-container>
		<b-card header="General Preferences">
			<b-form-row>
				<b-col>
					<b-form-group label="Board:">
						<b-form-select v-model="template.board" v-preset title="Board on which the firmware runs" @change="setBoard">
							<option value="duet06">Duet 0.6</option>
							<option value="duet085">Duet 0.8.5</option>
							<option value="duetwifi10">Duet 2 WiFi</option>
							<option value="duetethernet10">Duet 2 Ethernet</option>
							<option value="duetm10">Duet 2 Maestro</option>
						</b-form-select>
					</b-form-group>
				</b-col>

				<b-col>
					<b-form-group label="Firmware version:">
						<b-form-select v-model.number="template.firmware" v-preset title="Version of the firmware running on your board">
							<option value="1.16">1.16 or older</option>
							<option value="1.17">1.17 to 1.19</option>
							<option value="1.2">1.20</option>
							<option value="1.21">1.21 or newer</option>
						</b-form-select>
					</b-form-group>
				</b-col>
			</b-form-row>

			<b-form-checkbox v-model="template.nvram" v-preset title="Load saved configuration parameters on start-up (M501)">Read config-override.g file at end of startup process</b-form-checkbox>
			<br/>
			<b-form-checkbox v-if="board.hasPowerFailureDetection" v-model="template.auto_save.enabled" v-preset title="Store the last valid print parameters on the SD card when a power failure occurs (M911)">Save print state on power failure</b-form-checkbox>
			<b-form-row v-if="template.auto_save.enabled" class="mt-3 pl-4">
				<b-col>
					<b-form-group label="Auto Save Threshold:" class="mb-0">
						<b-input-group append="V">
							<b-form-input v-model.number="template.auto_save.save_threshold" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>

				<b-col>
					<b-form-group label="Resume Threshold:" class="mb-0">
						<b-input-group append="V">
							<b-form-input v-model.number="template.auto_save.resume_threshold" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>

				<b-col cols="6">
					<b-form-group label="G-Codes to run when Auto-Saving is performed:" class="mb-0">
						<b-form-input v-model.trim="template.auto_save.gcodes_to_run" type="text" required />
					</b-form-group>
				</b-col>
			</b-form-row>
		</b-card>

		<b-card no-body header="Printer Geometry" class="mt-3">
			<b-tabs card pills v-model="geometry">
				<b-tab title="Cartesian">
					<geometry-form />
					<span>This machine uses individual motors to drives each axis</span>
				</b-tab>

				<b-tab title="CoreXY">
					<geometry-form />
					<span>This machine uses two coupled motors to position the nozzle on the XY plane</span>
				</b-tab>

				<b-tab title="CoreXZ">
					<geometry-form />
					<span>This machine uses two coupled motors to position the nozzle on the XZ plane</span>
				</b-tab>

				<b-tab title="Delta">
					<b-form-row>
						<b-col>
							<b-form-group label="Delta radius:">
								<b-input-group append="mm">
									<b-form-input v-model.number="template.geometry.delta_radius" v-preset title="Horizontal distance subtended by each rod, measured between joint centres, when the effector is in the centre" :min="template.geometry.print_radius" type="number" step="any" required />
								</b-input-group>
							</b-form-group>
							<b-form-group label="Printable radius:">
								<b-input-group append="mm">
									<b-form-input v-model.number="template.geometry.print_radius" v-preset title="Safe printing radius" min="1" :max="template.geometry.delta_radius" type="number" step="any" required />
								</b-input-group>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group label="Minimum Z:">
								<b-input-group append="mm">
									<b-form-input v-model.number="template.geometry.z_min" v-preset title="Minimum allowed Z travel" :max="template.geometry.homed_height" type="number" step="any" required></b-form-input>
								</b-input-group>
							</b-form-group>
							<b-form-group label="Diagonal rod length:">
								<b-input-group append="mm">
									<b-form-input v-model.number="template.geometry.rod_length" v-preset title="Distance between the centre of your towers and the joint at the effector" min="1" type="number" step="any" required />
								</b-input-group>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group label="Homed height:">
								<b-input-group append="mm">
									<b-form-input v-model.number="template.geometry.homed_height" v-preset title="Maximum build height of your printer" :min="template.geometry.homed_height" min="1" :max="template.geometry.max_carriage_travel" type="number" step="any" required />
								</b-input-group>
							</b-form-group>
							<b-form-group label="Maximum carriage travel:">
								<b-input-group append="mm">
									<b-form-input v-model.number="template.geometry.max_carriage_travel" v-preset title="Maximum travel length in Z direction" type="number" required />
								</b-input-group>
							</b-form-group>
						</b-col>
					</b-form-row>

					<span>This machine uses towers to position the nozzle</span>
				</b-tab>
			</b-tabs>
		</b-card>

		<b-modal ref="modalDuet06" title="Check your board" size="lg" cancel-title="No" cancel-variant="danger" ok-title="Yes" ok-variant="success" @ok="setBoardSeriesResistor(4700)" @cancel="setBoardSeriesResistor(1000)">
			<h4>Is your Duet 0.6 board marked with a note saying "4.7K" or was it shipped with an original RepRapPro Ormerod 2?</h4>
			<br/>
			<span class="text-muted">Note: Older Duet 0.6 boards use 1 kΩ series resistors.</span>
		</b-modal>
	</b-container>
</template>

<script>
'use strict';

import GeneralGeometryForm from '../components/GeneralGeometryForm.vue'

const geometryTypes = ["cartesian", "corexy", "corexz", "delta"];

export default {
	components: {
		"geometry-form" : GeneralGeometryForm
	},
	computed: {
		geometry: {
			get() {
				const geometryType = this.template.geometry.type;
				return geometryTypes.findIndex(item => item == geometryType);
			},
			set(value) {
				this.template.geometry.type = geometryTypes[value];

				// Update defaults depending on motion system (requested by T3P3)
				const preset = this.preset;
				if (this.template.geometry.type == "delta") {
					this.template.drives.forEach(function(drive, index) {
						if (drive.steps_per_mm == (index < 2) ? 80 : ((index == 2) ? 4000 : 420)) { drive.steps_per_mm = (index < 3) ? 80 : 663; };
						if (drive.instant_dv == (index < 2) ? 15 : ((index == 2) ? 0.2 : 2)) { drive.instant_dv = 20; };
						if (drive.max_speed == (index < 2) ? 100 : ((index == 2) ? 3 : 20)) { drive.max_speed = (index < 3) ? 300 : 20; };
						if (drive.acceleration == (index < 2) ? 500 : ((index == 2) ? 20 : 250)) { drive.acceleration = 1000; };
						if (drive.current == 800) { drive.current = (index < 3) ? 1000 : 800; };
					});

					this.preset.drives.forEach(function(drive, index) {
						drive.steps_per_mm = (index < 3) ? 80 : 663;
						drive.instant_dv = 20;
						drive.max_speed = (index < 3) ? 300 : 20;
						drive.acceleration = 1000;
						drive.current = (index < 3) ? 1000 : 800;
					});
				} else {
					this.template.drives.forEach(function(drive, index) {
						if (drive.steps_per_mm == (index < 3) ? 80 : 663) { drive.steps_per_mm = (index < 2) ? 80 : ((index == 2) ? 4000 : 420); };
						if (drive.instant_dv == 20) { drive.instant_dv = (index < 2) ? 15 : ((index == 2) ? 0.2 : 2); }
						if (drive.max_speed == (index < 3) ? 300 : 20) { drive.max_speed = (index < 2) ? 100 : ((index == 2) ? 3 : 20); }
						if (drive.acceleration == 1000) { drive.acceleration = (index < 2) ? 500 : ((index == 2) ? 20 : 250); }
						if (drive.current == (index < 3) ? 1000 : 800) { drive.current = 800; }
					});

					this.preset.drives.forEach(function(drive, index) {
						drive.steps_per_mm = (index < 2) ? 80 : ((index == 2) ? 4000 : 420);
						drive.instant_dv = (index < 2) ? 15 : ((index == 2) ? 0.2 : 2);
						drive.max_speed = (index < 2) ? 100 : ((index == 2) ? 3 : 20);
						drive.acceleration = (index < 2) ? 500 : ((index == 2) ? 20 : 250);
						drive.current = 800;
					});
				}
			}
		}
	},
	methods: {
		setBoard(value) {
			// Determine Duet 0.6 series resistor
			if (value == "duet06") {
				this.$refs.modalDuet06.show();
			}
		},
		setBoardSeriesResistor(value) {
			this.board.seriesResistor = value;
			this.preset.heaters.forEach(function(heater) {
				heater.series = value;
			});
			this.template.heaters.forEach(function(heater) {
				if ((heater.series == 1000 && value == 4700) ||
					(heater.series == 4700 && value == 1000)) {
					heater.series = value;
				}
			});
		}		
	}
}
</script>
