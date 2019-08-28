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
					<th>Max. Speed Change&nbsp;(mm/s)</th>
					<th>Max. Speed (mm/s)</th>
					<th>Acceleration (mm/s²)</th>
					<th>Motor Current&nbsp;(mA)</th>
					<th v-if="template.firmware < 3">Motor Driver</th>
				</thead>
				<tbody>
					<drive-row v-for="i in [0, 1, 2]" :index="i" :drivers="drivers" :key="i"></drive-row>
				</tbody>
			</table>
		</b-card>

		<b-card no-body class="mt-3">
			<template slot="header">
				<span class="mt-2">Extruders</span>
				<b-button-group class="float-right">
					<b-button size="sm" variant="success" :disabled="!canAddExtruder" @click="addExtruder">
						<font-awesome-icon icon="plus"></font-awesome-icon> Add Extruder
					</b-button>
					<b-button size="sm" variant="danger" :disabled="!canRemoveExtruder" @click="removeExtruder">
						<font-awesome-icon icon="minus"></font-awesome-icon> Remove Extruder
					</b-button>
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
					<th v-if="template.firmware < 3">Motor Driver</th>
				</thead>
				<tbody>
					<drive-row v-for="i in template.drives.length - 3" :index="i + 2" :drivers="drivers" :key="i + 2"></drive-row>
				</tbody>
			</table>
		</b-card>

		<b-card class="mt-3" header="Motor Current Reduction">
			<b-form-row>
				<b-col align-self="center">
					<b-checkbox v-model="idleUsed" v-preset.left="preset.idle.used" title="Disable motors on inactivity">Reduce motor currents when idle</b-checkbox>
				</b-col>

				<b-col>
					<label for="idleFactor">Idle Current Percentage:</label>
					<b-input-group append="%">
						<b-form-input id="idleFactor" v-model.number="idleFactor" v-preset="preset.idle.factor" title="Motor idle current reduction factor (M906)" :disabled="!idleUsed" min="0" max="100" type="number" step="any" required></b-form-input>
					</b-input-group>
				</b-col>

				<b-col>
					<label for="idleTimeout">Idle Timeout:</label>
					<b-input-group append="s">
						<b-form-input id="idleTimeout" v-model.number="idleTimeout" v-preset="preset.idle.timeout" title="Motor idle timeout value (M84)" :disabled="!idleUsed" min="0" type="number" step="any" required></b-form-input>
					</b-input-group>
				</b-col>
			</b-form-row>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapGetters, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'

import MotorsDriveRow from '../components/MotorsDriveRow.vue'

export default {
	components: {
		'drive-row': MotorsDriveRow
	},
	computed: {
		...mapState(['board', 'preset', 'template']),
		...mapGetters(['canAddExtruder', 'canRemoveExtruder']),
		...mapFields({
			idleUsed: 'template.idle.used',
			idleFactor: 'template.idle.factor',
			idleTimeout: 'template.idle.timeout'
		}),
		drivers() {
			const list = [
				{ value: 0, text: '0 (X)' },
				{ value: 1, text: '1 (Y)' },
				{ value: 2, text: '2 (Z)' }
			];
			for (let i = 3; i < this.board.maxDrives; i++) {
				list.push({ value: i, text: `${i} (E${i - 3})` });
			}
			return list;
		}
	},
	methods: mapMutations(['addExtruder', 'removeExtruder'])
}
</script>
