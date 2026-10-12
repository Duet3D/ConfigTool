<template>
	<base-dialog title="Advanced Hangprinter Kinematics Settings"
	             :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
		<div v-if="hangprinterKinematics">
			<segmentation-input />
		</div>
		<div v-else class="text-danger">
			error, no hangprinter kinematics selected
		</div>
	</base-dialog>
</template>

<script setup lang="ts">
import { HangprinterKinematics } from "@duet3d/objectmodel";
import { computed } from "vue";

import BaseDialog from "./BaseDialog.vue";
import SegmentationInput from "@/components/inputs/SegmentationInput.vue";

import { useStore } from "@/store";

const props = defineProps<{
	modelValue: boolean
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

const store = useStore();
const hangprinterKinematics = computed(() => (store.data.move.kinematics instanceof HangprinterKinematics) ? store.data.move.kinematics : null);
//const presetHangprinterKinematics = computed(() => (store.preset.move.kinematics instanceof HangprinterKinematics) ? store.preset.move.kinematics : null);
</script>
