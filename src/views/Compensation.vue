<style scoped>
.grid-compensation fieldset {
	margin-bottom: 0;
}
</style>

<template>
	<b-container>
		<b-alert show v-if="template.firmware >= 1.21 && template.geometry.type != 'delta'">
			<i class="fas fa-info"></i> <strong>Note:</strong> 3/4/5 Point Bed Compensation has been deprecated. It has been replaced by the new Mesh Bed Compensation.
		</b-alert>

		<b-card v-if="template.firmware < 1.21 && template.geometry.type != 'delta'" no-body header="Bed Probing">
			<div class="card-body">
				<b-form-row>
					<b-col>
						<b-form-group label="Number of Probe Points:">
							<b-select v-model="template.probe.points.length" v-preset title="Number of probe points to use in bed.g" @input="setNumProbePoints">
								<option v-if="template.firmware > 1.20" value="0">None</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
							</b-select>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="X Offset:">
							<b-input-group append="mm">
								<b-form-input v-model.number="template.compensation_x_offset" v-preset title="Distance between bed corners and X probe points" :max="template.geometry.maxes[0] - template.geometry.mins[0]" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Bed Length:">
							<b-input-group append="mm">
								<b-form-input v-model.number="template.bed.length" v-preset title="Length of the bed in X direction" min="1" :max="template.geometry.maxes[0] - template.geometry.mins[0]" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Y Offset:">
							<b-input-group append="mm">
								<b-form-input v-model.number="template.compensation_y_offset" v-preset title="Distance between bed corners and Y probe points" :max="template.geometry.maxes[1] - template.geometry.mins[1]" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Bed Width:">
							<b-input-group append="mm">
								<b-form-input v-model.number="template.bed.width" v-preset title="Width of the bed in Y direction" :max="template.geometry.maxes[1] - template.geometry.mins[1]" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="template.home_first" v-preset title="Home all axes in bed.g before any points are probed">Home Axes before Automatic Bed Compensation</b-checkbox>
			</div>

			<points-table v-model="template.probe.points" :minX="template.geometry.mins[0]" :minY="template.geometry.mins[1]" :maxX="template.geometry.maxes[0]" :maxY="template.geometry.maxes[1]" />
		</b-card>

		<b-card v-if="template.geometry.type == 'delta'" no-body header="Bed Probing for Delta Calibration">
			<div class="card-body">
				<b-form-row>
					<b-col>
						<b-form-group label="Number of Peripheral Points:">
							<b-select v-model.number="template.peripheral_points" v-preset title="Number of outer probe points">
								<option value="3">3</option>
								<option value="6">6</option>
								<option value="10">10</option>
								<option value="12">12</option>
							</b-select>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Number of Halfway Points:">
							<b-select v-model.number="template.halfway_points" v-preset title="Number of inner probe points">
								<option value="0">0</option>
								<option value="3">3</option>
								<option value="6" :disabled="template.peripheral_points + 6 > 16">6</option>
							</b-select>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Number of Calibration Factors:">
							<b-select v-model.number="template.calibration_factors" v-preset title="Number of adjustment factors used for auto-calibration">
								<option value="3">3</option>
								<option value="6" :disabled="template.peripheral_points + template.halfway_points < 6">6</option>
								<option value="10" :disabled="template.peripheral_points + template.halfway_points < 10">10</option>
								<option value="12" :disabled="template.peripheral_points + template.halfway_points < 12">12</option>
							</b-select>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group label="Probing Radius:">
							<b-input-group append="mm">
								<b-form-input v-model.number="template.probe_radius" v-preset title="Radius of the outer probe points" :max="template.geometry.delta_radius" type="number" step="any" required />
							</b-input-group>
						</b-form-group>
					</b-col>
				</b-form-row>

				<b-checkbox v-model="template.home_first" v-preset title="Home all towers in bed.g before any points are probed">Home Towers before Auto-Calibration</b-checkbox>
			</div>

			<points-table v-model="template.probe.points" :minX="-template.probe_radius" :minY="-template.probe_radius" :maxX="template.probe_radius" :maxY="template.probe_radius" :disableLastZ="true" />
		</b-card>

		<b-card header="Bed Probing for Mesh Bed Compensation" class="mt-3">
			<b-form-row class="grid-compensation">
				<b-col v-if="template.geometry.type != 'delta'">
					<b-form-group label="X Minimum:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.mesh.x_min" v-preset title="Minimum X coordinate of the probe points" :min="template.geometry.mins[0]" :max="template.geometry.maxes[0]" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col v-if="template.geometry.type != 'delta'">
					<b-form-group label="X Maximum:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.mesh.x_max" v-preset title="Maximum X coordinate of the probe points" :min="template.geometry.mins[0]" :max="template.geometry.maxes[0]" type="number" step="any" required />

						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col v-if="template.geometry.type != 'delta'">
					<b-form-group label="Y Minimum:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.mesh.y_min" v-preset title="Minimum Y coordinate of the probe points" :min="template.geometry.mins[1]" :max="template.geometry.maxes[1]" type="number" step="any" required />

						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col v-if="template.geometry.type != 'delta'">
					<b-form-group label="Y Maximum:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.mesh.y_max" v-preset title="Maximum Y coordinate of the probe points" :min="template.geometry.mins[1]" :max="template.geometry.maxes[1]" type="number" step="any" required />

						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col v-if="template.geometry.type == 'delta'">
					<b-form-group label="Probing Radius:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.mesh.radius" v-preset title="Radius of the probe points" :min="1" :max="template.geometry.delta_radius" type="number" step="any" required />

						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Grid Spacing:">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.mesh.spacing" v-preset title="Spacing between the probe points" :min="1" :max="template.mesh.radius / 2" type="number" step="any" required />

						</b-input-group>
					</b-form-group>
				</b-col>
			</b-form-row>
		</b-card>

		<b-card header="Orthogonal Axis Compensation" class="mt-3">
			<b-form-checkbox v-model="template.orthogonal.compensation" v-preset title="Check this to enable orthogonal axis compensation via M556">Enable Orthogonal Axis Compensation</b-form-checkbox>
			<b-form-row v-if="template.orthogonal.compensation" class="mt-3 pl-4">
				<b-col>
					<b-form-group label="Measured Height:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.orthogonal.height" v-preset title="Height of the deviations measured for orthogonal axis compensation" min="1" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Deviation in X:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.orthogonal.deviations[0]" v-preset title="Deviation in XY direction" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Deviation in Y:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.orthogonal.deviations[1]" v-preset title="Deviation in YZ direction" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
				<b-col>
					<b-form-group label="Deviation in Z:" class="mb-0">
						<b-input-group append="mm">
							<b-form-input v-model.number="template.orthogonal.deviations[2]" v-preset title="Deviation in XZ direction" type="number" step="any" required />
						</b-input-group>
					</b-form-group>
				</b-col>
			</b-form-row>
		</b-card>
	</b-container>
</template>

<script>
'use strict';

import PointsTable from '../components/CompensationPointsTable.vue'

export default {
	components: {
		'points-table': PointsTable
	},
	methods: {
		setNumProbePoints(value) {
			this.recalculateProbePoints(parseInt(value));
		}
	}
}
</script>
