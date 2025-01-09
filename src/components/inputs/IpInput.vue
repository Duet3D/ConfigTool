<template>
	<label v-if="props.label" :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<input type="text" :id="id" class="form-control" :class="validationClass" v-bind="$attrs" maxlength="15"
		   v-preset="props.preset" :disabled="props.disabled" :required="props.required" :value="props.modelValue"
		   @change="onChange" @input="onInput">
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { computed } from "vue";

// External interface
const props = withDefaults(defineProps<{
	/**
	 * Optional label next to the control
	 */
	label?: string,

	/**
	 * Update value on change, not on input (defaults to false)
	 */
	lazy?: boolean,

	/**
	 * Indicates if the value is a subnet mask
	 */
	netMask?: boolean,

	/**
	 * Current value
	 */
	modelValue: string,

	/**
	 * Preset value (if applicable)
	 */
	preset?: string | null,

	/**
	 * Disable this control (defaults to false)
	 */
	disabled?: boolean,

	/**
	 * Enable value checking (enabled by default)
	 */
	required?: boolean
}>(), {
	lazy: false,
	netMask: false,
	disabled: false,
	required: true
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>();

// Display converters
const id = `ip-${++numInstances}`;

// Validation
const validationClass = computed<string | null>(() => {
	if (!props.disabled && props.required) {
		const matches = /^(\d\d?\d?)\.(\d\d?\d?)\.(\d\d?\d?)\.(\d\d?\d?)$/.exec(props.modelValue.trim()), max = props.netMask ? 256 : 255;
		return (matches && parseInt(matches[1]) < max && parseInt(matches[2]) < max && parseInt(matches[3]) < max && parseInt(matches[4]) < max) ? "is-valid" : "is-invalid";
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
