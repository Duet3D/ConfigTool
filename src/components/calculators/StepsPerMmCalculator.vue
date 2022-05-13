<template>
	<base-calculator ref="calculator" title="Calculate steps per mm"
	                 :min="0" step="any"
	                 v-model="props.axis.stepsPerMm">
		<form class="row g-3" @submit.prevent="apply">
			<template v-if="props.axis">
				<!-- Axis Inputs -->
				<div class="col-12">
					<select-input label="Motor step angle"
					              :required="false"
					              v-model="stepAngle" :options="stepAngleOptions" />
				</div>
				<div class="col-6">
					<select-input label="Drive type"
					              :required="false"
					              v-model="driveType" :options="driveTypeOptions" />
				</div>
				<template v-if="driveType === DriveType.belt">
					<!-- Belt Inputs -->
					<div class="col-6">
						<select-input label="Belt preset"
						              :required="false"
						              v-model="beltPreset" :options="BeltPresets.map(preset => preset.name)" />
					</div>
					<div class="col-6">
						<number-input label="Belt pitch"
						              :min="0.1" step="any" unit="mm"
						              v-model="belt.pitch" :preset="BeltPresets.find(preset => preset.name === beltPreset).pitch" />
					</div>
					<div class="col-6">
						<number-input label="Pulley teeth"
						              :min="1" :step="1"
						              v-model="belt.pulleyTeeth" :preset="BeltPresets.find(preset => preset.name === beltPreset).pulleyTeeth" />
					</div>
				</template>
				<template v-else>
					<!-- Leadscrew Inputs -->
					<div class="col-6">
						<select-input label="Leadscrew preset"
						              :required="false"
						              v-model="leadscrewPreset" :options="leadscrewPresetOptions" />
					</div>
					<div class="col-6">
						<number-input label="Lead"
						              :min="0.01" step="any"
						              v-model="leadscrew.lead" />
					</div>
					<div class="col-6">
						<ratio-input label="Gear ratio"
						             v-model:first-ratio="leadscrew.ratio1" v-model:second-ratio="leadscrew.ratio2" />
					</div>
				</template>
			</template>
			<template v-else-if="props.extruder">
				<!-- Extruder inputs -->

			</template>

			<div class="col-12">
				<h4>
					Resulting steps per mm: <span :class="stepsPerMmValid ? 'text-success' : 'text-danger'" v-text="stepsPerMm"></span>
				</h4>
			</div>

			<div class="col mt-3 d-flex justify-content-center">
				<button type="submit" class="btn btn-outline-success" :disabled="!stepsPerMmValid">
					<i class="bi-check-circle"></i>
					Apply
				</button>
				<button type="button" class="btn btn-outline-danger ms-2" @click="cancel">
					<i class="bi-x-circle"></i>
					Cancel
				</button>
			</div>
		</form>
	</base-calculator>
</template>

<script lang="ts">
import { computed, reactive, ref } from "vue";

import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue"

// Motor settings
const stepAngle = ref(1.8);
const stepAngleOptions: Array<SelectOption> = [
	{
		text: "0.9° (400 steps per rev)",
		value: 0.9
	},
	{
		text: "1.8° (200 steps per rev)",
		value: 1.8
	},
	{
		text: "7.5° (48 steps per rev)",
		value: 7.5
	}
];

// Drive types
enum DriveType {
	belt = "belt",
	leadscrew = "leadscrew"
}
const driveTypeOptions: Array<SelectOption> = [
	{
		text: "Belt",
		value: DriveType.belt
	},
	{
		text: "Leadscrew",
		value: DriveType.leadscrew
	}
]

// Belt
interface BeltPreset {
	name: string,
	pitch: number | null,
	pulleyTeeth: number | null
}
const BeltPresets: Array<BeltPreset> = [
	{
		name: "GT2",
		pitch: 2,
		pulleyTeeth: 20
	},
	{
		name: "MXL",
		pitch: 2.05,
		pulleyTeeth: 16
	},
	{
		name: "T2.5",
		pitch: 2.5,
		pulleyTeeth: 20
	},
	{
		name: "T5",
		pitch: 5,
		pulleyTeeth: 20
	},
	{
		name: "Custom",
		pitch: null,
		pulleyTeeth: null
	}
];

const belt = reactive({
	pitch: BeltPresets[0].pitch!,
	pulleyTeeth: BeltPresets[0].pulleyTeeth!
})

const beltPreset = computed({
	get() {
		for (const preset of BeltPresets) {
			if (preset.pitch === belt.pitch && preset.pulleyTeeth === belt.pulleyTeeth) {
				return preset.name;
			}
		}
		return BeltPresets[BeltPresets.length - 1].name;
	},
	set(value) {
		const preset = BeltPresets.find(preset => preset.name === value);
		if (preset && preset.pitch !== null && preset.pulleyTeeth !== null) {
			belt.pitch = preset.pitch;
			belt.pulleyTeeth = preset.pulleyTeeth;
		}
	}
})

// Leadscrew
interface LeadscrewPreset {
	name: string;
	lead: number | null;
}
const LeadscrewPresets: Record<string, Array<LeadscrewPreset>> = {
	Trapezoid: [
		{
			name: "TR1.5",
			lead: 1.5
		},
		{
			name: "TR3",
			lead: 3
		},
		{
			name: "TR4",
			lead: 4
		},
		{
			name: "TR6",
			lead: 6
		},
		{
			name: "TR8",
			lead: 8
		}
	],
	Metric: [
		{
			name: "M5",
			lead: 0.8
		},
		{
			name: "M6",
			lead: 1
		},
		{
			name: "M8",
			lead: 1.25
		}
	],
	Other: [
		{
			name: "Custom",
			lead: null
		}
	]
}
const leadscrewPresetOptions: Record<string, Array<string> | string> = {};
for (const category in LeadscrewPresets) {
	leadscrewPresetOptions[category] = LeadscrewPresets[category].map(item => item.name);
}

const leadscrew = reactive({
	lead: 4,
	ratio1: 1,
	ratio2: 1
})

const leadscrewPreset = computed({
	get() {
		for (const category in LeadscrewPresets) {
			const preset = LeadscrewPresets[category].find(preset => preset.lead === leadscrew.lead);
			if (preset) {
				return preset.name;
			}
		}
		return LeadscrewPresets["Other"][0].name;
	},
	set(value) {
		for (const category in LeadscrewPresets) {
			const preset = LeadscrewPresets[category].find(preset => preset.name === value);
			if (preset && preset.lead !== null) {
				leadscrew.lead = preset.lead;
			}
		}
	}
})
</script>

<script setup lang="ts">
import { Axis, AxisLetter, DeltaKinematics, Extruder } from "@duet3d/objectmodel";
import type { Ref } from "vue";

import BaseCalculator from "./BaseCalculator.vue";
import NumberInput from "@/components/inputs/NumberInput.vue"
import RatioInput from "@/components/inputs/RatioInput.vue"

import { useStore } from "@/store";

const props = defineProps<{
	axis?: Axis
	extruder?: Extruder
}>();

const store = useStore();

const calculator: Ref<typeof BaseCalculator | null> = ref(null);

// Axes
const driveType = ref((store.data.move.kinematics instanceof DeltaKinematics || (!props.axis || props.axis.letter !== AxisLetter.Z)) ? DriveType.belt : DriveType.leadscrew);

// Extruders

// Global
function fixPrecision(value: number, maxFractionDigits: number) {
	return Math.round(value * (10 ** maxFractionDigits)) / (10 ** maxFractionDigits);
}
const stepsPerMm = computed(() => {
	if (props.axis) {
		switch (driveType.value) {
			case DriveType.belt:
				return fixPrecision((360 * props.axis.microstepping.value) / (belt.pulleyTeeth * belt.pitch * stepAngle.value), 2);
				break;
			case DriveType.leadscrew:
				const leadscrewRatio = leadscrew.ratio2 / leadscrew.ratio1;
				return fixPrecision((360.0 * props.axis.microstepping.value * leadscrewRatio) / (leadscrew.lead * stepAngle.value), 2);
			default:
				const _exhaustiveCheck: never = driveType.value;
				break;
		}
	}
	if (props.extruder) {
		// TODO
	}
	return NaN;
})
const stepsPerMmValid = computed(() => isFinite(stepsPerMm.value));

function apply() {
	if (props.axis) {
		props.axis.stepsPerMm = stepsPerMm.value;
	}
	if (props.extruder) {
		props.extruder.stepsPerMm = stepsPerMm.value;
	}
	calculator.value?.hide(true);
}

function cancel() {
	calculator.value?.hide(true);
}
</script>
