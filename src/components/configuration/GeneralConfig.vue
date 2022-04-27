<template>
	<scroll-item anchor="General" title="General">
		<div class="row">
			<div class="col">
				<select-input label="Board" title="Mainboard of your setup"
				              v-model="board" :options="boardOptions" :preset="boardPreset" />
			</div>
			<div class="col">
				<text-input label="Printer Name" title="Name of your printer (M550). If you use mDNS, you can access your printer via Myprinter.local"
				            :max-length="50" v-model="store.data.network.name" :preset="store.preset.network.name" />
			</div>
		</div>
		<div class="row">
			<div class="col-auto mt-3">
				<check-input v-if="store.supportsSbc" label="Run in standalone mode without SBC (Raspberry Pi)" title="Run RepRapFirmware in stand-alone mode without an attached single-board computer"
				             v-model="sbcMode" :preset="store.preset.state.dsfVersion !== null" />
				<check-input label="Read config-override.g file at end of startup process (provides similar functionality to the EEPROM option in Marlin)" title="Enable auto-save facility"
				             v-model="store.data.configTool.configOverride" :preset="store.preset.configTool.configOverride" />
				<check-input v-if="store.supportsAutoSave" label="Save print state on power failure" title="Store the last valid print parameters on the SD card when a power failure occurs (M911)"
				             v-model="store.data.configTool.autoSave.enabled" :preset="store.preset.configTool.autoSave.enabled" />
				<div v-if="store.data.configTool.autoSave.enabled" class="mt-2 ps-4">
					<div class="row">
						<div class="col-3">
							<number-input label="Auto Save Threshold" title="If the input voltage falls below this value, the print is paused and resume information is saved"
							              :min="store.minVoltage" :max="store.maxVoltage" :step="0.1" unit="V"
							              v-model="store.data.configTool.autoSave.saveThreshold" :preset="store.preset.configTool.autoSave.saveThreshold" />
						</div>
						<div class="col-3">
							<number-input label="Resume Threshold" title="If the input voltage rises above this value after an under-voltage event, the print is resumed"
							              :min="store.minVoltage" :max="store.maxVoltage" :step="0.1" unit="V"
							              v-model="store.data.configTool.autoSave.resumeThreshold" :preset="store.preset.configTool.autoSave.resumeThreshold" />
						</div>
						<div class="col pe-0">
							<text-input label="G/M/T-codes to run when auto-saving is performed" title="These codes are executed when an under-voltage event is detected"
							            :max-length="80" v-model="store.data.configTool.autoSave.codesToRun" :preset="store.preset.configTool.autoSave.codesToRun" />
						</div>
					</div>
					<div class="row mt-2">
						<div class="col">
							Important: The file <code>/sys/resurrect-prologue.g</code> must be set up manually for resume to work (see <a href="https://docs.duet3d.com/en/User_manual/Tuning/Resume#setting-up-the-sysresurrect-prologueg-file" target="_blank">Duet3D Documentation</a>)
						</div>
					</div>
				</div>
			</div>
		</div>
	</scroll-item>
</template>

<script setup lang="ts">
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import type { SelectOption } from "@/components/inputs/SelectInput.vue";
import TextInput from "@/components/inputs/TextInput.vue";

import { BoardType, UnsupportedBoardType } from "@/store/Boards";
import { useStore } from "@/store";

import { version } from "../../../package.json";

const dsfVersion = `${version.split('.')[0]}.${version.split('.')[1]}`;

const store = useStore();

// Board options
let boardOptions: Record<string, Array<string | SelectOption>> | Array<string | SelectOption> = {};
const otherBoards: Array<BoardType | UnsupportedBoardType> = [];

for (let board of Object.values(BoardType)) {
	const match = /^(Duet \d+)/.exec(board);
	if (match) {
		const groupTitle = `${match[1]} series`;
		if (!boardOptions[groupTitle]) {
			boardOptions[groupTitle] = [];
		}
		boardOptions[groupTitle].push(board);
	} else {
		otherBoards.push(board);
	}
}

if (Object.keys(boardOptions).length !== 0) {
	if (otherBoards.length !== 0) {
		boardOptions["Other boards"] = otherBoards;
	}
} else {
	boardOptions = otherBoards;
}

if (Object.keys(UnsupportedBoardType).length !== 0) {
	if (boardOptions instanceof Array) {
		for (let unsupportedBoard of Object.values(UnsupportedBoardType)) {
			boardOptions.push({
				disabled: true,
				text: unsupportedBoard,
				value: unsupportedBoard
			});
		}
	} else {
		const unsupportedBoardGroup = [];
		for (let unsupportedBoard of Object.values(UnsupportedBoardType)) {
			unsupportedBoardGroup.push({
				disabled: true,
				text: unsupportedBoard,
				value: unsupportedBoard
			});
		}
		boardOptions["Unsupported boards"] = unsupportedBoardGroup;
	}
}

// Board selection
const board = computed({
	get() { return store.data.boardType as string; },
	set(value: string) { store.data.boardType = value as BoardType; }
});
const boardPreset = computed(() => store.preset.boardType as string);

// SBC mode
const sbcMode = computed<boolean>({
	get() { return store.data.state.dsfVersion !== null; },
	set(value) { store.data.state.dsfVersion = value ? dsfVersion : null; }
});
</script>
