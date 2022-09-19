<template>
    <number-input :model-value="props.modelValue ?? props.defaultValue" @update:model-value="emit('update:modelValue', $event)" :disabled="props.modelValue === null">
        <template #prepend>
            <div class="input-group-text" v-title="'Check this to configure this option'">
                <input class="form-check-input mt-0" type="checkbox" :checked="props.modelValue !== null" @input="onInput">
            </div>
        </template>
    </number-input>
</template>

<script setup lang="ts">
import NumberInput, { type NumberInputProps } from './NumberInput.vue';

interface OptionalNumberInputProps {
    modelValue: number | null,
    defaultValue?: number
}

const props = withDefaults(defineProps<OptionalNumberInputProps>(), {
    defaultValue: NaN
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: number | null): void
}>();

function onInput(e: Event) {
    emit('update:modelValue', (e.target as HTMLInputElement).checked ? props.defaultValue : null);
}
</script>