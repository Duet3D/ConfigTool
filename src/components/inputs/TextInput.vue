<template>
	<label :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<input :id="id" class="form-control" :class="validationClass" type="text" v-bind="$attrs"
	       :required="props.required" :maxlength="props.maxLength - 1" :value="props.modelValue" v-preset="props.preset"
	       @input="onInput">
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;
</script>

<script setup lang="ts">
import { computed } from "vue";

// External interface
interface TextInputProps {
	label: string,
	modelValue: string,
	preset?: string | null,
	maxLength: number,
	required?: boolean
}
const props = withDefaults(defineProps<TextInputProps>(), {
	required: true
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>();

// Display converters
const id = `text-${++numInstances}`;

// Validation
const validationClass = computed<string | null>(() => {
	if (props.required) {
		return (props.modelValue.trim() !== "") ? "is-valid" : "is-invalid";
	}
	return null;
})

// Update event
const onInput = (e: Event) => {
	if (e.target !== null) {
		emit("update:modelValue", (e.target as HTMLInputElement).value.trim());
	}
};
</script>
