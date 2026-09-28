<template>
	<div class="row g-3">
		<div class="col-12">
			<check-input label="Segment moves"
						 title="Split moves into segments so that pausing and extrusion factor changes (M221) take effect sooner (M669 S/T)"
						 :model-value="segmentation !== null" @update:model-value="setSegmentation($event)"
						 :preset="(presetSegmentation ?? null) !== null" />
		</div>
		<template v-if="segmentation !== null">
			<div class="col-6">
				<number-input label="Segments per second" title="Maximum number of segments per second"
							  v-model="segmentation.segmentsPerSec" :preset="presetSegmentation?.segmentsPerSec"
							  :min="1" :step="1" unit="1/s" />
			</div>
			<div class="col-6">
				<number-input label="Minimum segment length" title="Minimum length of each segment"
							  v-model="segmentation.minSegLength" :preset="presetSegmentation?.minSegLength"
							  :min="0.01" :step="0.01" unit="mm" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { initObject, MoveSegmentation } from "@duet3d/objectmodel";
import { computed } from "vue";

import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";

const store = useStore();

const segmentation = computed(() => store.data.move.kinematics.segmentation);
const presetSegmentation = computed(() => (store.preset.move.kinematics.name === store.data.move.kinematics.name) ? store.preset.move.kinematics.segmentation : null);

function setSegmentation(enabled: boolean) {
	store.data.move.kinematics.segmentation = enabled ? initObject(MoveSegmentation, { segmentsPerSec: 10, minSegLength: 0.2 }) : null;
}
</script>
