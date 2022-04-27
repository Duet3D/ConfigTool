<template>
	<scroll-item anchor="Expansion" title="Expansion">
		<template v-if="!supportsExpansionBoards" #body>
			<div class="alert alert-info mb-0">
				<i class="bi-info"></i>
				The selected board does not support expansion options.
			</div>
		</template>
		<template v-if="supportsExpansionBoards">
			<select-input v-if="supportsExpansionBoards" label="Expansion Board" title="Expansion board to use with the selected main board"
			              v-model="expansionBoard" :options="expansionBoards" preset="null" />
			<div class="row">
				<div class="col-auto mt-3">
					<check-input v-if="supportsCan" label="Configure CAN-connected expansion boards" title="Check this to configure CAN-connected expansion boards"
					             v-model="configureCan" :preset="false" />
				</div>
			</div>
			<table v-if="configureCan" class="table table-striped">
				<thead>
					<tr>
						<th>
							CAN Address
						</th>
						<th>
							Board Type
						</th>
						<th>
							Connectivity
						</th>
						<th width="1%">

						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(canBoard, index) in store.data.boards.filter(item => item.canAddress !== null && item.canAddress > 0)">
						<td>
							<number-input title="CAN address of this board"
							              v-model="canBoard.canAddress as number" :preset="index" />
						</td>
					</tr>
				</tbody>
				<tfoot>
					Add
				</tfoot>
			</table>
		</template>
	</scroll-item>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import type { SelectOption } from "@/components/inputs/SelectInput.vue";

import type { ExpansionBoardType } from "@/store/ExpansionBoards";
import { useStore } from "@/store";
import type { Board } from "@duet3d/objectmodel";

const store = useStore();

// Expansion board
const expansionBoard = computed({
	get: () => store.data.configTool.expansionBoard || "null",
	set: (value) => store.data.setExpansionBoard((value === "null") ? null : value as ExpansionBoardType)
});

// Expansion board list
const supportsExpansionBoards = computed(() => store.boardDefinition !== null && store.boardDefinition.expansionBoards.size > 0);
const expansionBoards = computed(() => {
	const result: Array<SelectOption> = [
		{
			text: "None",
			value: "null"
		}
	];
	const boardDefinition = store.boardDefinition;
	if (boardDefinition) {
		for (let expansionBoard of boardDefinition.expansionBoards) {
			result.push({
				text: expansionBoard,
				value: expansionBoard
			});
		}
	}
	return result;
});

// CAN configuration
const supportsCan = computed(() => store.boardDefinition && store.boardDefinition.objectModelBoard.canAddress !== null);
const configureCan = ref(false);
</script>
