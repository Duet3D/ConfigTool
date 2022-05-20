<template>
	<base-dialog title="Advanced Core Kinematics Settings"
	             :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
		<div v-if="coreKinematics" class="row">
			<div class="col-12">
				Forward Matrix:
				<table class="table table-bordered mt-1">
					<tbody>
						<tr v-for="mRow in coreKinematics.forwardMatrix">
							<td v-for="(_, index) in mRow">
								<number-input step="any" v-model="mRow[index]" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="col-12">
				Inverse Matrix:
				<table class="table table-bordered mt-1">
					<tbody>
						<tr v-for="mRow in coreKinematics.inverseMatrix">
							<td v-for="(_, index) in mRow">
								<number-input step="any" v-model="mRow[index]" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- TODO segmentation -->
		</div>
		<div v-else class="text-danger">
			error, no core kinematics selected
		</div>
	</base-dialog>
</template>

<script setup lang="ts">
import { CoreKinematics } from "@duet3d/objectmodel";
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
const coreKinematics = computed(() => (store.data.move.kinematics instanceof CoreKinematics) ? store.data.move.kinematics : null);
</script>
