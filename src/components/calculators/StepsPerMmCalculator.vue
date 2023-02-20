<template>
	<base-calculator ref="calculator" title="Calculate steps per mm" :min="0" step="any" v-model="stepsPerMm"
					 @show="onShow" @hide="onHide">
		<form class="row g-3" @submit.prevent="apply">
			<template v-if="props.axis">
				<!-- Axis Inputs -->
				<div class="col-12">
					<select-input label="Motor step angle" :required="false" v-model="stepAngle"
								  :options="stepAngleOptions" />
				</div>
				<div class="col-6">
					<select-input label="Drive type" :required="false" v-model="driveType"
								  :options="driveTypeOptions" />
				</div>
				<template v-if="driveType === DriveType.belt">
					<!-- Belt Inputs -->
					<div class="col-6">
						<select-input label="Belt preset" :required="false" v-model="beltPreset"
									  :options="beltPresetOptions" />
					</div>
					<div class="col-6">
						<number-input label="Belt pitch" :min="0.1" step="any" unit="mm" v-model="belt.pitch"
									  :preset="getPresetBeltValue('pitch') " />
					</div>
					<div class="col-6">
						<number-input label="Pulley teeth" :min="1" :step="1" v-model="belt.pulleyTeeth"
									  :preset="getPresetBeltValue('pulleyTeeth')" />
					</div>
				</template>
				<template v-else>
					<!-- Leadscrew Inputs -->
					<div class="col-6">
						<select-input label="Leadscrew preset" :required="false" v-model="leadscrewPreset"
									  :options="leadscrewPresetOptions" />
					</div>
					<div class="col-6">
						<number-input label="Lead" :min="0.01" step="any" v-model="leadscrew.lead"
									  :preset="getPresetLeadscrewValue('lead')" />
					</div>
					<div class="col-6">
						<ratio-input label="Gear ratio" v-model:first-ratio="leadscrew.ratio1" :first-preset="1"
									 :second-preset="1" v-model:second-ratio="leadscrew.ratio2" />
					</div>
				</template>
			</template>
			<template v-else-if="props.extruder">
				<!-- Extruder inputs -->
				<div :class="extruderPreset.stepsPerMm ? 'col-12' : 'col-4'">
					<select-input label="Extruder preset" :required="false" v-model="extruderPreset"
								  :options="extruderPresetOptions" />
				</div>
				<template v-if="!extruderPreset.stepsPerMm">
					<div class="col-8">
						<select-input label="Motor step angle" :required="false" v-model="stepAngle"
									  :options="stepAngleOptions" />
					</div>
					<div class="col-6">
						<number-input label="Hob diameter" :min="0.01" step="any" unit="mm"
									  v-model="extruder.hobDiameter" :preset="7" />
					</div>
					<div class="col-6">
						<ratio-input label="Gear ratio" v-model:first-ratio="extruder.ratio1" :first-preset="1"
									 v-model:second-ratio="extruder.ratio2" :second-preset="3" />
					</div>
				</template>
				<div class="col-6">
					<number-input label="Amount extruded" :min="0.01" step="any" unit="mm"
								  v-model="extruder.amountExtruded" :preset="10" />
				</div>
				<div class="col-6">
					<number-input label="Actually extruded" :min="0.01" step="any" unit="mm"
								  v-model="extruder.actuallyExtruded" :preset="10" />
				</div>
			</template>

			<div class="col-12 d-flex flex-column">
				<h4>
					Resulting steps per mm:
					<span :class="stepsPerMmValid ? 'text-success' : 'text-danger'">
						{{ stepsPerMmValid ? calculatedStepsPerMm : "error" }}
					</span>
				</h4>
				<span v-if="extruderPreset.stepsPerMm && extruderPreset.stepsPerMm !== calculatedStepsPerMm"
					  class="fs-6">
					{{ `Preset steps per mm: ${extruderPreset.stepsPerMm}` }}
				</span>
				<span v-if="presetStepsPerMm" class="fs-6 mb-2">
					{{ `Default steps per mm: ${presetStepsPerMm}` }}
				</span>
			</div>

			<div class="col mt-3 d-flex justify-content-center">
				<button type="submit" class="btn btn-success" :disabled="!stepsPerMmValid">
					<i class="bi-check-circle"></i>
					Apply
				</button>
				<button type="button" class="btn btn-danger ms-2" @click="cancel">
					<i class="bi-x-circle"></i>
					Cancel
				</button>
			</div>
		</form>
	</base-calculator>
</template>

<script lang="ts">
import { computed, reactive, ref, watch } from "vue";

import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue"
import { precise } from "@/utils";

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
const BeltPresets: Record<string, Array<BeltPreset>> = {
	Metric: [
		{
			name: "GT2",
			pitch: 2,
			pulleyTeeth: 20
		},
		{
			name: "HTD-3M",
			pitch: 3,
			pulleyTeeth: 20
		},
		{
			name: "HTD-5M",
			pitch: 5,
			pulleyTeeth: 20
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
	],
	Imperial: [
		{
			name: "MXL",
			pitch: 2.032,
			pulleyTeeth: 16
		},
		{
			name: "XL",
			pitch: 5.08,
			pulleyTeeth: 16
		}
	],
	Other: [
		{
			name: "Custom",
			pitch: null,
			pulleyTeeth: null
		}
	]
};
const beltPresetOptions: Record<string, Array<string>> = {};
for (const category in BeltPresets) {
	beltPresetOptions[category] = BeltPresets[category].map(item => item.name);
}

const belt = reactive({
	pitch: BeltPresets.Metric[0].pitch!,
	pulleyTeeth: BeltPresets.Metric[0].pulleyTeeth!
});

const beltPreset = computed({
	get() {
		for (const category in BeltPresets) {
			for (const preset of BeltPresets[category]) {
				if (preset.pitch === belt.pitch && preset.pulleyTeeth === belt.pulleyTeeth) {
					return preset.name;
				}
			}
		}
		return BeltPresets.Other[0].name;
	},
	set(value) {
		for (const category in BeltPresets) {
			const preset = BeltPresets[category].find(preset => preset.name === value);
			if (preset) {
				if (preset.pitch !== null && preset.pulleyTeeth !== null) {
					belt.pitch = preset.pitch;
					belt.pulleyTeeth = preset.pulleyTeeth;
				}
				break;
			}
		}
	}
});

function getPresetBeltValue<K extends keyof BeltPreset>(key: K) {
	for (const preset in BeltPresets) {
		const value = BeltPresets[preset].find(preset => preset.name === beltPreset.value);
		if (value) {
			return value[key];
		}
	}
	return null;
}

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
const leadscrewPresetOptions: Record<string, Array<string>> = {};
for (const category in LeadscrewPresets) {
	leadscrewPresetOptions[category] = LeadscrewPresets[category].map(item => item.name);
}

const leadscrew = reactive({
	lead: 8,
	ratio1: 1,
	ratio2: 1
});

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
});

function getPresetLeadscrewValue<K extends keyof LeadscrewPreset>(key: K) {
	for (const preset in LeadscrewPresets) {
		const value = LeadscrewPresets[preset].find(preset => preset.name === leadscrewPreset.value);
		if (value) {
			return value[key];
		}
	}
	return null;
}

// Extruders
interface ExtruderPreset {
	name: string;
	current: number;			// peak current in mA, not RMS!
	stepsPerMm: number;
}
const ExtruderPresets: Record<string, Array<ExtruderPreset>> = {
	"E3D": [
		{
			name: "Hemera",
			current: 800,
			stepsPerMm: 409
		},
		{
			name: "Hemera XS",
			current: 800,
			stepsPerMm: 397
		},
		{
			name: "Titan",
			current: 800,
			stepsPerMm: 837
		}
	],
	"Dyze Design": [
		{
			name: "DyzeXtruder-GT",
			current: 800,
			stepsPerMm: 578
		},
		{
			name: "DyzeXtruder Pro",
			current: 800,
			stepsPerMm: 582
		}
	],
	"Bondtech": [
		{
			name: "Bondtech LGX",
			current: 550,
			stepsPerMm: 400
		},
		{
			name: "Bondtech BMG",
			current: 700,
			stepsPerMm: 415
		},
		{
			name: "Bondtech LGX Lite",
			current: 550,
			stepsPerMm: 562
		}
	],
	"Other": [
		{
			name: "Custom",
			current: 0,
			stepsPerMm: 0
		}
	]
}
const extruderPresetOptions: Record<string, Array<SelectOption>> = {};
for (const category in ExtruderPresets) {
	extruderPresetOptions[category] = ExtruderPresets[category].map(item => ({
		text: item.name,
		value: item
	}));
}

const extruder = reactive({
	hobDiameter: 7,
	ratio1: 1,
	ratio2: 3,
	amountExtruded: 10,
	actuallyExtruded: 10
});
</script>

<script setup lang="ts">
import { Axis, AxisLetter, DeltaKinematics, Extruder } from "@duet3d/objectmodel";

import BaseCalculator from "./BaseCalculator.vue";
import NumberInput from "@/components/inputs/NumberInput.vue"
import RatioInput from "@/components/inputs/RatioInput.vue"

import { useStore } from "@/store";

const props = defineProps<{
	axis?: Axis
	extruder?: Extruder,
	index: number
}>();

const store = useStore();

const calculator = ref<typeof BaseCalculator | null>(null);

// Axes
const driveType = ref((store.data.move.kinematics instanceof DeltaKinematics || (!props.axis || props.axis.letter !== AxisLetter.Z)) ? DriveType.belt : DriveType.leadscrew);

// Extruders
const extruderPreset = ref(ExtruderPresets.Other[0]);
let current = 800;
watch(extruderPreset, (value) => {
	if (value.current && props.extruder) {
		// Update extruder current when the preset changes
		props.extruder.current = value.current;
	}
});
function onShow() {
	if (props.extruder) {
		current = props.extruder.current;

		for (const category in ExtruderPresets) {
			for (const preset of ExtruderPresets[category]) {
				if (props.extruder.stepsPerMm === preset.stepsPerMm && props.extruder.current === preset.current) {
					extruderPreset.value = preset;
					return;
				}
			}
		}
		extruderPreset.value = ExtruderPresets.Other[0];
	}
}
function onHide() {
	if (props.extruder) {
		props.extruder.current = current;
	}
}

// Global
const stepsPerMm = computed<number>({
	get() { return (props.axis?.stepsPerMm ?? props.extruder?.stepsPerMm) ?? 0; },
	set(value) {
		if (props.axis) {
			props.axis.stepsPerMm = value;
		} else if (props.extruder) {
			props.extruder.stepsPerMm = value;
		}
	}
});
const presetStepsPerMm = computed<number | null>(() => {
	if (props.axis !== undefined && props.index < store.preset.move.axes.length) {
		return store.preset.move.axes[props.index].stepsPerMm;
	}
	if (props.extruder !== undefined && props.index < store.preset.move.extruders.length) {
		return store.preset.move.extruders[props.index].stepsPerMm;
	}
	return null;
});

const calculatedStepsPerMm = computed(() => {
	if (props.axis) {
		switch (driveType.value) {
			case DriveType.belt:
				return precise((360 * props.axis.microstepping.value) / (belt.pulleyTeeth * belt.pitch * stepAngle.value), 2);
			case DriveType.leadscrew:
				const leadscrewRatio = leadscrew.ratio2 / leadscrew.ratio1;
				return precise((360.0 * props.axis.microstepping.value * leadscrewRatio) / (leadscrew.lead * stepAngle.value), 2);
			default:
				const _exhaustiveCheck: never = driveType.value;
				break;
		}
	}
	if (props.extruder) {
		let stepsPerMm = extruderPreset.value.stepsPerMm;
		if (stepsPerMm <= 0) {
			const gearsRatio = extruder.ratio2 / extruder.ratio1;
			stepsPerMm = (360.0 * props.extruder.microstepping.value * gearsRatio) / (extruder.hobDiameter * stepAngle.value * Math.PI);
		}
		return precise(stepsPerMm * (extruder.amountExtruded / extruder.actuallyExtruded), 2);
	}
	return NaN;
});
const stepsPerMmValid = computed(() => isFinite(calculatedStepsPerMm.value));

// Apply/Cancel
function apply() {
	if (extruderPreset.value.current) {
		current = extruderPreset.value.current;
	}
	stepsPerMm.value = calculatedStepsPerMm.value;
	calculator.value?.hide(true);
}

function cancel() {
	calculator.value?.hide(true);
}
</script>
