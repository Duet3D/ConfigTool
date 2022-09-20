<template>
	<label v-if="props.label" :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<input type="text" :id="id" class="form-control" :class="validationClass" v-bind="$attrs"
	       :maxlength="props.maxLength - 1"
	       v-preset="props.preset"
	       :disabled="props.disabled" :required="props.required"
	       :value="props.modelValue" @change="onChange" @input="onInput">
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { computed } from "vue";

// External interface
interface TextInputProps {
	/**
	 * Optional label next to the control
	 */
	label?: string,

	/**
	 * Update value on change, not on input (defaults to false)
	 */
	lazy?: boolean,

	/**
	 * Current value
	 */
	modelValue: string,

	/**
	 * Preset value (if applicable)
	 */
	preset?: string | null,

	/**
	 * Maximum text length
	 */
	maxLength: number,

	/**
	 * Disable this control (defaults to false)
	 */
	disabled?: boolean,

	/**
	 * Enable value checking (enabled by default)
	 */
	required?: boolean
}
const props = withDefaults(defineProps<TextInputProps>(), {
	disabled: false,
	required: true
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>();

// Display converters
const id = `text-${++numInstances}`;

// Validation
const validationClass = computed<string | null>(() => {
	if (!props.disabled && props.required) {
		return (props.modelValue.trim() !== "") ? "is-valid" : "is-invalid";
	}
	return null;
})

// Update event
function onChange(e: Event) {
	if (e.target !== null && props.lazy) {
		emit("update:modelValue", (e.target as HTMLInputElement).value.trim());
	}
}
function onInput(e: Event) {
	if (e.target !== null && !props.lazy) {
		emit("update:modelValue", (e.target as HTMLInputElement).value.trim());
	}
}
</script>
