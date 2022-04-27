<template>
	<label :for="id" class="form-label">
		{{ props.label }}:
	</label>
	<select :id="id" class="form-select" :class="validationClass" v-bind="$attrs" v-preset="props.preset"
	        :value="props.modelValue" @input="onInput" :required="props.required">
		<template v-if="isGrouped">
			<optgroup v-for="(group, groupTitle) in groups" :disabled="isGroupDisabled(group)" :label="groupTitle">
				<option v-for="groupItem in group" :disabled="getItemDisabled(groupItem)" :value="getItemValue(groupItem)">
					{{ getItemText(groupItem) }}
				</option>
			</optgroup>
		</template>
		<template v-else>
			<option v-for="item in items" :value="getItemValue(item)">
				{{ getItemText(item) }}
			</option>
		</template>
	</select>
</template>

<script lang="ts">
// Need a global variable to keep generating unique select IDs
let numInstances = 0;

export interface SelectOption {
	disabled?: boolean,
	text: string,
	value: string
}
</script>

<script setup lang="ts">
import { computed } from "vue";

// External interface
interface SelectProps {
	label: string,
	modelValue: string,
	options: Array<string | SelectOption> | Record<string, Array<string | SelectOption>>,
	preset: string,
	required?: boolean
}
const props = withDefaults(defineProps<SelectProps>(), {
	required: true
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>();

// Display converters
const id = `select-${++numInstances}`;

const isGrouped = computed(() => !(props.options instanceof Array));
const groups = props.options as Record<string, Array<string | SelectOption>>, items = props.options as Array<string | SelectOption>;
const isGroupDisabled = (group: Array<string | SelectOption>) => group.every(item => typeof item !== "string" && !!item.disabled);

const getItemDisabled = (item: string | SelectOption) => (typeof item !== "string") && !!item.disabled;
const getItemText = (item: string | SelectOption) => (typeof item === "string") ? item : item.text;
const getItemValue = (item: string | SelectOption) => (typeof item === "string") ? item : item.value;

// Validation
const validationClass = computed<string | null>(() => {
	if (props.required) {
		if (!(props.options instanceof Array)) {
			// Current value must be part of a group item
			return Object.values(props.options).some(group => group.some(groupItem => {
				return (typeof groupItem === "string") ? groupItem === props.modelValue : groupItem.value === props.modelValue;
			})) ? "is-valid" : "is-invalid";
		} else
			// Current value must be part of the items
			return props.options.some(item => typeof item === "string" ? item === props.modelValue : item.value === props.modelValue) ? "is-valid" : "is-invalid";
	}
	return null;
})

// Update event
const onInput = (e: Event) => {
	if (e.target !== null) {
		emit("update:modelValue", (e.target as HTMLSelectElement).value);
	}
};
</script>
