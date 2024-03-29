<template>
	<section id="compensation" class="pt-3">
		<!-- Delta Calibration -->
		<card v-if="showDeltaOptions" class="mb-3" :preview-templates="['bed']"
			  title="Automatic Delta Calibration" url-title="Delta Calibration"
			  url="https://docs.duet3d.com/en/User_manual/Tuning/Delta_calibration">
			<div class="row g-3">
				<div class="col-3">
					<select-input label="Number of Peripheral Points" title="Number of outer probe points"
								  v-model="peripheralPoints" :options="PeripheralPoints"
								  :preset="store.preset.configTool.delta.peripheralPoints" />
				</div>
				<div class="col-3">
					<select-input label="Number of Halfway Points" title="Number of inner probe points"
								  v-model="halfwayPoints" :options="HalfwayPoints"
								  :preset="store.preset.configTool.delta.halfwayPoints" />
				</div>
				<div class="col-3">
					<select-input label="Number of Calibration Factors"
								  title="Number of adjustment factors used for auto-calibration"
								  v-model="calibrationFactors" :options="CalibrationFactors"
								  :preset="store.preset.configTool.delta.factors" />
				</div>
				<div class="col-3">
					<number-input label="Probing Radius" title="Radius of the outer probe points"
								  v-model="probeRadius"
								  :preset="store.preset.configTool.delta.probeRadius" unit="mm" />
				</div>
				<div class="col">
					<check-input label="Home Towers before Auto-Calibration"
								 title="Home all towers in bed.g before any points are probed"
								 v-model="store.data.configTool.delta.homeFirst"
								 :preset="store.preset.configTool.delta.homeFirst" />
				</div>
				<div class="col">
					<check-input label="Customize Delta Probe Points"
								 title="Fine-tune coordinates and height corrections of each probe point"
								 v-model="showDeltaProbePoints" :preset="false" />
				</div>
			</div>

			<template #append>
				<table v-if="showDeltaProbePoints" class="table table-striped table-probe-points">
					<thead>
						<tr>
							<th class="text-center">
								Probe Point
							</th>
							<th>
								X Coordinate
							</th>
							<th>
								Y Coordinate
							</th>
							<th>
								Height Correction
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(point, index) in store.data.configTool.delta.probePoints">
							<td class="text-center align-middle">
								{{ index + 1 }}
							</td>
							<td>
								<number-input title="X coordinate of this probe point"
											  :min="-probeRadius" :max="probeRadius" :step="0.01" lazy small
											  v-model="point.x" unit="mm" />
							</td>
							<td>
								<number-input title="Y coordinate of this probe point"
											  :min="-probeRadius" :max="probeRadius" :step="0.01" lazy small
											  v-model="point.y" unit="mm" />
							</td>
							<td>
								<number-input title="Height coorrection of this probe point" :step="0.001" lazy small
											  v-model="point.heightCorrection" unit="mm"
											  :disabled="index === store.data.configTool.delta.probePoints.length - 1" />
							</td>
						</tr>
					</tbody>
				</table>
			</template>
		</card>

		<!-- Mesh Bed Compensation -->
		<card v-if="store.data.sensors.probes.length > 0" class="mb-3" title="Mesh Bed Compensation"
			  :preview-templates="meshBedCompensation ? ['config/compensation/mesh'] : null" url-title="Further Information"
			  url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Z_probe_mesh_bed">
			<div class="row">
				<div class="col-auto">
					<check-input label="Enable Mesh Bed Compensation"
								 title="Check this to enable mesh bed compensation"
								 v-model="meshBedCompensation" :preset="presetMeshBedCompensation" />
				</div>
			</div>

			<div v-if="meshBedCompensation" class="row ms-3 mt-2">
				<!-- Delta Mesh Options-->
				<div v-if="showDeltaOptions" class="row">
					<div class="col-auto mt-0">
						<select-input label="First Axis" title="First axis to use for mesh grid compensation"
									  v-model="store.data.move.compensation.probeGrid.axes[0]" :options="getAxisLetters(0)"
									  :preset="store.preset.move.compensation.probeGrid.axes[0]" />
					</div>
					<div class="col-auto">
						<select-input label="Second Axis" title="Second axis to use for mesh grid compensation"
									  v-model="store.data.move.compensation.probeGrid.axes[1]" :options="getAxisLetters(1)"
									  :preset="store.preset.move.compensation.probeGrid.axes[1]" />
					</div>

					<div class="col">
						<number-input label="Probe Radius"
									  title="Probe radius of the mesh grid for automatic bed compensation"
									  v-model="store.data.move.compensation.probeGrid.radius"
									  :min="1" :max="deltaRadius" :step="0.1" unit="mm"
									  :preset="store.preset.move.compensation.probeGrid.radius" />
					</div>

					<div class="col">
						<number-input :label="`Grid Spacing in ${store.data.move.compensation.probeGrid.axes[0]} Direction`"
									  :title="`Spacing of the ${store.data.move.compensation.probeGrid.axes[0]} axis between the probe points for automatic bed compensation`"
									  v-model="store.data.move.compensation.probeGrid.spacings[0]"
									  :min="1" :max="store.data.move.compensation.probeGrid.radius"
									  :step="0.1" unit="mm"
									  :preset="store.preset.move.compensation.probeGrid.spacings[0]" />
					</div>
					<div class="col">
						<number-input :label="`Grid Spacing in ${store.data.move.compensation.probeGrid.axes[1]} Direction`"
									  :title="`Spacing of the ${store.data.move.compensation.probeGrid.axes[1]} axis between the probe points for automatic bed compensation`"
									  v-model="store.data.move.compensation.probeGrid.spacings[1]"
									  :min="1" :max="store.data.move.compensation.probeGrid.radius"
									  :step="0.1" unit="mm"
									  :preset="store.preset.move.compensation.probeGrid.spacings[1]" />
					</div>
				</div>

				<!-- Other Mesh Options -->
				<template v-else>
					<div class="row mb-3">
						<div class="col-auto">
							<select-input label="First Axis" title="First axis to use for mesh grid compensation"
										  v-model="store.data.move.compensation.probeGrid.axes[0]"
										  :options="getAxisLetters(0)"
										  :preset="store.preset.move.compensation.probeGrid.axes[0]" />
						</div>
						<div class="col">
							<number-input :label="`${store.data.move.compensation.probeGrid.axes[0]} Minimum`"
										  :title="`Minimum ${store.data.move.compensation.probeGrid.axes[0]} coordinate of the mesh grid for automatic bed compensation`"
										  v-model="store.data.move.compensation.probeGrid.mins[0]"
										  :min="store.data.move.axes.find(axis => axis.letter === store.data.move.compensation.probeGrid.axes[0])?.min"
										  :max="store.data.move.compensation.probeGrid.maxs[0]" :step="0.1" unit="mm"
										  :preset="store.preset.move.compensation.probeGrid.mins[0]" />
						</div>
						<div class="col">
							<number-input :label="`${store.data.move.compensation.probeGrid.axes[0]} Maximum`"
										  :title="`Maximum ${store.data.move.compensation.probeGrid.axes[0]} coordinate of the mesh grid for automatic bed compensation`"
										  v-model="store.data.move.compensation.probeGrid.maxs[0]"
										  :min="store.data.move.compensation.probeGrid.mins[0]"
										  :max="store.data.move.axes.find(axis => axis.letter === store.data.move.compensation.probeGrid.axes[0])?.max"
										  :step="0.1" unit="mm"
										  :preset="store.preset.move.compensation.probeGrid.maxs[0]" />
						</div>
						<div class="col">
							<number-input :label="`Grid Spacing in ${store.data.move.compensation.probeGrid.axes[0]} Direction`"
										  :title="`Spacing of the ${store.data.move.compensation.probeGrid.axes[0]} axis between the probe points for automatic bed compensation`"
										  v-model="store.data.move.compensation.probeGrid.spacings[0]" :min="1"
										  :max="store.data.move.compensation.probeGrid.maxs[0] - store.data.move.compensation.probeGrid.mins[0]"
										  :step="0.1" unit="mm"
										  :preset="store.preset.move.compensation.probeGrid.spacings[0]" />
						</div>
					</div>

					<div class="row">
						<div class="col-auto">
							<select-input label="Second Axis" title="Second axis to use for mesh grid compensation"
										  v-model="store.data.move.compensation.probeGrid.axes[1]"
										  :options="getAxisLetters(1)"
										  :preset="store.preset.move.compensation.probeGrid.axes[1]" />
						</div>
						<div class="col">
							<number-input :label="`${store.data.move.compensation.probeGrid.axes[1]} Minimum`"
										  :title="`Minimum ${store.data.move.compensation.probeGrid.axes[1]} coordinate of the mesh grid for automatic bed compensation`"
										  v-model="store.data.move.compensation.probeGrid.mins[1]"
										  :min="store.data.move.axes.find(axis => axis.letter === store.data.move.compensation.probeGrid.axes[1])?.min"
										  :max="store.data.move.compensation.probeGrid.maxs[1]" :step="0.1" unit="mm"
										  :preset="store.preset.move.compensation.probeGrid.mins[1]" />
						</div>
						<div class="col">
							<number-input :label="`${store.data.move.compensation.probeGrid.axes[1]} Maximum`"
										  :title="`Maximum ${store.data.move.compensation.probeGrid.axes[1]} coordinate of the mesh grid for automatic bed compensation`"
										  v-model="store.data.move.compensation.probeGrid.maxs[1]"
										  :min="store.data.move.compensation.probeGrid.mins[1]"
										  :max="store.data.move.axes.find(axis => axis.letter === store.data.move.compensation.probeGrid.axes[1])?.max"
										  :step="0.1" unit="mm"
										  :preset="store.preset.move.compensation.probeGrid.maxs[1]" />
						</div>
						<div class="col">
							<number-input :label="`Grid Spacing in ${store.data.move.compensation.probeGrid.axes[1]} Direction`"
										  :title="`Spacing of the ${store.data.move.compensation.probeGrid.axes[1]} axis between the probe points for automatic bed compensation`"
										  v-model="store.data.move.compensation.probeGrid.spacings[1]" :min="1"
										  :max="store.data.move.compensation.probeGrid.maxs[1] - store.data.move.compensation.probeGrid.mins[1]"
										  :step="0.1" unit="mm"
										  :preset="store.preset.move.compensation.probeGrid.spacings[1]" />
						</div>
					</div>
				</template>
			</div>
		</card>

		<!-- Orthogonal Axis Compensation -->
		<card title="Orthogonal Axis Compensation"
			  :preview-templates="showOrthogonalCompensationPreview ? ['config/compensation/orthogonal'] : null"
			  url-title="Further Information"
			  url="https://docs.duet3d.com/en/User_manual/Tuning/Orthogonal_axis_compensation">
			<div class="row">
				<div class="col-auto">
					<check-input label="Enable Orthogonal Axis Compensation"
								 title="Check this to enable orthogonal axis compensation via M556"
								 v-model="orthogonalCompensation" :preset="presetOrthogonalCompensation" />
				</div>
			</div>

			<div v-if="orthogonalCompensation" class="row ms-3 mt-2">
				<div class="col-3">
					<number-input label="Measured Distance"
								  title="Measured distance of the deviations for orthogonal axis compensation" :min="1"
								  step="any" unit="mm" v-model="store.data.configTool.orthogonalDistance"
								  :preset="store.preset.configTool.orthogonalDistance" />
				</div>
				<div class="col-3">
					<number-input label="Deviation in X" title="Deviation on the XY plane" step="any" unit="mm"
								  v-model="orthogonalDeviationX" :preset="presetOrthogonalDeviationX" />
				</div>
				<div class="col-3">
					<number-input label="Deviation in Y" title="Deviation on the YZ plane" step="any" unit="mm"
								  v-model="orthogonalDeviationY" :preset="presetOrthogonalDeviationY" />
				</div>
				<div class="col-3">
					<number-input label="Deviation in Z" title="Deviation on the XZ plane" step="any" unit="mm"
								  v-model="orthogonalDeviationZ" :preset="presetOrthogonalDeviationZ" />
				</div>
				<div class="col-auto mt-3">
					<check-input label="Apply compensation to X when Y moves"
								 title="Apply compensation to the X axis when Y is moved. If this is disabled, the XY axis compensation is applied to the Y axis when X moves"
								 v-model="store.data.move.compensation.skew.compensateXY"
								 :preset="store.preset.move.compensation.skew.compensateXY" />
				</div>
			</div>
		</card>
	</section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import Card from "@/components/Card.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { DeltaKinematics, ProbeGrid } from "@duet3d/objectmodel";
import { precise } from "@/utils";

const store = useStore();

// Delta Calibration
const showDeltaOptions = computed(() => (store.data.sensors.probes.length > 0) && (store.data.move.kinematics instanceof DeltaKinematics));

function calculateDeltaPoints() {
	let probeOffsetX = 0, probeOffsetY = 0;
	if (store.data.sensors.probes.length > 0 && store.data.sensors.probes[0] !== null && store.data.sensors.probes[0].offsets.length > 1) {
		probeOffsetX = store.data.sensors.probes[0].offsets[0];
		probeOffsetY = store.data.sensors.probes[0].offsets[1];
	}
	store.data.configTool.delta.calculateProbePoints(probeOffsetX, probeOffsetY);
}

const PeripheralPoints: Array<SelectOption> = [
	{
		text: "3",
		value: 3
	},
	{
		text: "6",
		value: 6
	},
	{
		text: "10",
		value: 10
	},
	{
		text: "12",
		value: 12
	}
];
const peripheralPoints = computed({
	get: () => store.data.configTool.delta.peripheralPoints,
	set(value) {
		store.data.configTool.delta.peripheralPoints = value;
		calculateDeltaPoints();
	}
})

const HalfwayPoints = computed<Array<SelectOption>>(() => [
	{
		text: "0",
		value: 0
	},
	{
		text: "3",
		value: 3
	},
	{
		disabled: peripheralPoints.value + 6 > 16,
		text: "6",
		value: 6
	}
]);
const halfwayPoints = computed({
	get: () => store.data.configTool.delta.halfwayPoints,
	set(value) {
		store.data.configTool.delta.halfwayPoints = value;
		calculateDeltaPoints();
	}
});

const CalibrationFactors: Array<SelectOption> = [
	{
		text: "4",
		value: 4
	},
	{
		text: "6",
		value: 6
	},
	{
		text: "7",
		value: 7
	},
	{
		text: "8",
		value: 8
	},
	{
		text: "9",
		value: 9
	}
];
const calibrationFactors = computed({
	get: () => store.data.configTool.delta.factors,
	set(value) {
		store.data.configTool.delta.factors = value;
		calculateDeltaPoints();
	}
});

const deltaRadius = computed(() => (store.data.move.kinematics as DeltaKinematics).deltaRadius);

const probeRadius = computed({
	get: () => store.data.configTool.delta.probeRadius,
	set(value) {
		store.data.configTool.delta.probeRadius = value;
		calculateDeltaPoints();
	}
});

const showDeltaProbePoints = ref(false);

// Mesh Bed Compensation
function getAxisLetters(index: number) {
	return store.data.move.axes.map(axis => ({
		text: axis.letter,
		value: axis.letter,
		disabled: axis.letter === store.data.move.compensation.probeGrid.axes[(index === 0) ? 1 : 0]
	}));
}

const meshBedCompensation = computed<boolean>({
	get() {
		if (store.data.isDelta) {
			return (store.data.move.compensation.probeGrid.radius > 0 &&
					store.data.move.compensation.probeGrid.spacings[0] > 0);
		}
		return (store.data.move.compensation.probeGrid.maxs[0] > store.data.move.compensation.probeGrid.mins[0] &&
				store.data.move.compensation.probeGrid.maxs[1] > store.data.move.compensation.probeGrid.mins[1] &&
				store.data.move.compensation.probeGrid.spacings[0] > 0 &&
				store.data.move.compensation.probeGrid.spacings[1] > 0);
	},
	set(value) {
		if (value) {
			store.data.move.compensation.probeGrid.axes[0] = 'X';
			store.data.move.compensation.probeGrid.axes[1] = 'Y';
			if (store.data.isDelta) {
				store.data.move.compensation.probeGrid.radius = precise(deltaRadius.value * 0.9, 2);
			} else {
				store.data.move.compensation.probeGrid.mins[0] = store.data.move.axes[0].min + 25;
				store.data.move.compensation.probeGrid.mins[1] = store.data.move.axes[1].min + 25;
				store.data.move.compensation.probeGrid.maxs[0] = store.data.move.axes[0].max - 25;
				store.data.move.compensation.probeGrid.maxs[1] = store.data.move.axes[1].max - 25;
			}
			store.data.move.compensation.probeGrid.spacings[0] = store.data.move.compensation.probeGrid.spacings[1] = 40;
		} else {
			store.data.move.compensation.probeGrid.radius = -1;
			store.data.move.compensation.probeGrid.mins[0] = store.data.move.compensation.probeGrid.mins[1] = 0;
			store.data.move.compensation.probeGrid.maxs[0] = store.data.move.compensation.probeGrid.maxs[1] = -1;
			store.data.move.compensation.probeGrid.spacings[0] = store.data.move.compensation.probeGrid.spacings[1] = 0;
		}
	}
});

const presetMeshBedCompensation = computed(() => {
	if (store.preset.isDelta) {
		return (store.preset.move.compensation.probeGrid.radius === 0 &&
				store.preset.move.compensation.probeGrid.spacings[0] === 0);
	}
	return (store.preset.move.compensation.probeGrid.maxs[0] < store.data.move.compensation.probeGrid.mins[0] &&
			store.preset.move.compensation.probeGrid.maxs[1] < store.data.move.compensation.probeGrid.mins[1] &&
			store.preset.move.compensation.probeGrid.spacings[0] === 0 &&
			store.preset.move.compensation.probeGrid.spacings[1] === 0);
});

// Orthogonal Axis Compensation
const configureOrthogonalCompensation = ref<boolean>(false);
const orthogonalCompensation = computed<boolean>({
	get() {
		return (store.data.move.compensation.skew.tanXY !== 0) ||
			(store.data.move.compensation.skew.tanXZ !== 0) ||
			(store.data.move.compensation.skew.tanYZ !== 0) ||
			configureOrthogonalCompensation.value;
	},
	set(value) {
		if (!value) {
			store.data.move.compensation.skew.tanXY = 0;
			store.data.move.compensation.skew.tanXZ = 0;
			store.data.move.compensation.skew.tanYZ = 0;
		}
		configureOrthogonalCompensation.value = value;
	}
});
const presetOrthogonalCompensation = computed(() => (store.preset.move.compensation.skew.tanXY !== 0) || (store.preset.move.compensation.skew.tanXZ !== 0) || (store.preset.move.compensation.skew.tanYZ !== 0));
const showOrthogonalCompensationPreview = computed(() => (store.data.move.compensation.skew.tanXY !== 0) || (store.data.move.compensation.skew.tanXZ !== 0) || (store.data.move.compensation.skew.tanYZ !== 0));

const orthogonalDeviationX = computed({
	get() { return store.data.configTool.orthogonalDistance * store.data.move.compensation.skew.tanXY; },
	set(value: number) { store.data.move.compensation.skew.tanXY = value / store.data.configTool.orthogonalDistance; }
});
const presetOrthogonalDeviationX = computed(() => store.preset.configTool.orthogonalDistance * store.preset.move.compensation.skew.tanXY);

const orthogonalDeviationY = computed({
	get() { return store.data.configTool.orthogonalDistance * store.data.move.compensation.skew.tanYZ; },
	set(value: number) { store.data.move.compensation.skew.tanYZ = value / store.data.configTool.orthogonalDistance; }
});
const presetOrthogonalDeviationY = computed(() => store.preset.configTool.orthogonalDistance * store.preset.move.compensation.skew.tanYZ);

const orthogonalDeviationZ = computed({
	get() { return store.data.configTool.orthogonalDistance * store.data.move.compensation.skew.tanXZ; },
	set(value: number) { store.data.move.compensation.skew.tanXZ = value / store.data.configTool.orthogonalDistance; }
});
const presetOrthogonalDeviationZ = computed(() => store.preset.configTool.orthogonalDistance * store.preset.move.compensation.skew.tanXZ);
</script>
