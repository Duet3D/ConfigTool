<template>
	<scroll-item anchor="Expansion" title="Expansion">
		<template v-if="!supportsExpansionBoards" #body>
			<div class="alert alert-info mb-0">
				<i class="bi-info"></i>
				The selected board does not support expansion options.
			</div>
		</template>
		<template v-if="supportsExpansionBoards">
			<div v-if="supportsCan" class="row">
				<div class="col-auto mb-2">
					<check-input label="Configure CAN-connected expansion boards" title="Check this to configure CAN-connected expansion boards"
					             v-model="configureCan" :preset="false" />
				</div>
			</div>
			<div class="row">
				<div class="col">
					<select-input v-if="supportsExpansionBoards" label="Direct-Connect Expansion Board" title="Expansion board to use with the selected main board"
					              v-model="expansionBoard" :options="expansionBoards" :preset="null" />
				</div>
				<div v-if="supportsCan && configureCan" class="col">
						<select-input label="CAN Expansion Board" v-model="canExpansionBoardToAdd" :options="canExpansionBoards" :required="false" />
				</div>
				<div v-if="supportsCan && configureCan" class="col-auto d-flex align-items-end ps-0">
					<button class="btn btn-primary" :disabled="!canExpansionBoardToAdd" @click="store.data.addExpansionBoard(canExpansionBoardToAdd)">
						<i class="bi-plus"></i>
						Add
					</button>
				</div>
			</div>
		</template>
		<template #append>
			<table v-if="supportsCan && hasCanBoards" class="table table-striped mt-n1 mb-0">
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
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(canBoard, index) in store.data.boards.slice(1)">
						<td>
							<number-input title="CAN address of this board" :min="1" :step="1"
										  v-model="canBoard.canAddress as number" :valid="isCanAddressUnique(canBoard.canAddress)" />
						</td>
						<td>
							{{ ExpansionBoardType[canBoard.shortName] }}
						</td>
						<td>
							Stepper Drivers/HC Outputs/LC Outputs/Analog Inputs/GPIO
						</td>
						<td>
							<button class="btn btn-sm btn-danger" @click="store.data.removeExpansionBoard(index + 1)">
								<i class="bi-trash"></i>
							</button>
						</td>
					</tr>
				</tbody>
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

import { ExpansionBoards, ExpansionBoardType } from "@/store/ExpansionBoards";
import { useStore } from "@/store";
import { Board } from "@duet3d/objectmodel";

const store = useStore();

const supportsExpansionBoards = computed(() => store.boardDefinition !== null && store.boardDefinition.expansionBoards.size > 0);

// Direct-Connect Expansion board
const expansionBoard = computed({
	get: () => store.data.configTool.expansionBoard,
	set: (value) => store.data.setExpansionBoard(value)
});
const expansionBoards = computed(() => {
	const result: Array<SelectOption> = [
		{
			text: "None",
			value: null
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
const hasCanBoards = computed(() => store.data.boards.some((board, index) => index > 0 && board.canAddress !== null));
const configureCanValue = ref(false);
const configureCan = computed<boolean>({
	get() { return configureCanValue.value; },
	set(value) {
		if (!value) {
			for (let i = store.data.boards.length - 1; i > 0; i--) {
				if (store.data.boards[i].canAddress !== null) {
					store.data.boards.splice(i, 1);
				}
			}
		}
		configureCanValue.value = value;
	}
});
const canExpansionBoards = computed(() => {
	const result: Array<SelectOption> = [], boardDefinition = store.boardDefinition;
	if (boardDefinition) {
		for (let canExpansionBoard of Object.values(ExpansionBoardType)) {
			result.push({
				text: canExpansionBoard,
				value: canExpansionBoard
			});
		}
	}
	return result;
});
const canExpansionBoardToAdd = ref("");
const isCanAddressUnique = (canAddress: number | null) => {
	let occurences = 0;
	for (const board of store.data.boards) {
		if (board.canAddress === canAddress) {
			occurences++;
		}
	}
	return occurences === 1;
};
</script>
