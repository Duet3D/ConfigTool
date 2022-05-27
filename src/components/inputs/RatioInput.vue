<template>
	<label :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<div class="input-group">
		<input :id="id" class="form-control" :class="firstValidationClass" type="number"
			   required :min="0.00001" step="any"
			   :value="props.firstRatio" @input="onFirstInput">
		<span class="input-group-text">
			:
		</span>
		<input class="form-control" :class="secondValidationClass" type="number"
		       required :min="0.00001" step="any"
		       :value="props.secondRatio" @input="onSecondInput">
	</div>
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { computed } from "vue";

// External interface
interface RadioInputProps {
	/**
	 * Label next to the control
	 */
	label: string,

	/**
	 * First ratio value
	 */
	firstRatio: number,

	/**
	 * Second ratio value
	 */
	secondRatio: number
}
const props = defineProps<RadioInputProps>();

const emit = defineEmits<{
	(e: 'update:firstRatio', value: number): void
	(e: 'update:secondRatio', value: number): void
}>();

// Display converters
const id = `ratio-${++numInstances}`;

// Validation
const firstValidationClass = computed<string | null>(() => {
	return (!isNaN(props.firstRatio) && isFinite(props.firstRatio) && props.firstRatio > 0) ? "is-valid" : "is-invalid";
});
const secondValidationClass = computed<string | null>(() => {
	return (!isNaN(props.secondRatio) && isFinite(props.secondRatio) && props.secondRatio > 0) ? "is-valid" : "is-invalid";
})

// Update event
function onFirstInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:firstRatio", value);
	}
}
function onSecondInput(e: Event) {
	if (e.target !== null) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		emit("update:secondRatio", value);
	}
}
</script>
