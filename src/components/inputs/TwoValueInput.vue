<template>
	<label v-if="label" :for="id" class="form-label">
		{{ twoValues ? pluralLabel : label }}:
	</label>
	<div class="input-group">
		<button type="button" class="btn" :class="twoValues ? 'btn-primary' : 'btn-outline-secondary'"
				v-title="toggleTitle" @click.prevent="twoValues = !twoValues">
			x2
		</button>
		<input :id="id" class="form-control" :class="firstValidationClass" type="number" required :min="min" :max="max"
			   :step="step" :value="values.length > 0 ? values[0] : NaN" v-preset="firstPreset" :data-unit="unit"
			   :title="firstTitle" @input="onFirstInput">
		<template v-if="twoValues">
			<span class="input-group-text">
				/
			</span>
			<input class="form-control" :class="secondValidationClass" type="number" required :min="min" :max="max"
				   :step="step" :value="values.length > 1 ? values[1] : NaN" v-preset="secondPreset" :data-unit="unit"
				   :title="secondTitle" @input="onSecondInput">
		</template>
		<span class="input-group-text">
			{{ unit }}
		</span>
	</div>
</template>

<script lang="ts">
// Need a global variable to keep generating unique input IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

// External interface
const props = withDefaults(defineProps<{
	/**
	 * Numeric values to edit (first value and optional second value)
	 */
	values: Array<number>;

	/**
	 * Presets for the values
	 */
	preset?: Array<number> | null;

	/**
	 * Whether the bound array always holds two elements. In that case the x2 toggle only controls whether the
	 * second value is edited separately; when disabled, the second value tracks the first. When false, the toggle
	 * adds or removes the second array element
	 */
	fixedLength?: boolean;

	/**
	 * Label shown while a single value is active. No label is rendered if omitted
	 */
	label?: string;

	/**
	 * Label shown while two values are active (defaults to the single-value label)
	 */
	labelPlural?: string;

	/**
	 * Unit suffix
	 */
	unit?: string;

	/**
	 * Minimum allowed value
	 */
	min?: number;

	/**
	 * Maximum allowed value
	 */
	max?: number;

	/**
	 * Step size
	 */
	step?: number | string;

	/**
	 * Whether values must be greater than zero to be considered valid
	 */
	positive?: boolean;

	/**
	 * Tooltip for the x2 toggle button
	 */
	toggleTitle?: string;

	/**
	 * Tooltip for the first input
	 */
	firstTitle?: string;

	/**
	 * Tooltip for the second input
	 */
	secondTitle?: string;
}>(), {
	fixedLength: false,
	unit: "mm/s",
	min: 0.1,
	step: "any",
	positive: true
});

// Display converters
const id = `two-value-input-${++numInstances}`;
const pluralLabel = computed(() => props.labelPlural ?? props.label);

// x2 functionality
const distinctSecondValue = ref(props.fixedLength && props.values.length > 1 && props.values[1] !== props.values[0]);
if (props.fixedLength) {
	// Latch the toggle on when an externally loaded config brings in a distinct second value
	watch(() => props.values.length > 1 && props.values[1] !== props.values[0], (distinct) => {
		if (distinct) {
			distinctSecondValue.value = true;
		}
	});
}
const twoValues = computed<boolean>({
	get: () => props.fixedLength ? distinctSecondValue.value : props.values.length > 1,
	set(value) {
		if (props.fixedLength) {
			distinctSecondValue.value = value;
			if (!value && props.values.length > 1) {
				props.values[1] = props.values[0];
			}
		} else if (value) {
			if (props.values.length === 1) {
				props.values.push(props.values[0]);
			}
		} else if (props.values.length > 1) {
			props.values.splice(1, props.values.length - 1);
		}
	}
});

// Validation
function isValid(value: number): boolean {
	return !isNaN(value) && isFinite(value) && (!props.positive || value > 0);
}
const firstPreset = computed<number | undefined>(() => (props.preset && props.preset.length > 0) ? props.preset![0] : undefined);
const firstValidationClass = computed<string | null>(() => (props.values.length > 0 && isValid(props.values[0])) ? "is-valid" : "is-invalid");
const secondPreset = computed<number | undefined>(() => (props.preset && props.preset.length > 1) ? props.preset![1] : firstPreset.value);
const secondValidationClass = computed<string | null>(() => (props.values.length > 1 && isValid(props.values[1])) ? "is-valid" : "is-invalid");

// Update events
function onFirstInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);

		// Update first value
		if (props.values.length > 0) {
			props.values[0] = value;
		} else {
			props.values.push(value);
		}

		// Keep the second value in sync unless the toggle is enabled
		if (!twoValues.value) {
			if (props.values.length > 1) {
				props.values[1] = value;
			} else {
				props.values.push(value);
			}
		}
	}
}
function onSecondInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);

		// Make sure there is a first value
		if (props.values.length === 0) {
			props.values.push(value);
		}

		// Update second value
		if (props.values.length === 1) {
			props.values.push(value);
		} else {
			props.values[1] = value;
		}
	}
}
</script>
