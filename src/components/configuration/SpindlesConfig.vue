<template>
	<scroll-item anchor="Spindles">
		<template #title>
			Spindles
			<button class="btn btn-sm btn-primary" :disabled="!canAddSpindle" @click="addSpindle">
				<i class="bi-plus-circle"></i>
				Add Spindle
			</button>
		</template>
		<template #body>
			<table class="table table-striped table-extruders mb-0">
				<colgroup>
					<col style="width: auto;">
					<col style="width: auto;">
					<col style="width: 20%;">
					<col style="width: 20%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: auto;">
				</colgroup>
				<thead>
					<tr>
						<th class="text-center">
							Spindle
						</th>
						<th>
							PWM Port
						</th>
						<th>
							Forward Port
						</th>
						<th>
							Reverse Port
						</th>
						<th>
							RPM at 0% PWM
						</th>
						<th>
							RPM at 100% PWM
						</th>
						<th>
							Min PWM (in %)
						</th>
						<th>
							Max PWM (in %)
						</th>
						<th>
							Idle PWM (in %)
						</th>
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(extruder, index) in store.data.spindles">
						<td class="text-center">
							<div class="mt-2">
								{{ index }}
							</div>
						</td>
						<td>
							<button class="btn btn-sm btn-danger mt-1"
									@click="store.data.spindles.splice(index, 1)">
								<i class="bi-trash"></i>
							</button>
						</td>
					</tr>
				</tbody>
			</table>

			<div v-if="store.data.spindles.length === 0" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No Spindles defined
			</div>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { Spindle } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";

const store = useStore();

// Spindle management
const canAddSpindle = computed(() => store.data.spindles.length < store.data.limits.spindles!);
function addSpindle() {
	const spindle = new Spindle();
	if (store.preset.spindles.length > store.data.spindles.length) {
		spindle.update(store.preset.spindles[store.data.spindles.length])
	} else if (store.preset.spindles.length > 0) {
		spindle.update(store.preset.spindles[0]);
	}
	store.data.spindles.push(spindle);
}
</script>
