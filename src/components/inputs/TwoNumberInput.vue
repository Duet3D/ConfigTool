<template>
	<label v-if="props.firstLabel && props.secondLabel" :for="id" class="form-label">
		{{ setTwoNumbers ? props.secondLabel : props.firstLabel }}:
	</label>
	<div class="input-group">
		<button type="button" class="btn" :class="setTwoNumbers ? 'btn-primary' : 'btn-outline-secondary'"
				:disabled="disabled" v-title="props.buttonTitle" @click.prevent="setTwoNumbers = !setTwoNumbers">
			<slot name="button" />
		</button>
		<input :id="id" class="form-control" :class="props.disabled ? '' : (isFinite(props.firstValue!) ? 'is-valid' : 'is-invalid')"
			   type="number" :disabled="disabled" required :min="props.min"
			   :max="(!props.disabled && props.isRange && setTwoNumbers) ? props.secondValue! : props.max" :step="props.step"
			   :value="props.firstValue ?? null" v-preset="firstPreset" :data-unit="props.unit" :title="props.firstTitle"
			   @input="onFirstInput">
		<template v-if="setTwoNumbers">
			<span class="input-group-text">
				<slot name="separator" />
			</span>
			<input class="form-control" :class="props.disabled ? '' : (isFinite(props.secondValue!) ? 'is-valid' : 'is-invalid')" type="number"
				   required :disabled="disabled" :min="(!props.disabled && props.isRange) ? props.firstValue! : props.min" :max="props.max"
				   :step="props.step" :value="props.secondValue ?? null" v-preset="secondPreset" :data-unit="props.unit"
				   :title="props.secondTitle" @input="onSecondInput">
		</template>
		<span v-if="props.unit" class="input-group-text">
			<slot name="unit">
				{{ props.unit }}
			</slot>
		</span>
	</div>
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { computed, ref } from "vue";

// External interface
interface TwoNumberInputProps {
	/**
	 * First numeric value. May be set to null when disabled
	 */
	firstValue: number | null;

	/**
	 * Second numeric value. May be set to null when disabled
	 */
	secondValue: number | null;

	/**
	 * First presets
	 */
	firstPreset?: number | null;

	/**
	 * Second preset
	 */
	secondPreset?: number | null;

	/**
	 * Title of the toggle button
	 */
	buttonTitle: string;

	/**
	 * First label if only one value is configured
	 */
	firstLabel: string;

	/**
	 * Second label if two values are configured
	 */
	secondLabel: string;

	/**
	 * Title of the first input
	 */
	firstTitle?: string;

	/**
	 * Title of the second input
	 */
	secondTitle?: string;

	/**
	 * Whether this control is enabled
	 */
	disabled?: boolean;

	/**
	 * Minimm input value
	 */
	min: number;

	/**
	 * Maximum input value
	 */
	max: number;

	/**
	 * Step value
	 */
	step: number | "any";

	/**
	 * Whether this input is meant for a range
	 */
	isRange: boolean;

	/**
	 * Unit of this input
	 */
	unit?: string;
}

const props = withDefaults(defineProps<TwoNumberInputProps>(), {
	disabled: false,
	isRange: false
});
const emit = defineEmits<{
	(e: 'update:firstValue', value: number | null): void,
	(e: 'update:secondValue', value: number | null): void
}>();

// Display converters
const id = `two-number-input-${++numInstances}`;

// Second input functionality
let setTwoNumbersValue = ref(props.firstValue !== props.secondValue);
const setTwoNumbers = computed<boolean>({
	get: () => setTwoNumbersValue.value,
	set(value) {
		if (!value) {
			emit("update:secondValue", props.firstValue);
		}
		setTwoNumbersValue.value = value;
	}
});

// Update event
function onFirstInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:firstValue", value);
		if (!setTwoNumbers.value) {
			emit("update:secondValue", value);
		}
	}
}
function onSecondInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:secondValue", value);
	}
}
</script>
