<template>
	<base-dialog title="Advanced Delta Kinematics Settings" :model-value="props.modelValue"
				 @update:model-value="emit('update:modelValue', $event)">
		<div v-if="deltaKinematics">
			<table class="table table-striped table-bordered table-advanced-delta">
				<thead>
					<tr>
						<th class="text-center">
							Tower
						</th>
						<th>
							Diagonal Rod Length
						</th>
						<th>
							Endstop Adjustment
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(tower, index) in deltaKinematics.towers">
						<td class="text-center align-middle">
							{{ getTowerCaption(index) }}
						</td>
						<td>
							<number-input title="Diagonal rod length of this tower" :min="1" :step="0.001" unit="mm"
										  v-model="tower.diagonal" :preset="getPresetTower(index)?.diagonal" />
						</td>
						<td>
							<number-input title="Endstop adjustment of this tower" :step="0.001" unit="mm"
										  v-model="tower.endstopAdjustment"
										  :preset="getPresetTower(index)?.endstopAdjustment" />
						</td>
					</tr>
				</tbody>
			</table>

			<div class="row">
				<div class="col">
					<number-input label="X Tilt" title="Tilt of the printer in X direction" :step="0.1" :factor="0.01"
								  unit="%" v-model="deltaKinematics.xTilt" :preset="presetDeltaKinematics?.xTilt" />
				</div>
				<div class="col">
					<number-input label="Y Tilt" title="Tilt of the printer in Y direction" :step="0.1" :factor="0.01"
								  unit="%" v-model="deltaKinematics.yTilt" :preset="presetDeltaKinematics?.yTilt" />
				</div>
			</div>

			<!-- TODO segmentation -->
		</div>
		<div v-else class="text-danger">
			error, no delta kinematics selected
		</div>
	</base-dialog>
</template>

<script setup lang="ts">
import { DeltaKinematics, type DeltaTower } from "@duet3d/objectmodel";
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
const presetDeltaKinematics = computed(() => (store.preset.move.kinematics instanceof DeltaKinematics) ? store.preset.move.kinematics : null);

function getTowerCaption(index: number): string {
	switch (index) {
		case 0: return "A (X)";
		case 1: return "B (Y)";
		case 2: return "C (Z)";
		default: return "n/a";
	}
}

function getPresetTower(index: number): DeltaTower | null {
	if (store.preset.move.kinematics instanceof DeltaKinematics && index < store.preset.move.kinematics.towers.length) {
		return store.preset.move.kinematics.towers[index];
	}
	return null;
}
</script>
