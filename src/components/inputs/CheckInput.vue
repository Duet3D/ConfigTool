<template>
	<div class="form-check" v-preset="props.preset">
		<input :id="id" class="form-check-input" type="checkbox" v-bind="$attrs"
		       :checked="props.modelValue" @input="onInput">
		<label :for="id" class="form-check-label">
			{{ label }}
			<slot name="append"></slot>
		</label>
	</div>
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
// External interface
const props = defineProps<{
	/**
	 * Optional label next to the control
	 */
	label: string,

	/**
	 * Current value
	 */
	modelValue: boolean,

	/**
	 * Preset value (if applicable)
	 */
	preset?: boolean | null
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

// Display converters
const id = `check-${++numInstances}`;

// Update event
const onInput = (e: Event) => {
	if (e.target !== null) {
		const value = (e.target as HTMLInputElement).checked;
		emit("update:modelValue", !!value);
	}
};
</script>
