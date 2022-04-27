<template>
	<label v-if="props.label" :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<div class="input-group">
		<input :id="id" class="form-control" :class="validationClass" type="text" v-bind="$attrs"
			   :required="props.required" :min="props.min" :max="props.max" :value="props.modelValue"
			   :data-unit="unit" v-preset="props.preset"
			   @input="onInput">
		<span v-if="!!props.unit" class="input-group-text">
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
	label?: string,
	min?: number,
	max?: number,
	modelValue: number,
	preset: number,
	required?: boolean,
	unit?: string
}
const props = withDefaults(defineProps<NumberInputProps>(), {
	required: true
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: number): void
}>();

// Display converters
const id = `number-${++numInstances}`;

// Validation
const validationClass = computed<string | null>(() => {
	if (props.required) {
		return (!isNaN(props.modelValue) && isFinite(props.modelValue) &&
				(props.min === undefined || props.modelValue >= props.min) &&
				(props.max === undefined || props.modelValue <= props.max)) ? "is-valid" : "is-invalid";
	}
	return null;
})

// Update event
const onInput = (e: Event) => {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:modelValue", value);
	}
};
</script>
