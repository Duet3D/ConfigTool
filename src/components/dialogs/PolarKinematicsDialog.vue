<template>
	<base-dialog title="Advanced Polar Kinematics Settings"
	             :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
		<div v-if="polarKinematics" class="row">
			<!--
			Segments per second (because smooth XY motion is approximated by means of segmentation)
			Minimum segment length (mm) (because smooth XY motion is approximated by means of segmentation)
			-->
		</div>
		<div v-else class="text-danger">
			error, no delta kinematics selected
		</div>
	</base-dialog>
</template>

<script setup lang="ts">
import { PolarKinematics } from "@duet3d/objectmodel";
import { computed } from "vue";

import BaseDialog from "./BaseDialog.vue";
//import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";

const props = defineProps<{
	modelValue: boolean
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

const store = useStore();
const polarKinematics = computed(() => (store.data.move.kinematics instanceof PolarKinematics) ? store.data.move.kinematics : null);
</script>
