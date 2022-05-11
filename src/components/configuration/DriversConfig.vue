<template>
	<scroll-item anchor="Drivers" title="Drivers">
		<template #body>
			<table class="table table-striped mb-0">
				<thead>
					<th class="ps-3">
						Driver
					</th>
					<th>
						Direction
					</th>
				</thead>
				<tbody>
					<tr v-for="driver in store.data.configTool.drivers">
						<td class="ps-3">
							{{ driver.id.toString() }}
						</td>
						<td>
							<select-input v-model="driver.forwards" :options="directionOptions" :required="false" />
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

const directionOptions: Array<SelectOption> = [
	{
		text: "Forwards",
		value: true
	},
	{
		text: "Backwards",
		value: false
	}
];

const isAxisValid = (axis: Axis) => {
	return axis !== null;
};
</script>
