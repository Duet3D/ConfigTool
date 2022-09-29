<template>
	<scroll-item anchor="Accessories" title="Accessories">
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
									  v-model="store.data.boards[0].directDisplay!.typeName"
									  :options="DirectDisplayTypes"
									  :preset="(store.preset.boards.length > 0) ? store.preset.boards[0].directDisplay?.typeName : null" />
					</div>
					<div class="col-3">
						<select-input label="Pulses per click" title="Number of pulses per encoder turn"
									  v-model="store.data.boards[0].directDisplay!.pulsesPerClick"
									  :options="PulsesPerClick"
									  :preset="(store.preset.boards.length > 0) ? store.preset.boards[0].directDisplay?.pulsesPerClick : null" />
					</div>
					<div class="col-3">
						<number-input label="SPI frequency" title="Frequency of the SPI link"
									  v-model="store.data.boards[0].directDisplay!.spiFreq"
									  :preset="(store.preset.boards.length > 0) ? store.data.boards[0].directDisplay?.spiFreq : null"
									  unit="Hz" :min="100000" :max="8000000" :step="1" />
					</div>
				</div>
			</div>
			<!-- PanelDue -->
			<div class="col-auto">
				<check-input v-if="panelDueChannels.length > 0" class="mt-1" label="Enable PanelDue"
							 title="Check this option if you have a PanelDue connected to your Duet"
							 :model-value="panelDueChannel >= 0"
							 @update:model-value="panelDueChannel = $event ? panelDueChannels[0].value : -1"
							 :preset="presetPanelDueChannel >= 0" />
			</div>
			<div class="col-12">
				<div v-if="(panelDueChannels.length > 0) && (panelDueChannel >= 0)" class="row ms-3 mt-2">
					<div class="col-6">
						<select-input label="UART Channel" title="Channel number to use for PanelDue"
									  v-model="panelDueChannel" :preset="presetPanelDueChannel"
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
	</scroll-item>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";
import { defineStore } from "pinia";

const DirectDisplayTypes: Array<SelectOption> = [
	{
		text: "ST7920 (RepRapDiscount Full Graphic Smart Controller)",
		value: "128x64 mono graphics with ST7920 controller"
	},
	{
		text: "ST7567 (Fysetc Mini 12864 Panel)",
		value: "128x64 mono graphics with ST7567 controller"
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
import { DirectDisplay, initObject } from "@duet3d/objectmodel";
import { computed } from "vue";

import ScrollItem from "@/components/ScrollItem.vue";
import CheckInput from "@/components/inputs/CheckInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import NumberInput from "@/components/inputs/NumberInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";

const store = useStore();

// Direct Display
const configureDirectDisplay = computed({
	get() { return (store.data.boards.length > 0) && store.data.boards[0].supportsDirectDisplay && (store.data.boards[0].directDisplay !== null); },
	set(value) {
		if (value) {
			store.data.boards[0].directDisplay = initObject(DirectDisplay, {
				pulsesPerClick: 4,
				spiFreq: 2000000,
				typeName: DirectDisplayTypes[0].value
			});
		} else {
			store.data.boards[0].directDisplay = null;
		}
	}
});

// PanelDue
const panelDueChannel = computed({
	get() {
		if (store.data.boardDefinition !== null) {
			for (let channel = 0; channel < store.data.boardDefinition.ports.uart.length; channel++) {
				const uartPorts = store.data.boardDefinition.ports.uart[channel];

				// USB isn't a valid choice
				if (uartPorts === "usb") {
					continue;
				}

				// Check if the given UART ports are all assigned to function UART
				let isAssignedToUart = true;
				for (const uartPort of uartPorts.split("+")) {
					for (const item of store.data.configTool.ports) {
						if (item.equals(uartPort)) {
							if (item.function !== ConfigPortFunction.uart) {
								isAssignedToUart = false;
							}
							break;
						}
					}

					if (!isAssignedToUart) {
						break;
					}
				}
				if (isAssignedToUart) {
					return channel;
				}
			}
		}
		return -1;
	},
	set(value) {
		if (store.data.boardDefinition !== null) {
			for (let channel = 0; channel < store.data.boardDefinition.ports.uart.length; channel++) {
				const uartPorts = store.data.boardDefinition.ports.uart[channel];

				// USB isn't a valid choice
				if (uartPorts === "usb") {
					continue;
				}

				// Check if the given UART ports are all assigned to function UART
				for (const uartPort of uartPorts.split("+")) {
					for (const item of store.data.configTool.ports) {
						if (item.equals(uartPort)) {
							if (channel === value) {
								// Reassign UART port of this channel
								item.function = ConfigPortFunction.uart;
							} else if (item.function === ConfigPortFunction.uart) {
								// Free previously assigned UART ports
								item.function = null;
							}
						}
					}
				}
			}
		}
	}
});

const presetPanelDueChannel = computed(() => {
	if (store.preset.boardDefinition !== null) {
		for (let channel = 0; channel < store.preset.boardDefinition.ports.uart.length; channel++) {
			const uartPorts = store.preset.boardDefinition.ports.uart[channel];

			// USB isn't a valid choice
			if (uartPorts === "usb") {
				continue;
			}

			// Check if the given UART ports are all assigned to function UART
			let isAssignedToUart = true;
			for (const uartPort of uartPorts.split("+")) {
				for (const item of store.data.configTool.ports) {
					if (item.equals(uartPort)) {
						if (item.function !== ConfigPortFunction.uart) {
							isAssignedToUart = false;
						}
						break;
					}
				}

				if (!isAssignedToUart) {
					break;
				}
			}
			if (isAssignedToUart) {
				return channel;
			}
		}
	}
	return -1;
});

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
