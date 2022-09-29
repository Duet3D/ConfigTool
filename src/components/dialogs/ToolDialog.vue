<template>
	<base-dialog :title="`Advanced Settings for Tool ${toolName}`" :model-value="props.modelValue"
				 @update:model-value="emit('update:modelValue', $event)">
		<div v-if="tool" class="row">
			<!-- TODO XY axis mapping, heater feedforward,  -->
			<div class="col-12">
				Axis Offsets:
				<div v-for="(axis, index) in store.data.move.axes" class="row mt-2">
					<label class="col-sm-auto col-form-label">
						{{ axis.letter }}:
					</label>
					<div class="col-sm">
						<number-input :title="`${axis.letter} axis offset`" :model-value="getOffset(index)"
									  @update:model-value="setOffset(index, $event)" :step="0.001" unit="mm" />
					</div>
				</div>
			</div>
		</div>
		<div v-else class="text-danger">
			error, no tool selected
		</div>
	</base-dialog>
</template>

<script setup lang="ts">
import type { Tool } from "@duet3d/objectmodel";
import { computed } from "vue";

import BaseDialog from "./BaseDialog.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";

const props = defineProps<{
	modelValue: boolean,
	tool: Tool | null
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
}>();

const store = useStore();

const toolName = computed(() => props.tool ? (props.tool.name ? props.tool.name : `#${props.tool.number}`) : "n/a");

// Tool Offset
function getOffset(index: number) {
	return (props.tool !== null && index < props.tool.offsets.length) ? props.tool.offsets[index] : 0;
}

function setOffset(index: number, value: number) {
	if (props.tool !== null) {
		while (index >= props.tool.offsets.length) {
			props.tool.offsets.push(0);
		}
		props.tool.offsets[index] = value;
	}
}
</script>
