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
							  :options="ModeOptions" v-model="standaloneMode" :preset="store.preset.sbc === null"
							  :required="false" />
			</div>
		</div>
		<div class="row">
			<div class="col-auto mt-3">
				<check-input label="Select the first tool on start-up" title="Select the first available tool on start-up"
							 v-model="store.data.configTool.autoSelectFirstTool"
							 :preset="store.preset.configTool.autoSelectFirstTool" />
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
			<div class="col-12">
				Machine Capabilities:
			</div>
		</div>
		<div class="row">
			<div class="col-4">
				<check-input label="FFF (3D Printing)" title="Enable FFF printing"
							 :model-value="store.data.configTool.capabilities.fff"
							 @update:model-value="store.data.setFFF($event)"
							 :preset="store.preset.configTool.capabilities.fff" />
			</div>
			<div class="col-4">
				<check-input label="CNC (Milling)" title="Enable CNC functionality"
							 :model-value="store.data.configTool.capabilities.cnc"
							 @update:model-value="store.data.setCNC($event)"
							 :preset="store.preset.configTool.capabilities.cnc" />
			</div>
			<div class="col-4">
				<check-input label="Laser (Cutting/Etching)" title="Enable Laser functionality"
							 :model-value="store.data.configTool.capabilities.laser"
							 @update:model-value="store.data.setLaser($event)"
							 :preset="store.preset.configTool.capabilities.laser" />
			</div>
		</div>
	</config-section>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";

const ModeOptions: Array<SelectOption> = [
	{
		text: "Standalone mode (without SBC)",
		value: true
	},
	{
		text: "SBC mode",
		value: false
	}
];
</script>

<script setup lang="ts">
import { NetworkInterface, NetworkInterfaceType, SBC } from "@duet3d/objectmodel";
import { computed } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import TextInput from "@/components/inputs/TextInput.vue";

import { BoardType, UnsupportedBoardType } from "@/store/Boards";
import { preconfigureNetworkInterface } from "@/store/defaults";
import { ConfigSectionType } from "@/store/sections";
import { useStore } from "@/store";

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
const supportsSbcMode = computed(() => !!store.data.boardDefinition?.objectModelBoard.iapFileNameSBC);
const standaloneMode = computed<boolean>({
	get() { return store.data.sbc === null; },
	set(value) {
		store.data.sbc = value ? null : new SBC();
		if (value) {
			if (store.data.boardDefinition) {
				// Delete interfaces that are not present in the original board
				for (let i = store.data.network.interfaces.length - 1; i >= 0; i--) {
					if (!store.data.boardDefinition.objectModelNetworkInterfaces.some(iface => iface.type === store.data.network.interfaces[i].type)) {
						store.data.network.interfaces.splice(i, 1);
					}
				}

				// Add missing interface types
				for (const networkInterfacePreset of store.data.boardDefinition.objectModelNetworkInterfaces) {
					if (!store.data.network.interfaces.some(iface => iface.type === networkInterfacePreset.type)) {
						const newNetworkInterface = new NetworkInterface();
						newNetworkInterface.update(networkInterfacePreset);
						preconfigureNetworkInterface(newNetworkInterface);
						store.data.network.interfaces.push(newNetworkInterface);
					}
				}
			}
		} else {
			// Assume a standard Raspberry Pi with LAN and WiFi is the SBC to use
			if (store.data.network.interfaces.length === 0 || store.data.network.interfaces[0].type !== NetworkInterfaceType.lan) {
				const lanInterface = new NetworkInterface();
				preconfigureNetworkInterface(lanInterface);
				lanInterface.type = NetworkInterfaceType.lan;
				if (store.data.network.interfaces.length === 0) {
					store.data.network.interfaces.push(lanInterface);
				} else {
					store.data.network.interfaces[0].update(lanInterface);
				}
			}

			if (store.data.network.interfaces.length === 1 || store.data.network.interfaces[1].type !== NetworkInterfaceType.wifi) {
				const wifiInterface = new NetworkInterface();
				preconfigureNetworkInterface(wifiInterface);
				wifiInterface.type = NetworkInterfaceType.wifi;
				if (store.data.network.interfaces.length === 1) {
					store.data.network.interfaces.push(wifiInterface);
				} else {
					store.data.network.interfaces[1].update(wifiInterface);
				}
			}
		}
	}
});
const supportsAutoSave = computed(() => !!store.data.boardDefinition?.objectModelBoard.vIn);
</script>
