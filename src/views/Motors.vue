<template>
	<b-container>
		<b-card no-body>
			<template slot="header">
				Axes
				<!-- TODO add axis add buttons like for the extruders below -->
			</template>
			<table class="table mb-0">
				<thead>
					<th>Drive</th>
					<th>Direction</th>
					<th>Microstepping (interpolation)</th>
					<th>Steps per mm</th>
					<th>Max. Speed Change (mm/s)</th>
					<th>Max. Speed (mm/s)</th>
					<th>Acceleration (mm/s²)</th>
					<th>Motor Current (mA)</th>
					<th>Motor Driver</th>
				</thead>
				<tbody>
					<drive-row v-for="i in [0, 1, 2]" :index="i" :drive="template.drives[i]" :presetDrive="preset.drives[i]" :drivers="drivers" :key="i" />
				</tbody>
			</table>
		</b-card>

		<b-card no-body class="mt-3">
			<template slot="header">
				<span class="mt-2">Extruders</span>
				<b-button-group class="float-right">
					<b-button size="sm" variant="success" :disabled="!canAddExtruder" @click="addExtruder"><font-awesome-icon icon="plus" /> Add Extruder</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveExtruder" @click="removeExtruder"><font-awesome-icon icon="minus" /> Remove Extruder</b-button>
				</b-button-group>
			</template>

			<table class="table mb-0">
				<thead>
					<th>Drive</th>
					<th>Direction</th>
					<th>Microstepping (interpolation)</th>
					<th>Steps per mm</th>
					<th>Max. Speed Change (mm/s)</th>
					<th>Max. Speed (mm/s)</th>
					<th>Acceleration (mm/s²)</th>
					<th>Motor Current (mA)</th>
					<th>Motor Driver</th>
				</thead>
				<tbody>
					<drive-row v-for="i in template.drives.length - 3" :index="i + 2" :drive="template.drives[i + 2]" :presetDrive="preset.drives[3]" :drivers="drivers" :key="i + 2" />
				</tbody>
			</table>
		</b-card>

		<b-card class="mt-3" header="Motor Current Reduction">
			<b-form-row>
				<b-col align-self="center">
					<b-checkbox v-model="template.idle.used" v-preset title="Disable motors on inactivity">Reduce motor currents when idle</b-checkbox>
				</b-col>

				<b-col>
					<label for="idle_factor">Idle Current Percentage:</label>
					<b-input-group append="%">
						<b-form-input id="idle_factor" v-model.number="template.idle.factor" v-preset title="Motor idle current reduction factor (M906)" :disabled="!template.idle.used" min="0" max="100" type="number" step="any" required />
					</b-input-group>
				</b-col>

				<b-col>
					<label for="idle_timeout">Idle Timeout:</label>
					<b-input-group append="s">
						<b-form-input id="idle_timeout" v-model.number="template.idle.timeout" v-preset title="Motor idle timeout value (M84)" :disabled="!template.idle.used" min="0" type="number" step="any" required />
					</b-input-group>
				</b-col>
			</b-form-row>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import MotorsDriveRow from '../components/MotorsDriveRow.vue'

export default {
	components: {
		'drive-row': MotorsDriveRow
	},
	computed: {
		canAddExtruder() { return this.template.drives.length < this.board.maxDrives; },
		canRemoveExtruder() { return this.template.drives.length > 3; },
	},
	data() {
		return {
			drivers: []
		};
	},
	methods: {
		addExtruder() {
			let drive = Object.assign({}, this.preset.drives[this.preset.drives.length - 1]);
			drive.driver = this.template.drives.length;
			if (!this.board.microstepping) {
				drive.microstepping = 16;
				drive.microstepping_interpolation = false;
			}
			this.template.drives.push(drive);
		},
		removeExtruder() {
			this.template.drives.pop();
		}
	},
	beforeMount() {
		let list = [
			{ value: 0, text: "0 (X)" },
			{ value: 1, text: "1 (Y)" },
			{ value: 2, text: "2 (Z)" }
		];
		for(let i = 3; i < this.board.maxDrives; i++) {
			list.push({ value: i, text: `${i} (E${i - 3})` });
		}
		this.drivers = list;
	}
}
</script>
