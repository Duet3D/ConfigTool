<template>
	<config-section :type="ConfigSectionType.Accessories" title="Accessories" url-title="Duet3D Accessories"
					url="https://docs.duet3d.com/en/Duet3D_hardware/Accessories">
		<div class="row">
			<!-- Direct Display -->
			<div class="col-auto">
				<check-input v-if="(store.data.boards.length > 0) && store.data.boards[0].supportsDirectDisplay"
							 label="Enable Direct Display"
							 title="Check this option if you have a direct display connected to your Duet (like a 12864 or TFT display)"
							 v-model="configureDirectDisplay"
							 :preset="(store.preset.boards.length > 0) && (store.preset.boards[0].directDisplay !== null)" />
			</div>
			<div class="col-12">
				<div v-if="configureDirectDisplay" class="row ms-3 my-2">
					<div class="col-6">
						<select-input label="Direct display type" title="Type of the connected display"
									  v-model="directDisplayController" :options="DirectDisplayTypes"
									  :preset="(store.preset.boards.length > 0) ? store.preset.boards[0].directDisplay?.screen.controller : null" />
					</div>
					<div v-if="store.data.boards[0].directDisplay?.encoder" class="col-3">
						<select-input label="Encoder pulses per click" title="Number of pulses per encoder turn"
									  v-model="store.data.boards[0].directDisplay!.encoder!.pulsesPerClick"
									  :options="PulsesPerClick"
									  :preset="(store.preset.boards.length > 0) ? store.preset.boards[0].directDisplay?.encoder?.pulsesPerClick : null" />
					</div>
					<div class="col-3">
						<number-input label="SPI frequency" title="Frequency of the SPI link"
									  v-model="store.data.boards[0].directDisplay!.screen.spiFreq"
									  :preset="(store.preset.boards.length > 0) ? store.preset.boards[0].directDisplay?.screen.spiFreq : null"
									  unit="Hz" :min="100000" :max="8000000" :step="1" />
					</div>
				</div>
				<div v-if="store.data.boards[0].directDisplay?.screen.controller === DirectDisplayController.ST7567"
					 class="row ms-3 my-2">
					<div class="col">
						<number-input label="Contrast ratio" title="Contrast ratio of this display"
									  v-model="(store.data.boards[0].directDisplay!.screen as DirectDisplayScreenST7567).contrast"
									  :preset="(store.preset.boards.length > 0) ? (store.preset.boards[0].directDisplay?.screen as DirectDisplayScreenST7567 | null)?.contrast : null"
									  :min="0" :max="100" :step="1" />
					</div>
					<div class="col">
						<number-input label="Resistor ratio" title="Resistor ratio of this display"
									  v-model="(store.data.boards[0].directDisplay!.screen as DirectDisplayScreenST7567).resistorRatio"
									  :preset="(store.preset.boards.length > 0) ? (store.preset.boards[0].directDisplay?.screen as DirectDisplayScreenST7567 | null)?.resistorRatio : null"
									  :min="1" :max="7" :step="1" />
					</div>
				</div>
			</div>
			<!-- PanelDue -->
			<div class="col-auto">
				<check-input v-if="panelDueChannels.length > 0" class="mt-1" label="Enable PanelDue"
							 title="Check this option if you have a PanelDue connected to your Duet"
							 :model-value="store.data.panelDueChannel >= 0"
							 @update:model-value="store.data.panelDueChannel = $event ? panelDueChannels[0].value : -1"
							 :preset="store.preset.panelDueChannel >= 0" />
			</div>
			<div class="col-12">
				<div v-if="(panelDueChannels.length > 0) && (store.data.panelDueChannel >= 0)" class="row ms-3 mt-2">
					<div class="col-6">
						<select-input label="UART Channel" title="Channel number to use for PanelDue"
									  v-model="store.data.panelDueChannel" :preset="store.preset.panelDueChannel"
									  :options="panelDueChannels" />
					</div>
					<div class="col-3">
						<select-input label="Baud rate"
									  title="Baud rate for communication. This value must match the setting on PanelDue"
									  v-model="store.data.configTool.panelDueBaudRate"
									  :preset="store.preset.configTool.panelDueBaudRate" :options="BaudRates" />
					</div>
					<div class="col-3 d-flex align-items-end">
						<check-input label="Require checksum"
									 title="Enable checksums for PanelDue communication. Recommended if your cable is long"
									 v-model="store.data.configTool.panelDueChecksum"
									 :preset="store.preset.configTool.panelDueChecksum" />
					</div>
				</div>
			</div>
		</div>
	</config-section>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";
import { ConfigSectionType } from "@/store/sections";
import { getBoardDefinition } from "@/store/Boards";
import { ConfigPortFunction } from "@/store/model/ConfigPort";

const DirectDisplayTypes: Array<SelectOption> = [
	{
		text: "ST7920 (RepRapDiscount Full Graphic Smart Controller)",
		value: DirectDisplayController.ST7920
	},
	{
		text: "ST7567 (Fysetc Mini 12864 Panel)",
		value: DirectDisplayController.ST7567
	},
	{
		disabled: true,
		text: "ILI9488 (not yet officially supported)",
		value: DirectDisplayController.ILI9488
	}
];

const PulsesPerClick: Array<SelectOption> = [
	{
		text: "-4",
		value: -4
	},
	{
		text: "-2",
		value: -2
	},
	{
		text: "-1",
		value: -1
	},
	{
		text: "1",
		value: 1
	},
	{
		text: "2",
		value: 2
	},
	{
		text: "4",
		value: 4
	},
];

const BaudRates: Array<SelectOption> = [
	{
		text: "9600",
		value: 9600
	},
	{
		text: "19200",
		value: 19200
	},
	{
		text: "38400",
		value: 38400
	},
	{
		text: "57600",
		value: 57600
	},
	{
		text: "115200",
		value: 115200
	}
];
</script>
					 
<script setup lang="ts">
import { Board, DirectDisplay, DirectDisplayController, DirectDisplayScreenST7567, LedStrip, LedStripType, initObject } from "@duet3d/objectmodel";
import { computed } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";

const store = useStore();

// Direct Display
const configureDirectDisplay = computed({
	get() { return (store.data.boards.length > 0) && store.data.boards[0].supportsDirectDisplay && (store.data.boards[0].directDisplay !== null); },
	set(value) { store.data.boards[0].directDisplay = value ? new DirectDisplay() : null; }
});

const directDisplayController = computed({
	get() { return (store.data.boards.length > 0) && store.data.boards[0].directDisplay!.screen.controller; },
	set(value) {
		store.data.boards[0].directDisplay!.update({ screen: { controller: value } });

		// ST7567 displays require a Dotstar LED strip
		if (value === DirectDisplayController.ST7567) {
			const boardDefinition = getBoardDefinition(store.data);
			if (boardDefinition !== null && boardDefinition.displayDotstarPort !== null &&
				!store.data.configTool.ports.some(item => item.equals(boardDefinition.displayDotstarPort!) && item.function === ConfigPortFunction.ledStrip) &&
				(store.data.limits.ledStrips ?? 0) > 0)
			{
				const portInstance = store.data.configTool.assignPort(boardDefinition.displayDotstarPort, ConfigPortFunction.ledStrip, 0);
				if (store.data.ledStrips.length === 0) {
					store.data.ledStrips.push(initObject(LedStrip, {
						board: portInstance.canBoard ?? 0,
						pin: portInstance.rawPorts[0],
						type: LedStripType.DotStar
					}));
				} else {
					store.data.ledStrips[0].update({
						board: portInstance.canBoard ?? 0,
						pin: portInstance.rawPorts[0],
						type: LedStripType.DotStar
					});
				}
			}
		}
	}
});

// PanelDue
const panelDueChannels = computed(() => {
	const result: Array<SelectOption> = [];
	if (store.data.boardDefinition !== null) {
		for (let i = 0; i < store.data.boardDefinition.ports.uart.length; i++) {
			if (store.data.boardDefinition.ports.uart[i] !== "usb") {
				result.push({
					text: `Channel ${i} (${store.data.boardDefinition.ports.uart[i]})`,
					value: i
				});
			}
		}
	}
	return result;
});
</script>
