<style scoped>
.table-advanced-delta tr > th:first-child {
	text-align: center;
}
.table-advanced-delta tr > td:first-child {
	text-align: center;
	vertical-align: middle;
}
</style>

<template>
	<base-dialog title="Advanced Delta Kinematics Settings"
	             :model-value="props.modelValue" @update:model-value="emit('update:modelValue', $event)">
		<div v-if="deltaKinematics">
			<table class="table table-striped table-bordered table-advanced-delta">
				<thead>
					<tr>
						<th>
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
						<td>
							{{ getTowerCaption(index) }}
						</td>
						<td>
							<number-input title="Diagonal rod length of this tower"
							              :min="1" step="any" unit="mm"
							              v-model="tower.diagonal" :preset="getPresetTower(index)?.diagonal" />
						</td>
						<td>
							<number-input title="Endstop adjustment of this tower"
							              step="any" unit="mm"
							              v-model="tower.endstopAdjustment" :preset="getPresetTower(index)?.endstopAdjustment" />
						</td>
					</tr>
				</tbody>
			</table>

			<div class="row">
				<div class="col">
					<number-input label="X Tilt" title="Tilt of the printer in X direction"
					              step="any" unit="%"
					              v-model="deltaKinematics.xTilt" :preset="presetDeltaKinematics?.xTilt" />
				</div>
				<div class="col">
					<number-input label="Y Tilt" title="Tilt of the printer in Y direction"
					              step="any" unit="%"
					              v-model="deltaKinematics.yTilt" :preset="presetDeltaKinematics?.yTilt" />
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
