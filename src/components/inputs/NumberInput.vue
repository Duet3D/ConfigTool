<template>
	<label v-if="props.label" :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<div class="input-group">
		<input :id="id" class="form-control" :class="validationClass" type="number" v-bind="$attrs"
			   :required="props.required" :min="props.min" :max="props.max" :step="props.step"
			   :value="props.modelValue" :data-unit="unit" v-preset="props.preset"
			   @input="onInput" @change="onChange">
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
interface NumberInputProps {
	hideUnit?: boolean,
	label?: string,
	lazy?: boolean,
	min?: number,
	max?: number,
	modelValue: number,
	preset?: number | null,
	required?: boolean,
	step?: number | "any",
	unit?: string,
	valid?: boolean
}
const props = withDefaults(defineProps<NumberInputProps>(), {
	hideUnit: false,
	lazy: false,
	required: true,
	valid: true
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: number): void
}>();

// Display converters
const id = `number-${++numInstances}`;

// Validation
const validationClass = computed<string | null>(() => {
	if (props.required) {
		return (props.valid &&
				!isNaN(props.modelValue) && isFinite(props.modelValue) &&
				(props.min === undefined || props.modelValue >= props.min) &&
				(props.max === undefined || props.modelValue <= props.max)) ? "is-valid" : "is-invalid";
	}
	return null;
})

// Update event
function onInput(e: Event) {
	if (e.target !== null && !props.lazy) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:modelValue", value);
	}
}
function onChange(e: Event) {
	if (e.target !== null && props.lazy) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:modelValue", value);
	}
}
</script>
