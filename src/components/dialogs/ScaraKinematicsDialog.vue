<template>
	<base-dialog title="Advanced SCARA Kinematics Settings"
	             :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
		<div v-if="deltaKinematics" class="row">
			TODO: Crosstalk factors (3x), minimum permitted printing radius from the proximal axis, min segment length, max segments per second, XY offsets from proximal joint
			For Fivebar: define the print area as rectangle
		</div>
		<div v-else class="text-danger">
			error, no delta kinematics selected
		</div>
	</base-dialog>
</template>

<script setup lang="ts">
import { DeltaKinematics } from "@duet3d/objectmodel";
import { computed } from "vue";

import BaseDialog from "./BaseDialog.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";

const props = defineProps<{
	modelValue: boolean
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

const store = useStore();
const deltaKinematics = computed(() => (store.data.move.kinematics instanceof DeltaKinematics) ? store.data.move.kinematics : null);
</script>
