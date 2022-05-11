<template>
	<scroll-item anchor="Axes">
		<template #title>
			Axes
			<button class="btn btn-sm btn-primary">
				<i class="bi-plus-circle"></i>
				Add Axis
			</button>
		</template>
		<template #body>
			<table class="table table-striped">
				<thead>
					<th>
						Axis Letter
					</th>
					<th>
						Microstepping (interpolation)
					</th>
					<th>
						Steps per mm
					</th>
					<th>
						Max. Speed Change (mm/s)
					</th>
					<th>
						Max. Speed (mm/s)
					</th>
					<th>
						Acceleration (mm/s²)
					</th>
					<th>
						Motor Current (mA)
					</th>
					<th>
						<!-- Delete button -->
					</th>
				</thead>
				<tbody>
					<tr v-for="axis in store.data.move.axes">
						<td>
							<select-input v-model="axis.letter" :options="['X', 'Y', 'Z']" :valid="isAxisValid(axis)" />
						</td>
						<td>
						</td>
					</tr>
				</tbody>
			</table>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import type { Axis } from "@duet3d/objectmodel";

import ScrollItem from "@/components/ScrollItem.vue";
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";

const store = useStore();

const isAxisValid = (axis: Axis) => {
	return axis !== null;
};
</script>
