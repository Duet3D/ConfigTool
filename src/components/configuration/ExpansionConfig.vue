<template>
	<scroll-item anchor="Expansion">
		<template #title>
			Expansion
			<a v-if="isDuet2" href="https://docs.duet3d.com/en/Duet3D_hardware/Duet_2_family" target="_blank">
				<i class="bi-info-circle"></i>
				Duet 2 Family
			</a>
			<a v-else-if="isDuet3" href="https://docs.duet3d.com/en/Duet3D_hardware/Duet_3_family" target="_blank">
				<i class="bi-info-circle"></i>
				Duet 3 Family
			</a>
		</template>
		<template v-if="!supportsExpansionBoards && !supportsCan" #body>
			<div class="alert alert-info mb-0">
				<i class="bi-info"></i>
				The selected board does not support expansion options.
			</div>
		</template>
		<template v-if="supportsExpansionBoards || supportsCan">
			<div v-if="supportsCan" class="row">
				<div class="col-auto mb-2">
					<check-input label="Configure CAN-connected expansion boards" title="Check this to configure CAN-connected expansion boards"
					             v-model="configureCan" :preset="false" />
				</div>
			</div>
			<div class="row">
				<div v-if="supportsExpansionBoards" class="col">
					<select-input label="Direct-Connect Expansion Board" title="Expansion board to use with the selected main board"
					              v-model="expansionBoard" :options="expansionBoards" :preset="null" />
				</div>
				<div v-if="supportsCan && configureCan" class="col">
						<select-input label="CAN Expansion Board" v-model="canExpansionBoardToAdd" :options="canExpansionBoards" :required="false" />
				</div>
				<div v-if="supportsCan && configureCan" class="col-auto d-flex align-items-end ps-0">
					<button class="btn btn-primary" :disabled="canAddCanExpansionBoard" @click="store.data.addExpansionBoard(canExpansionBoardToAdd)">
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
							Stepper Drivers
						</th>
						<th>
							Heater Outputs
						</th>
						<th>
							Fan Outputs
						</th>
						<th>
							GPIO Ports
						</th>
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(canBoard, index) in store.data.boards.slice(1)">
						<td>
							<number-input title="CAN address of this board" :min="1" :step="1" lazy
							              :model-value="canBoard.canAddress as number" @update:model-value="setCanAddress(canBoard, $event)"
							              :valid="isCanAddressUnique(canBoard.canAddress)" />
						</td>
						<td>
							{{ ExpansionBoardType[canBoard.shortName] }}
						</td>
						<td>
							{{ ExpansionBoards[ExpansionBoardType[canBoard.shortName]].numDrivers }}
						</td>
						<td>
							{{ ExpansionBoards[ExpansionBoardType[canBoard.shortName]].heaterPorts.length }}
						</td>
						<td>
							{{ ExpansionBoards[ExpansionBoardType[canBoard.shortName]].fanPorts.length }}
						</td>
						<td>
							{{ ExpansionBoards[ExpansionBoardType[canBoard.shortName]].gpInPorts.length }} / {{ ExpansionBoards[ExpansionBoardType[canBoard.shortName]].gpOutPorts.length }}
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
import SelectInput, { type SelectOption } from "@/components/inputs/SelectInput.vue";

import { ExpansionBoards, ExpansionBoardType } from "@/store/ExpansionBoards";
import { useStore } from "@/store";
import type { Board } from "@duet3d/objectmodel";
import type { BoardDescriptor } from "@/store/Boards";

const store = useStore();

const supportsExpansionBoards = computed(() => store.data.boardDefinition && store.data.boardDefinition.expansionBoards.size > 0);
const isDuet2 = computed(() => store.data.boardType !== null && (store.data.boardType as string).startsWith("Duet 2"));
const isDuet3 = computed(() => store.data.boardType !== null && (store.data.boardType as string).startsWith("Duet 3"));

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
	const boardDefinition = store.data.boardDefinition;
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
const supportsCan = computed(() => store.data.boardDefinition?.objectModelBoard.canAddress !== null);
const hasCanBoards = computed(() => store.data.boards.some((board, index) => index > 0 && board.canAddress !== null));
const configureCanValue = ref(false);
const configureCan = computed<boolean>({
	get() { return configureCanValue.value; },
	set(value) {
		if (!value) {
			for (let i = store.data.boards.length - 1; i > 0; i--) {
				if (store.data.boards[i].canAddress !== null) {
					store.data.removeExpansionBoard(i);
				}
			}
		}
		configureCanValue.value = value;
	}
});
const canExpansionBoards = computed(() => {
	const result: Array<SelectOption> = [], boardDefinition = store.data.boardDefinition;
	if (boardDefinition) {
		for (let expansionBoard of Object.values(ExpansionBoardType)) {
			if (ExpansionBoards[expansionBoard].objectModelBoard.canAddress !== null) {
				result.push({
					text: expansionBoard,
					value: expansionBoard
				});
			}
		}
	}
	return result;
});
const canExpansionBoardToAdd = ref(Object.keys(ExpansionBoardType).length > 0 ? Object.values(ExpansionBoardType)[0] : "");
const canAddCanExpansionBoard = computed(() => !canExpansionBoardToAdd || (store.data.limits.boards !== null && store.data.boards.length > store.data.limits.boards));
function setCanAddress(canBoard: Board, value: number) {
	canBoard.canAddress = value;
	store.data.refreshDrivers();
}
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
