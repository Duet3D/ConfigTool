<template>
	<label v-if="props.label" :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<div class="input-group" :class="props.small ? 'input-group-sm' : ''">
		<slot name="prepend" />
		<input type="number" :id="id" class="form-control" :class="validationClass" v-bind="$attrs" :min="props.min"
			   :max="props.max" :step="props.step" :disabled="props.disabled" :required="props.required"
			   :data-unit="unit" v-preset="(props.preset != null) ? props.preset * props.factor : null"
			   :value="props.modelValue * props.factor" @change="onChange" @input="onInput">
		<span v-if="!!props.unit && !props.hideUnit" class="input-group-text">
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
import { computed } from "vue";

// External interface
export interface NumberInputProps {
	/**
	 * Optional label next to the control
	 */
	label?: string,

	/**
	 * Make this component small
	 */
	small?: boolean,

	/**
	 * Update value on change, not on input (defaults to false)
	 */
	lazy?: boolean,

	/**
	 * Minimum value
	 */
	min?: number,

	/**
	 * Maximum value
	 */
	max?: number,

	/**
	 * Optional multiplier for the model value
	 */
	factor?: number,

	/**
	 * Current value
	 */
	modelValue: number,

	/**
	 * Preset value (if applicable)
	 */
	preset?: number | null,

	/**
	 * Disable this control (defaults to false)
	 */
	disabled?: boolean,

	/**
	 * Enable value checking (enabled by default)
	 */
	required?: boolean,

	/**
	 * Optional validity value (may be overridden if the value is not a number)
	 */
	valid?: boolean,

	/**
	 * Step size (e.g. for up/down controls)
	 */
	step?: number | "any",

	/**
	 * Unit type (e.g. mm)
	 */
	unit?: string,

	/**
	 * Hide unit suffix from text input but display it in the tooltip
	 */
	hideUnit?: boolean
}
const props = withDefaults(defineProps<NumberInputProps>(), {
	lazy: false,
	factor: 1,
	disabled: false,
	required: true,
	valid: true,
	hideUnit: false
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: number): void
}>();

// Display converters
const id = `number-${++numInstances}`;

// Validation
const validationClass = computed<string | null>(() => {
	if (!props.disabled && props.required) {
		return (props.valid &&
				!isNaN(props.modelValue) && isFinite(props.modelValue) &&
				(props.min === undefined || props.modelValue * props.factor >= props.min) &&
				(props.max === undefined || props.modelValue * props.factor <= props.max)) ? "is-valid" : "is-invalid";
	}
	return null;
})

// Update event
function onChange(e: Event) {
	if (e.target !== null && props.lazy) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:modelValue", value / props.factor);
	}
}
function onInput(e: Event) {
	if (e.target !== null && !props.lazy) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:modelValue", value / props.factor);
	}
}
</script>
