<style scoped>
.grid-compensation fieldset {
	margin-bottom: 0;
}
</style>

<template>
	<b-container>
		<b-alert :show="template.geometry.type !== 'delta'">
			<strong>Note:</strong> 3/4/5 Point Bed Compensation is deprecated. It has been replaced with the new Mesh Bed Compensation.
		</b-alert>

		<b-card v-show="template.geometry.type === 'delta'" no-body header="Bed Probing for Delta Calibration">
			<div class="card-body">
				<b-form-row>
					<b-col>
						<b-form-group label="Number of Peripheral Points:">
							<b-select v-model.number="peripheralPoints" @change="updateProbePoints" v-preset="preset.peripheral_points" title="Number of outer probe points">
								<option value="3">3</option>
								<option value="6">6</option>
								<option value="10">10</option>
								<option value="12">12</option>
							</b-select>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Number of Halfway Points:">
							<b-select v-model.number="halfwayPoints" @change="updateProbePoints" v-preset="preset.halfway_points" title="Number of inner probe points">
								<option value="0">0</option>
								<option value="3">3</option>
								<option value="6" :disabled="template.peripheral_points + 6 > 16">6</option>
							</b-select>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Number of Calibration Factors:">
							<b-select v-model.number="calibrationFactors" v-preset="preset.calibration_factors" title="Number of adjustment factors used for auto-calibration">
								<option value="4">4</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
							</b-select>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Probing Radius:">
							<b-input-group append="mm">
								<b-form-input v-model.number="probeRadius" @change="updateProbePoints" v-preset="preset.probe_radius" title="Radius of the outer probe points" :max="template.geometry.delta_radius" type="number" step="any" required></b-form-input>
							</b-input-group>
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="homeFirst" v-preset.left="preset.home_first" title="Home all towers in bed.g before any points are probed">Home Towers before Auto-Calibration</b-checkbox>
			</div>

			<points-table v-model="probePoints" :minX="-template.probe_radius" :minY="-template.probe_radius" :maxX="template.probe_radius" :maxY="template.probe_radius" :disableLastZ="true"></points-table>
		</b-card>

		<b-card header="Bed Probing for Mesh Bed Compensation" class="mt-3">
			<b-form-row class="grid-compensation">
				<template v-if="template.geometry.type !== 'delta'">
					<b-col>
						<b-form-group label="X Minimum:">
							<b-input-group append="mm">
								<b-form-input v-model.number="xMin" v-preset="preset.mesh.x_min" title="Minimum X coordinate of the probe points" :min="template.geometry.mins[0]" :max="template.geometry.maxes[0]" type="number" step="any" required></b-form-input>
							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="X Maximum:">
							<b-input-group append="mm">
								<b-form-input v-model.number="xMax" v-preset="preset.mesh.x_max" title="Maximum X coordinate of the probe points" :min="template.geometry.mins[0]" :max="template.geometry.maxes[0]" type="number" step="any" required></b-form-input>

							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Y Minimum:">
							<b-input-group append="mm">
								<b-form-input v-model.number="yMin" v-preset="preset.mesh.y_min" title="Minimum Y coordinate of the probe points" :min="template.geometry.mins[1]" :max="template.geometry.maxes[1]" type="number" step="any" required></b-form-input>

							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Y Maximum:">
							<b-input-group append="mm">
								<b-form-input v-model.number="yMax" v-preset="preset.mesh.y_max" title="Maximum Y coordinate of the probe points" :min="template.geometry.mins[1]" :max="template.geometry.maxes[1]" type="number" step="any" required></b-form-input>

							</b-input-group>
						</b-form-group>
					</b-col>
				</template>
				<b-col v-else>
					<b-form-group label="Probing Radius:">
						<b-input-group append="mm">
							<b-form-input v-model.number="radius" v-preset="preset.mesh.radius" title="Radius of the probe points" :min="1" :max="template.geometry.delta_radius" type="number" step="any" required></b-form-input>

						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Grid Spacing:">
						<b-input-group append="mm">
							<b-form-input v-model.number="spacing" v-preset="preset.mesh.spacing" title="Spacing between the probe points" :min="1" :max="maxGridSpacing" type="number" step="any" required></b-form-input>

						</b-input-group>
					</b-form-group>
				</b-col>
			</b-form-row>
		</b-card>

		<b-card header="Orthogonal Axis Compensation" class="mt-3">
			<b-form-checkbox v-model="orthogonalCompensation" v-preset.left="preset.orthogonal.compensation" title="Check this to enable orthogonal axis compensation via M556">Enable Orthogonal Axis Compensation</b-form-checkbox>
			<b-form-row v-show="orthogonalCompensation" class="mt-3 pl-4">
				<b-col>
					<b-form-group label="Measured Height:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="orthogonalHeight" v-preset="preset.orthogonal.height" title="Height of the deviations measured for orthogonal axis compensation" min="1" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Deviation in X:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="xDeviation" v-preset="preset.orthogonal.deviations[0]" title="Deviation in XY direction" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Deviation in Y:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="yDeviation" v-preset="preset.orthogonal.deviations[1]" title="Deviation in YZ direction" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Deviation in Z:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="zDeviation" v-preset="preset.orthogonal.deviations[2]" title="Deviation in XZ direction" type="number" step="any" required></b-form-input>
						</b-input-group>
					</b-form-group>
				</b-col>
			</b-form-row>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'
import { mapFields, mapMultiRowFields } from 'vuex-map-fields'

import PointsTable from '../components/CompensationPointsTable.vue'

export default {
	components: {
		'points-table': PointsTable
	},
	computed: {
		...mapState(['preset', 'template']),
		...mapFields({
			peripheralPoints: 'template.peripheral_points',
			halfwayPoints: 'template.halfway_points',
			calibrationFactors: 'template.calibration_factors',
			probeRadius: 'template.probe_radius',
			homeFirst: 'template.home_first',
			xMin: 'template.mesh.x_min',
			xMax: 'template.mesh.x_max',
			yMin: 'template.mesh.y_min',
			yMax: 'template.mesh.y_max',
			radius: 'template.mesh.radius',
			spacing: 'template.mesh.spacing',
			orthogonalCompensation: 'template.orthogonal.compensation',
			orthogonalHeight: 'template.orthogonal.height'
		}),
		...mapMultiRowFields({
			probePoints: 'template.probe.points'
		}),
		maxGridSpacing() { return (this.template.geometry === 'delta') ? (this.template.mesh.radius / 2) : (this.template.bed.width / 2); },
		xDeviation: {
			get() { return this.template.orthogonal.deviations[0]; },
			set(value) { this.setOrthogonalDeviation({ axis: 0, value }); }
		},
		yDeviation: {
			get() { return this.template.orthogonal.deviations[1]; },
			set(value) { this.setOrthogonalDeviation({ axis: 1, value }); }
		},
		zDeviation: {
			get() { return this.template.orthogonal.deviations[2]; },
			set(value) { this.setOrthogonalDeviation({ axis: 2, value }); }
		}
	},
	methods: mapMutations(['updateProbePoints', 'setOrthogonalDeviation'])
}
</script>
