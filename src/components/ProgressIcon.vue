<template>
    <i v-if="props.modelValue !== null" class="bi" :class="classValue"></i>
</template>

<script lang="ts">
export enum ProgressState {
    "busy",
    "error",
    "ready"
};
</script>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    modelValue: ProgressState | null
}>();

const classValue = computed(() => {
    switch (props.modelValue) {
        case ProgressState.busy: return "bi-hourglass";
        case ProgressState.error: return "bi-x text-danger";
        case ProgressState.ready: return "bi-check text-success";
    }
    return "";
})
</script>
