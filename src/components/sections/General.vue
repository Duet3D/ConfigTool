<template>
	<config-section :type="ConfigSectionType.General" title="General" url-title="Getting Started"
					url="https://docs.duet3d.com/en/User_manual/Overview">
		<div class="row">
			<div class="col">
				<select-input label="Board" title="Mainboard of your setup" v-model="board" :options="boardOptions"
							  :preset="boardPreset" />
			</div>
			<div class="col">
				<text-input label="Printer Name"
							title="Name of your printer (M550). If you use mDNS, you can access your printer via Myprinter.local"
							:max-length="50" v-model="store.data.network.name" :preset="store.preset.network.name" />
			</div>
			<div v-if="supportsSbcMode" class="col">
				<select-input label="Operation Mode"
							  title="Operation mode of your printer. Newer boards allow networking and plugin functionality to be handled by an extra SBC"
							  :options="SbcModeOptions" v-model="store.data.sbcMode" :preset="store.preset.sbcMode"
							  :required="false" />
			</div>
		</div>
		<div class="row">
			<div class="col-auto mt-3">
				<check-input label="Enable third-party STM boards maintained by TeamGloomy" id="input-stm-boards-enable" @update:model-value="toggleSTMBoards"
							 title="Enable third-party STM boards maintained by TeamGloomy" v-model="store.data.configTool.enableSTMBoards"
							 :preset="store.preset.configTool.enableSTMBoards" />
				<check-input label="Read config-override.g file at end of startup process (provides similar functionality to the EEPROM option in Marlin)"
							 title="Enable auto-save facility" v-model="store.data.configTool.configOverride"
							 :preset="store.preset.configTool.configOverride" />
				<check-input v-if="supportsAutoSave" label="Save print state on power failure"
							 title="Store the last valid print parameters on the SD card when a power failure occurs (M911)"
							 v-model="store.data.configTool.autoSave.enabled"
							 :preset="store.preset.configTool.autoSave.enabled" />
				<div v-if="store.data.configTool.autoSave.enabled" class="mt-2 ps-4">
					<div class="row">
						<div class="col-3">
							<number-input label="Auto Save Threshold"
										  title="If the input voltage falls below this value, the print is paused and resume information is saved"
										  :min="store.data.boardDefinition?.minVoltage"
										  :max="store.data.boardDefinition?.maxVoltage" :step="0.1" unit="V"
										  v-model="store.data.configTool.autoSave.saveThreshold"
										  :preset="store.preset.configTool.autoSave.saveThreshold" />
						</div>
						<div class="col-3">
							<number-input label="Resume Threshold"
										  title="If the input voltage rises above this value after an under-voltage event, the print is resumed"
										  :min="store.data.boardDefinition?.minVoltage"
										  :max="store.data.boardDefinition?.maxVoltage" :step="0.1" unit="V"
										  v-model="store.data.configTool.autoSave.resumeThreshold"
										  :preset="store.preset.configTool.autoSave.resumeThreshold" />
						</div>
						<div class="col pe-0">
							<text-input label="G/M/T-codes to run when auto-saving is performed"
										title="These codes are executed when an under-voltage event is detected"
										:max-length="80" v-model="store.data.configTool.autoSave.codesToRun"
										:preset="store.preset.configTool.autoSave.codesToRun" />
						</div>
					</div>
					<div class="row mt-2">
						<div class="col">
							Important: The file <code>/sys/resurrect-prologue.g</code> must be set up manually for
							resume to work (see <a
							   href="https://docs.duet3d.com/en/User_manual/Tuning/Resume#setting-up-the-sysresurrect-prologueg-file"
							   target="_blank">Duet3D Documentation</a>)
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row mt-2 mb-1">
			<div class="col-8">
				Machine Capabilities:

				<div class="row mt-3">
					<div class="col">
						<check-input label="FFF (3D Printing)" title="Enable FFF printing"
									 :disabled="!store.data.configTool.capabilities.cnc && !store.data.configTool.capabilities.laser"
									 :model-value="store.data.configTool.capabilities.fff"
									 @update:model-value="store.data.setFFF($event)"
									 :preset="store.preset.configTool.capabilities.fff" />
					</div>
					<div class="col">
						<check-input label="CNC (Milling)" title="Enable CNC functionality"
									 :disabled="!store.data.configTool.capabilities.fff && !store.data.configTool.capabilities.laser"
									 :model-value="store.data.configTool.capabilities.cnc"
									 @update:model-value="store.data.setCNC($event)"
									 :preset="store.preset.configTool.capabilities.cnc" />
					</div>
					<div class="col">
						<check-input label="Laser (Cutting/Etching)" title="Enable Laser functionality"
									 :disabled="!store.data.configTool.capabilities.fff && !store.data.configTool.capabilities.cnc"
									 :model-value="store.data.configTool.capabilities.laser"
									 @update:model-value="store.data.setLaser($event)"
									 :preset="store.preset.configTool.capabilities.laser" />
					</div>
				</div>
			</div>
			<div class="col-4">
				<select-input label="Mode on start-up"
							  title="Designated mode after start-up of the machine (only applicable if this machine supports multiple processes)"
							  v-model="store.data.state.machineMode" :options="machineModeOptions"
							  :preset="store.preset.state.machineMode" />
			</div>
		</div>
	</config-section>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";
import { MachineMode } from "@duet3d/objectmodel";

const SbcModeOptions: Array<SelectOption> = [
	{
		text: "Standalone mode (without SBC)",
		value: false
	},
	{
		text: "SBC mode",
		value: true
	}
];
</script>

<script setup lang="ts">
import { computed, onMounted } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import TextInput from "@/components/inputs/TextInput.vue";

import { type BoardTypes, BoardType, UnsupportedBoardType } from "@/store/Boards";
import { STM32F4BoardType, STM32H723BoardType, STM32H743BoardType } from "@/store/STMBoard";
import { ConfigSectionType } from "@/store/sections";
import { useStore } from "@/store";

const store = useStore();

// Board options
let boardOptions: Record<string, Array<string | SelectOption>> | Array<string | SelectOption> = {};
const otherBoards: Array<BoardType | UnsupportedBoardType> = [];
const STMF4Boards: Array<STM32F4BoardType> = [];
const STMH723Boards: Array<STM32H723BoardType> = [];
const STMH743Boards: Array<STM32H743BoardType> = [];

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
	boardOptions["Other boards"] = otherBoards;
}

for (let board of Object.values(STM32F4BoardType)) {
	const groupTitle = "STM32F4";
	if (!boardOptions[groupTitle]) {
		boardOptions[groupTitle] = [];
	}
	boardOptions[groupTitle].push(board);
	STMF4Boards.push(board);
}

for (let board of Object.values(STM32H723BoardType)) {
	const groupTitle = "STM32H723";
	if (!boardOptions[groupTitle]) {
		boardOptions[groupTitle] = [];
	}
	boardOptions[groupTitle].push(board);
	STMH723Boards.push(board);
}

for (let board of Object.values(STM32H743BoardType)) {
	const groupTitle = "STM32H743";
	if (!boardOptions[groupTitle]) {
		boardOptions[groupTitle] = [];
	}
	boardOptions[groupTitle].push(board);
	STMH743Boards.push(board);
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
	set(value: string) { store.data.boardType = value as BoardTypes; }
});
const boardPreset = computed(() => store.preset.boardType as string);

// Misc
const supportsSbcMode = computed(() => !!store.data.boardDefinition?.objectModelBoard.iapFileNameSBC);
const supportsAutoSave = computed(() => !!store.data.boardDefinition?.objectModelBoard.vIn);

// Machine Mode
const machineModeOptions = computed(() => [
	{
		disabled: !store.data.configTool.capabilities.fff,
		text: "FFF (default)",
		value: MachineMode.fff
	},
	{
		disabled: !store.data.configTool.capabilities.cnc,
		text: "CNC",
		value: MachineMode.cnc
	},
	{
		disabled: !store.data.configTool.capabilities.laser,
		text: "Laser",
		value: MachineMode.laser
	}
] as Array<SelectOption>);

// Display STM boards options
function toggleSTMBoards(checked: boolean) {
	let stm_groups = ["optgroup-stm32f4", "optgroup-stm32h723", "optgroup-stm32h743"]
	for (let key in stm_groups) {
		let element = document.getElementById(stm_groups[key]);
		if (element === null) { continue };
		checked ? element.removeAttribute("hidden") : element.setAttribute("hidden", "hidden");
	}
}

onMounted(() => {
	// Filter out the STM boards options
	// FIXME: The id given to a "check-input" component is not unique as it is set on the input but also on the parent div
	let element = document.getElementById("input-stm-boards-enable");
	toggleSTMBoards(element !== null && (element as HTMLInputElement).checked);
});
</script>
