<template>
	<scroll-item anchor="Spindles">
		<template #title>
			Spindles
			<button class="btn btn-sm btn-primary" :disabled="!canAddSpindle" @click.prevent="addSpindle">
				<i class="bi-plus-circle"></i>
				Add Spindle
			</button>
		</template>

		<template #body>
			<table v-if="store.data.spindles.length > 0" class="table table-striped mb-0">
				<colgroup>
					<col style="width: auto;">
					<col style="width: 23.3%;">
					<col style="width: 23.4%;">
					<col style="width: 23.3%;">
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
							Forwards Port
						</th>
						<th>
							Reverse Port
						</th>
						<th>
							Minimum RPM
						</th>
						<th>
							Maximum RPM
						</th>
						<!--
						<th>
							Min PWM
						</th>
						<th>
							Max PWM
						</th>
						<th>
							Idle PWM
						</th>
						-->
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="(spindle, index) in store.data.spindles">
						<tr v-if="spindle !== null">
							<td class="text-center">
								<div class="mt-2">
									{{ index }}
								</div>
							</td>
							<td>
								<port-input :function="ConfigPortFunction.spindlePwm" :index="index" />
							</td>
							<td>
								<port-input :function="ConfigPortFunction.spindleForwards" :index="index" />
							</td>
							<td>
								<port-input :function="ConfigPortFunction.spindleBackwards" :index="index" />
							</td>
							<td>
								<number-input title="Minimum rotations per minute when turned on"
											  v-model="spindle.min" :preset="getPresetSpindleValue(index, 'min')" />
							</td>
							<td>
								<number-input title="Maximum rotations per minuate"
											  v-model="spindle.max" :preset="getPresetSpindleValue(index, 'max')" />
							</td>
							<!--
							<td>
								<number-input title="Minimum PWM output value when turned on"
											  v-model="spindle.minPwm" :preset="getSpindlePreset(index, 'minPwm')" />
							</td>
							<td>
								<number-input title="Maximum PWM output value"
											  v-model="spindle.maxPwm" :preset="getSpindlePreset(index, 'maxPwm')" />
							</td>
							<td>
								<number-input title="PWM output value when in standby (i.e. when the spindle is idle)"
											  v-model="spindle.idlePwm" :preset="getSpindlePreset(index, 'idlePwm')" />
							</td>
							-->
							<td>
								<button class="btn btn-sm btn-danger mt-1"
										@click.prevent="store.data.spindles.splice(index, 1)">
									<i class="bi-trash"></i>
								</button>
							</td>
						</tr>
					</template>
				</tbody>
			</table>

			<div v-else class="alert alert-info mb-0">
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
import PortInput from "@/components/inputs/PortInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";

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

// Spindles
function getPresetSpindleValue<K extends keyof Spindle>(index: number, key: K) {
	if (index < store.preset.spindles.length) {
		const presetSpindle = store.preset.spindles[index];
		if (presetSpindle !== null) {
			return presetSpindle[key] as number;
		}
	}
	return null;
}
</script>
