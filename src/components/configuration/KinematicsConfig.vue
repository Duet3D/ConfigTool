<template>
	<scroll-item anchor="Kinematics">
		<template #title>
			Kinematics
			<a v-if="store.data.move.kinematics.name === KinematicsName.cartesian" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_cartesian" target="_blank">
				<i class="bi-info-circle"></i>
				Cartesian configuration
			</a>
			<a v-else-if="isCoreKinematics" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_coreXY" target="_blank">
				<i class="bi-info-circle"></i>
				CoreXY configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.delta" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_linear_delta" target="_blank">
				<i class="bi-info-circle"></i>
				Linear Delta configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.rotaryDelta" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_rotary_delta" target="_blank">
				<i class="bi-info-circle"></i>
				Rotary Delta configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.scara" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_SCARA" target="_blank">
				<i class="bi-info-circle"></i>
				Serial SCARA configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.fiveBarScara" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_five_bar_parallel_scara" target="_blank">
				<i class="bi-info-circle"></i>
				Five Bar Parallel SCARA configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.hangprinter" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_Hangprinter" target="_blank">
				<i class="bi-info-circle"></i>
				Hangprinter configuration
			</a>
			<a v-else-if="store.data.move.kinematics.name === KinematicsName.polar" href="https://docs.duet3d.com/User_manual/Machine_configuration/Configuration_Polar" target="_blank">
				<i class="bi-info-circle"></i>
				Polar configuration
			</a>
		</template>

		<div class="row mb-3">
			<div class="col">
				<select-input label="Kinematics type" title="Kinematics type to use"
				              :model-value="store.data.move.kinematics.name" @update:model-value="setKinematics($event as KinematicsName)"
				              :options="KinematicsOptions" :preset="store.preset.move.kinematics.name" />
			</div>
			<div class="col-auto d-flex align-items-end">
				<button class="btn btn-secondary" @click="showAdvancedSettings = true">
					<i class="bi-calculator"></i>
					Advanced
				</button>
			</div>
		</div>
		<div v-if="isCoreKinematics" class="row">
			<!-- Core Kinematics -->
			<core-kinematics-dialog v-model="showAdvancedSettings" />
			<template v-for="letter in [AxisLetter.X, AxisLetter.Y, AxisLetter.Z]">
				<div class="col-2">
					<number-input v-if="getAxis(letter)"
					              :label="`${letter} minimum`" :title="`Minimum position of the ${letter} axis`"
					              :max="getAxis(letter).max - 0.01" step="any"
					              v-model="getAxis(letter).min" :preset="getAxisPreset(letter)?.min" />
					<span v-else class="text-danger is-invalid">
						missing {{ letter }} axis
					</span>
				</div>
				<div class="col-2">
					<number-input v-if="getAxis(letter)"
					              :label="`${letter} maximum`" :title="`Maximum position of the ${letter} axis`"
					              :min="getAxis(letter).min + 0.01" step="any"
					              v-model="getAxis(letter).max" :preset="getAxisPreset(letter)?.max" />
				</div>
			</template>
		</div>
		<div v-else-if="isDeltaKinematics" class="row g-3">
			<!-- Delta Kinematics -->
			<delta-kinematics-dialog v-model="showAdvancedSettings" />
			<div class="col">
				<number-input label="Delta radius" title="Horizontal distance subtended by each rod, measured between joint centres, when the effector is in the centre"
				              :min="deltaKinematics.printRadius" step="any"
				              v-model="deltaKinematics.deltaRadius" :preset="presetDeltaKinematics?.deltaRadius" />
			</div>
			<div class="col">
				<number-input v-if="getAxis(AxisLetter.Z)"
				              :label="`${AxisLetter.Z} minimum`" :title="`Minimum position of the ${AxisLetter.Z} axis`"
				              step="any"
				              v-model="getAxis(AxisLetter.Z).min" :preset="getAxisPreset(AxisLetter.Z)?.min" />
				<span v-else class="text-danger is-invalid">
					missing {{ AxisLetter.Z }} axis
				</span>
			</div>
			<div class="col">
				<number-input label="Homed height" title="Maximum build height of your printer"
				              :min="0" step="any"
				              v-model="deltaKinematics.homedHeight" :preset="presetDeltaKinematics?.homedHeight" />
			</div>
			<div class="col">
				<number-input label="Printable radius" title="Safe printing radius"
				              :min="0" :max="deltaKinematics.deltaRadius" step="any"
				              v-model="deltaKinematics.printRadius" :preset="presetDeltaKinematics?.printRadius" />
			</div>
			<div class="col">
				<number-input label="Diagonal rod length" title="Distance between the centre of your towers and the joint at the effector"
				              :min="0" step="any"
				              :model-value="avgDeltaRodLength" @update:model-value="setDeltaRodLength($event)" :preset="avgDeltaRodLengthPreset" />
			</div>
			Note about flying extruder axis
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.scara">
			<scara-kinematics-dialog v-model="showAdvancedSettings" />
			Proximal arm length
			Distal arm length
			Ground-to-proximal joint minimum and maximum angles
			Proximal-to-distal joint minimum and maximum angles
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.fiveBarScara">
			<scara-kinematics-dialog v-model="showAdvancedSettings" />
			Proximal arm length
			Distal arm length
			Ground-to-proximal joint minimum and maximum angles
			Proximal-to-distal joint minimum and maximum angles

			Working mode
			X and Y coordinates of the left and right proximal actuator axes
			Proximal arm lengths
			Degrees of the homing end positions
			Minimum angle between the distal arms
			Minimal and maximal angle left and right of the actuators. C
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.hangprinter">
			X, Y and Z coordinates of the A anchor
			X, Y and Z coordinates of the B anchor
			X, Y and Z coordinates of the C anchor
			Z coordinate of the D anchor (the XY coordinates of the D anchor are 0,0)
			Printable radius from the origin
		</div>
		<div v-else-if="store.data.move.kinematics.name === KinematicsName.polar">
			Minimum and maximum radius in mm. If only one value it given it will be used as the maximum radius, and the minimum radius will be assumed to be zero.
			Radius in mm at which the homing switch is triggered during a homing move. If this parameter is not present, the homing switch is assumed to trigger at the minimum radius.
			Maximum turntable speed in degrees per second
			Maximum turntable acceleration in degrees per second per second
		</div>
	</scroll-item>
</template>

<script setup lang="ts">
import { Axis, AxisLetter, CoreKinematics, DeltaKinematics, KinematicsName } from "@duet3d/objectmodel";

import ScrollItem from "@/components/ScrollItem.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { computed, ref } from "vue";
import CoreKinematicsDialog from "@/components/dialogs/CoreKinematicsDialog.vue";
import { type CoreKinematicsTypes, DefaultForwardMatrix, DefaultInverseMatrix } from "@/store/defaults";
import DeltaKinematicsDialog from "@/components/dialogs/DeltaKinematicsDialog.vue";
import ScaraKinematicsDialog from "@/components/dialogs/ScaraKinematicsDialog.vue";

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
			text: "Rotary Delta",
			value: KinematicsName.rotaryDelta
		}
	],
	"Other Kinematics": [
		{
			text: "Serial SCARA",
			value: KinematicsName.scara
		},
		{
			text: "Five Bar Parallel SCARA",
			value: KinematicsName.fiveBarScara
		},
		{
			text: "Hangprinter",
			value: KinematicsName.hangprinter
		},
		{
			text: "Polar",
			value: KinematicsName.polar,
		}
	]
};

function setKinematics(value: KinematicsName) {
	store.data.update({ move: { kinematics: { name: value } } });
	if (store.data.move.kinematics instanceof CoreKinematics) {
		store.data.move.kinematics.update({
			forwardMatrix: DefaultForwardMatrix[value as CoreKinematicsTypes],
			inverseMatrix: DefaultInverseMatrix[value as CoreKinematicsTypes]
		});
	}
}


const isCoreKinematics = computed(() => store.data.move.kinematics instanceof CoreKinematics);
const isDeltaKinematics = computed(() => store.data.move.kinematics instanceof DeltaKinematics);
const deltaKinematics = computed(() => (store.data.move.kinematics instanceof DeltaKinematics) ? store.data.move.kinematics : null);
const presetDeltaKinematics = computed(() => (store.preset.move.kinematics instanceof DeltaKinematics) ? store.preset.move.kinematics : null);

const showAdvancedSettings = ref(false);

// Core kinematics
function getAxis(letter: AxisLetter): Axis | null {
	return store.data.move.axes.find(axis => axis.letter === letter) || null;
}

function getAxisPreset(letter: AxisLetter): Axis | null {
	return store.preset.move.axes.find(axis => axis.letter === letter) || null;
}

// Delta kinematics
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
</script>
