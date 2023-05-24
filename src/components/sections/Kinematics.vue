<template>
	<config-section :type="ConfigSectionType.Kinematics" title="Kinematics">
		<template #append-title>
			<a v-if="store.data.move.kinematics.name === KinematicsName.cartesian"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_cartesian" target="_blank">
				<i class="bi-info-circle"></i>
				Cartesian configuration
			</a>
			<a v-else-if="isCoreKinematics"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_coreXY" target="_blank">
				<i class="bi-info-circle"></i>
				CoreXY configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.delta"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_linear_delta"
			   target="_blank">
				<i class="bi-info-circle"></i>
				Linear Delta configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.rotaryDelta"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_rotary_delta"
			   target="_blank">
				<i class="bi-info-circle"></i>
				Rotary Delta configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.scara"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_SCARA" target="_blank">
				<i class="bi-info-circle"></i>
				Serial SCARA configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.fiveBarScara"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_five_bar_parallel_scara"
			   target="_blank">
				<i class="bi-info-circle"></i>
				Five Bar Parallel SCARA configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.hangprinter"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_Hangprinter"
			   target="_blank">
				<i class="bi-info-circle"></i>
				Hangprinter configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.polar"
			   href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_Polar" target="_blank">
				<i class="bi-info-circle"></i>
				Polar configuration
			</a>
		</template>

		<div class="row mb-3">
			<div class="col">
				<select-input label="Kinematics type" title="Kinematics type to use"
							  :model-value="store.data.move.kinematics.name"
							  @update:model-value="setKinematics($event as KinematicsName)" :options="KinematicsOptions"
							  :preset="store.preset.move.kinematics.name" />
			</div>
			<div class="col-auto d-flex align-items-end">
				<button class="btn btn-secondary" @click.prevent="showAdvancedSettings = true">
					<i class="bi-box-arrow-up-right"></i>
					Advanced
				</button>
			</div>
		</div>
		<div v-if="isCoreKinematics" class="row">
			<!-- Core Kinematics -->
			<core-kinematics-dialog v-model="showAdvancedSettings" />
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.delta" class="row g-3">
			<!-- Delta Kinematics -->
			<delta-kinematics-dialog v-model="showAdvancedSettings" />
			<div class="col">
				<number-input label="Delta radius"
							  title="Horizontal distance subtended by each rod, measured between joint centres, when the effector is in the centre"
							  :min="deltaKinematics!.printRadius" :step="0.1" unit="mm"
							  v-model="deltaKinematics!.deltaRadius" :preset="presetDeltaKinematics?.deltaRadius" />
			</div>
			<div class="col">
				<number-input v-if="getAxis(AxisLetter.Z)" :label="`${AxisLetter.Z} minimum`"
							  :title="`Minimum position of the ${AxisLetter.Z} axis`" :step="0.01" unit="mm"
							  v-model="getAxis(AxisLetter.Z)!.min" :preset="getAxisPreset(AxisLetter.Z)?.min" />
				<span v-else class="text-danger is-invalid">
					missing {{ AxisLetter.Z }} axis
				</span>
			</div>
			<div class="col">
				<number-input label="Homed height" title="Maximum build height of your printer" :min="0" :step="0.001"
							  unit="mm" v-model="deltaKinematics!.homedHeight"
							  :preset="presetDeltaKinematics?.homedHeight" />
			</div>
			<div class="col">
				<number-input label="Printable radius" title="Safe printing radius" :min="0"
							  :max="deltaKinematics!.deltaRadius" :step="0.1" unit="mm"
							  v-model="deltaKinematics!.printRadius" :preset="presetDeltaKinematics?.printRadius" />
			</div>
			<div class="col">
				<number-input label="Diagonal rod length"
							  title="Distance between the centre of your towers and the joint at the effector" :min="0"
							  :step="0.001" unit="mm" :model-value="avgDeltaRodLength"
							  @update:model-value="setDeltaRodLength($event)" :preset="avgDeltaRodLengthPreset" />
			</div>
			<div class="col-12">
				<check-input label="Set initial homing speed to 10% for calibration and add a note to homedelta.g"
							 title="Reduce homing speed. Recommended for initial calibration"
							 v-model="store.data.configTool.delta.slowHoming" />
			</div>
			<div class="col-12 mt-1">
				<check-input label="Set dive height to 30mm for initial calibration"
							 title="Generate an extra M558 code in config.g that you can remove after initial calibration"
							 v-model="store.data.configTool.delta.lowDiveHeight" />
			</div>
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.rotaryDelta">
			<!-- Rotary Delta kinematics -->
			<delta-kinematics-dialog v-model="showAdvancedSettings" />
			<h4 class="is-invalid text-danger">
				<i class="bi-exclamation-triangle"></i> unsupported kinematics
			</h4>
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.scara" class="row">
			<!-- SCARA kinematics -->
			<scara-kinematics-dialog v-model="showAdvancedSettings" />
			<h4 class="is-invalid text-danger">
				<i class="bi-exclamation-triangle"></i> unsupported kinematics
			</h4>
			<!--
			Proximal arm length
			Distal arm length
			Ground-to-proximal joint minimum and maximum angles
			Proximal-to-distal joint minimum and maximum angles
			-->
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.fiveBarScara">
			<!-- Five Bar SCARA kinematics -->
			<scara-kinematics-dialog v-model="showAdvancedSettings" />
			<h4 class="is-invalid text-danger">
				<i class="bi-exclamation-triangle"></i> unsupported kinematics
			</h4>
			<!--
			Proximal arm length
			Distal arm length
			Ground-to-proximal joint minimum and maximum angles
			Proximal-to-distal joint minimum and maximum angles

			Working mode
			X and Y coordinates of the left and right proximal actuator axes
			Proximal arm lengths
			Degrees of the homing end positions
			Minimum angle between the distal arms
			Minimal and maximal angle left and right of the actuators
			-->
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.hangprinter">
			<!-- Hangprinter kinematics -->
			<hangprinter-kinematics-dialog v-model="showAdvancedSettings" />
			<div class="row">
				<div class="col">
					<number-input label="Printable radius from the origin"
								  title="Printable radius from the origin of the printer" :min="0.1" :step="0.1"
								  unit="mm" v-model="hangprinterKinematics!.printRadius"
								  :preset="presetHangprinterKinematics?.printRadius" />
				</div>
				<div class="col">
					<number-input v-if="getAxis(AxisLetter.Z)" :label="`${AxisLetter.Z} minimum`"
								  :title="`Minimum position of the ${AxisLetter.Z} axis`"
								  :max="getAxis(AxisLetter.Z)!.max - 0.01" :step="0.01" unit="mm"
								  v-model="getAxis(AxisLetter.Z)!.min" :preset="getAxisPreset(AxisLetter.Z)?.min" />
					<span v-else class="text-danger is-invalid">
						missing {{ AxisLetter.Z }} axis
					</span>
				</div>
				<div class="col">
					<number-input v-if="getAxis(AxisLetter.Z)" :label="`${AxisLetter.Z} maximum`"
								  :title="`Maximum position of the ${AxisLetter.Z} axis`"
								  :min="getAxis(AxisLetter.Z)!.min + 0.01" :step="0.01" unit="mm"
								  v-model="getAxis(AxisLetter.Z)!.max" :preset="getAxisPreset(AxisLetter.Z)?.max" />
				</div>
			</div>
			<div class="row mt-3">
				<div class="col-12">
					<label for="anchors" class="mb-1">
						Anchor coordinates:
					</label>
					<table id="anchors" class="table table-bordered table-striped mb-0">
						<thead>
							<tr>
								<th class="text-center">
									Anchor
								</th>
								<th>
									X
								</th>
								<th>
									Y
								</th>
								<th>
									Z
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(anchor, index) in ['A', 'B', 'C', 'D']">
								<td class="text-center align-middle">
									{{ anchor }}
								</td>
								<td>
									<number-input :title="`X coordinate of the ${anchor} anchor`" :step="0.1" unit="mm"
												  :disabled="anchor === 'D'"
												  v-model="hangprinterKinematics!.anchors[index][0]"
												  :preset="presetHangprinterKinematics?.anchors[index][0]" />
								</td>
								<td>
									<number-input :title="`Y coordinate of the ${anchor} anchor`" :step="0.1" unit="mm"
												  :disabled="anchor === 'D'"
												  v-model="hangprinterKinematics!.anchors[index][1]"
												  :preset="presetHangprinterKinematics?.anchors[index][1]" />
								</td>
								<td>
									<number-input :title="`Z coordinate of the ${anchor} anchor`" :step="0.1" unit="mm"
												  v-model="hangprinterKinematics!.anchors[index][2]"
												  :preset="presetHangprinterKinematics?.anchors[index][2]" />
								</td>
								<!--
								<td>
									<number-input v-if="getAxis(AxisLetter.Z)"
									              :title="`Z coordinate of the ${anchor} anchor`"
									              :min="getAxis(AxisLetter.Z).min" :max="getAxis(AxisLetter.Z).max" :step="0.01" unit="mm"
									              v-model="hangprinterKinematics.anchors[index][2]" :preset="presetHangprinterKinematics?.anchors[index][2]" />
									<span v-else class="text-danger is-invalid">
										missing {{ AxisLetter.Z }} axis
									</span>
								</td>
								-->
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.polar">
			<!-- Polar kinematics -->
			<polar-kinematics-dialog v-model="showAdvancedSettings" />
			<h4 class="is-invalid text-danger">
				<i class="bi-exclamation-triangle"></i> unsupported kinematics
			</h4>
			<!--
			Minimum and maximum radius in mm. If only one value it given it will be used as the maximum radius, and the minimum radius will be assumed to be zero.
			Radius in mm at which the homing switch is triggered during a homing move. If this parameter is not present, the homing switch is assumed to trigger at the minimum radius.
			Maximum turntable speed in degrees per second
			Maximum turntable acceleration in degrees per second per second
			-->
		</div>
	</config-section>
</template>

<script setup lang="ts">
import { Axis, AxisLetter, KinematicsName, CoreKinematics, DeltaKinematics, HangprinterKinematics, EndstopType, initObject } from "@duet3d/objectmodel";
import { computed, ref } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import CoreKinematicsDialog from "@/components/dialogs/CoreKinematicsDialog.vue";
import DeltaKinematicsDialog from "@/components/dialogs/DeltaKinematicsDialog.vue";
import PolarKinematicsDialog from "@/components/dialogs/PolarKinematicsDialog.vue";
import ScaraKinematicsDialog from "@/components/dialogs/ScaraKinematicsDialog.vue";
import HangprinterKinematicsDialog from "@/components/dialogs/HangprinterKinematicsDialog.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { type CoreKinematicsTypes, DefaultForwardMatrix, DefaultInverseMatrix, DefaultDeltaKinematics } from "@/store/defaults";
import { ConfigSectionType } from "@/store/sections";

const store = useStore();

// Kinematics selection
const KinematicsOptions: Record<string, Array<SelectOption>> = {
	"Core Kinematics": [
		{
			text: "Cartesian",
			value: KinematicsName.cartesian
		},
		{
			text: "CoreXY",
			value: KinematicsName.coreXY
		},
		{
			text: "CoreXZ",
			value: KinematicsName.coreXZ
		},
		{
			text: "CoreXYU",
			value: KinematicsName.coreXYU
		},
		{
			text: "CoreXYUV",
			value: KinematicsName.coreXYUV
		},
		{
			text: "MarkForged",
			value: KinematicsName.markForged
		}
	],
	"Delta Kinematics": [
		{
			text: "Linear Delta",
			value: KinematicsName.delta
		},
		{
			disabled: true,
			text: "Rotary Delta",
			value: KinematicsName.rotaryDelta
		}
	],
	"SCARA Kinematics": [
		{
			disabled: true,
			text: "Serial SCARA",
			value: KinematicsName.scara
		},
		{
			disabled: true,
			text: "Five Bar Parallel SCARA",
			value: KinematicsName.fiveBarScara
		}
	],
	"Other Kinematics": [
		{
			text: "Hangprinter",
			value: KinematicsName.hangprinter
		},
		{
			disabled: true,
			text: "Polar",
			value: KinematicsName.polar
		}
	]
};

// General
function setKinematics(value: KinematicsName) {
	store.data.update({ move: { kinematics: { name: value } } });
	if (store.data.move.kinematics instanceof CoreKinematics) {
		// Update forward/inverse matrices for core kinematics
		store.data.move.kinematics.update({
			forwardMatrix: DefaultForwardMatrix[value as CoreKinematicsTypes],
			inverseMatrix: DefaultInverseMatrix[value as CoreKinematicsTypes]
		});

		// Ensure U axis for CoreXYU and CoreXYUV
		if ([KinematicsName.coreXYU, KinematicsName.coreXYUV].includes(value) && (store.data.move.axes.length < 4 || store.data.move.axes[3].letter !== AxisLetter.U)) {
			if (store.data.move.axes.length < 4) {
				store.data.move.axes.push(initObject(Axis, {
					letter: AxisLetter.U
				}));
			} else {
				store.data.move.axes[3].letter = AxisLetter.U;
				for (let i = 4; i < store.data.move.axes.length; i++) {
					if (store.data.move.axes[i].letter === AxisLetter.U) {
						store.data.move.axes[i].letter = AxisLetter.none;
					}
				}
			}
		}

		// Ensure V axis for CoreXYUV
		if (value === KinematicsName.coreXYUV && (store.data.move.axes.length < 5 || store.data.move.axes[3].letter !== AxisLetter.V)) {
			if (store.data.move.axes.length < 5) {
				store.data.move.axes.push(initObject(Axis, {
					letter: AxisLetter.V
				}));
			} else {
				store.data.move.axes[4].letter = AxisLetter.V;
				for (let i = 5; i < store.data.move.axes.length; i++) {
					if (store.data.move.axes[i].letter === AxisLetter.V) {
						store.data.move.axes[i].letter = AxisLetter.none;
					}
				}
			}
		}
	}

	// Update defaults
	if (store.data.move.kinematics instanceof DeltaKinematics) {
		store.data.move.kinematics.update(DefaultDeltaKinematics);

		for (const axis of store.data.move.axes) {
			if ([AxisLetter.X, AxisLetter.Y].includes(axis.letter)) {
				if (axis.jerk === 15) { axis.jerk = 20; }
				if (axis.speed === 100) { axis.speed = 300; }
				if (axis.acceleration === 500) { axis.acceleration = 1000; }
			} else if (axis.letter === AxisLetter.Z) {
				if (axis.stepsPerMm === 400) { axis.stepsPerMm = 80; }
				if (axis.jerk === 0.2) { axis.jerk = 20; }
				if (axis.speed === 3) { axis.speed = 300; }
				if (axis.acceleration == 20) { axis.acceleration = 1000; }
			}
		}
		if (store.preset.configTool.name !== null) {
			for (const presetAxis of store.preset.move.axes) {
				if ([AxisLetter.X, AxisLetter.Y, AxisLetter.Z].includes(presetAxis.letter)) {
					presetAxis.stepsPerMm = 80;
					presetAxis.jerk = 20;
					presetAxis.speed = 300;
					presetAxis.acceleration = 1000;
				}
			}
		}

		for (const extruder of store.data.move.extruders) {
			if (extruder.stepsPerMm === 420) { extruder.stepsPerMm = 663; }
			if (extruder.jerk === 2) { extruder.jerk = 20; }
			if (extruder.acceleration == 250) { extruder.jerk = 1000; }
		}
		if (store.preset.configTool.name !== null) {
			for (const presetExtruder of store.preset.move.extruders) {
				presetExtruder.stepsPerMm = 663;
				presetExtruder.jerk = 20;
				presetExtruder.acceleration = 1000;
			}
		}

		for (let i = 0; i < store.data.move.axes.length; i++) {
			if ([AxisLetter.X, AxisLetter.Y, AxisLetter.Z].includes(store.data.move.axes[i].letter)) {
				const endstop = (i < store.data.sensors.endstops.length) ? store.data.sensors.endstops[i] : null;
				if (endstop !== null) {
					endstop.highEnd = true;
					if (store.data.move.axes[i].letter === AxisLetter.Z && endstop.type === EndstopType.ZProbeAsEndstop) { endstop.type = EndstopType.InputPin; }
				}

				if (store.preset.configTool.name !== null) {
					const presetEndstop = (i < store.preset.sensors.endstops.length) ? store.preset.sensors.endstops[i] : null;
					if (presetEndstop !== null) {
						presetEndstop.highEnd = true;
						presetEndstop.type = EndstopType.InputPin;
					}
				}
			}
		}
	} else {
		for (const axis of store.data.move.axes) {
			if ([AxisLetter.X, AxisLetter.Y].includes(axis.letter)) {
				if (axis.jerk === 20) { axis.jerk = 15; }
				if (axis.speed === 300) { axis.speed = 100; }
				if (axis.acceleration === 1000) { axis.acceleration = 500; }
			} else if (axis.letter === AxisLetter.Z) {
				if (axis.stepsPerMm === 80) { axis.stepsPerMm = 400; }
				if (axis.jerk === 20) { axis.jerk = 0.2; }
				if (axis.speed === 300) { axis.speed = 3; }
				if (axis.acceleration == 1000) { axis.acceleration = 20; }
			}
		}
		if (store.preset.configTool.name !== null) {
			for (const presetAxis of store.preset.move.axes) {
				if ([AxisLetter.X, AxisLetter.Y].includes(presetAxis.letter)) {
					presetAxis.jerk = 20;
					presetAxis.speed = 300;
					presetAxis.acceleration = 1000;
				} else if (presetAxis.letter === AxisLetter.Z) {
					presetAxis.stepsPerMm = 400;
					presetAxis.jerk = 0.2;
					presetAxis.speed = 3;
					presetAxis.acceleration = 20;
				}
			}
		}

		for (const extruder of store.data.move.extruders) {
			if (extruder.stepsPerMm === 663) { extruder.stepsPerMm = 420; }
			if (extruder.jerk === 20) { extruder.jerk = 2; }
			if (extruder.acceleration == 1000) { extruder.acceleration = 250; }
		}
		if (store.preset.configTool.name !== null) {
			for (const presetExtruder of store.preset.move.extruders) {
				presetExtruder.stepsPerMm = 420;
				presetExtruder.jerk = 2;
				presetExtruder.acceleration = 250;
			}
		}

		for (let i = 0; i < store.data.move.axes.length; i++) {
			if ([AxisLetter.X, AxisLetter.Y, AxisLetter.Z].includes(store.data.move.axes[i].letter)) {
				const endstop = (i < store.data.sensors.endstops.length) ? store.data.sensors.endstops[i] : null;
				if (endstop !== null) {
					endstop.highEnd = false;
					if (store.data.move.axes[i].letter === AxisLetter.Z && endstop.type === EndstopType.InputPin) { endstop.type = EndstopType.ZProbeAsEndstop; }
				}

				if (store.preset.configTool.name !== null) {
					const presetEndstop = (i < store.preset.sensors.endstops.length) ? store.preset.sensors.endstops[i] : null;
					if (presetEndstop !== null) {
						presetEndstop.highEnd = false;
						presetEndstop.type = (store.data.move.axes[i].letter !== AxisLetter.Z) ? EndstopType.InputPin : EndstopType.ZProbeAsEndstop;
					}
				}
			}
		}
	}
}

const showAdvancedSettings = ref(false);

// Core kinematics
const isCoreKinematics = computed(() => store.data.move.kinematics instanceof CoreKinematics);

function getAxis(letter: AxisLetter): Axis | null {
	return store.data.move.axes.find(axis => axis.letter === letter) || null;
}

function getAxisPreset(letter: AxisLetter): Axis | null {
	return store.preset.move.axes.find(axis => axis.letter === letter) || null;
}

// Delta kinematics
const deltaKinematics = computed(() => (store.data.move.kinematics instanceof DeltaKinematics) ? store.data.move.kinematics : null);
const presetDeltaKinematics = computed(() => (store.preset.move.kinematics instanceof DeltaKinematics) ? store.preset.move.kinematics : null);

const avgDeltaRodLength = computed(() => {
	let avgLength = 0;
	if (store.data.move.kinematics instanceof DeltaKinematics && store.data.move.kinematics.towers.length > 0) {
		for (const tower of store.data.move.kinematics.towers) {
			avgLength += tower.diagonal;
		}
		avgLength /= store.data.move.kinematics.towers.length;
	}
	return avgLength;
});
function setDeltaRodLength(value: number) {
	if (store.data.move.kinematics instanceof DeltaKinematics) {
		for (const tower of store.data.move.kinematics.towers) {
			tower.diagonal = value;
		}
	}
}
const avgDeltaRodLengthPreset = computed(() => {
	let avgLength = 0;
	if (store.preset.move.kinematics instanceof DeltaKinematics && store.preset.move.kinematics.towers.length > 0) {
		for (const tower of store.preset.move.kinematics.towers) {
			avgLength += tower.diagonal;
		}
		avgLength /= store.preset.move.kinematics.towers.length;
	}
	return avgLength;
});

// SCARA kinematics
//const scaraKinematics = computed(() => (store.data.move.kinematics instanceof ScaraKinematics) ? store.data.move.kinematics : null);
//const presetScaraKinematics = computed(() => (store.preset.move.kinematics instanceof ScaraKinematics) ? store.preset.move.kinematics : null);

// Hangprinter kinematics
const hangprinterKinematics = computed(() => (store.data.move.kinematics instanceof HangprinterKinematics) ? store.data.move.kinematics : null);
const presetHangprinterKinematics = computed(() => (store.preset.move.kinematics instanceof HangprinterKinematics) ? store.preset.move.kinematics : null);

// Polar kinematics
//const polarKinematics = computed(() => (store.data.move.kinematics instanceof PolarKinematics) ? store.data.move.kinematics : null);
//const presetPolarKinematics = computed(() => (store.preset.move.kinematics instanceof PolarKinematics) ? store.preset.move.kinematics : null);
</script>
