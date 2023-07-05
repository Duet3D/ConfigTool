<style scoped>
.table-led-strips tr > td {
	vertical-align: middle;
}
</style>

<template>
	<config-section :type="ConfigSectionType.LedStrips" title="LED Strips" url-title="Neopixel and DotStar LEDs"
					url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/IO_Neopixel_DotStar">
		<template #append-title>
			<button class="btn btn-sm btn-primary" :disabled="!canAddLedStrip" @click.prevent="addLedStrip">
				<i class="bi-plus-circle"></i>
				Add LED Strip
			</button>
		</template>
		<template #body>
			<table v-if="store.data.ledStrips.length > 0" class="table table-led-strips table-striped mb-0">
				<colgroup>
					<col style="width: auto;">
					<col style="width: 50%;">
					<col style="width: 50%;">
					<col style="width: auto;">
				</colgroup>
				<thead>
					<tr>
						<th class="text-center">
							Number
						</th>
						<th>
							Type
						</th>
						<th>
							Port
						</th>
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(strip, index) in store.data.ledStrips">
						<td class="text-center">
							#{{ index }}
						</td>
						<td>
							<select-input title="Type of this LED strip" v-model="strip.type"
										  :preset="getPresetLedStripValue(index, 'type')" :options="LedStripTypes" />
						</td>
						<td>
							<port-input title="Output port for this LED strip" :function="ConfigPortFunction.ledStrip"
										:index="index" />
						</td>
						<td>
							<button class="btn btn-sm btn-danger" @click.prevent="deleteLedStrip(index)">
								<i class="bi-trash"></i>
							</button>
						</td>
					</tr>
				</tbody>
			</table>

			<div v-if="store.data.ledStrips.length === 0" class="alert alert-info mb-0">
				<i class="bi-info-circle"></i>
				No LED Strips
			</div>
		</template>
	</config-section>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";

const LedStripTypes: Array<SelectOption> = [
	{
		text: "DotStar",
		value: LedStripType.DotStar
	},
	{
		text: "NeoPixel (RGB)",
		value: LedStripType.NeoPixel_RGB
	},
	{
		text: "NeoPixel (RGBW)",
		value: LedStripType.NeoPixel_RGBW
	}
];
</script>

<script setup lang="ts">
import { LedStrip, LedStripType } from "@duet3d/objectmodel";
import { computed } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import PortInput from "@/components/inputs/PortInput.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";

import { useStore } from "@/store";
import { ConfigPortFunction } from "@/store/model/ConfigPort";
import { ConfigSectionType } from "@/store/sections";

const store = useStore();

// LED strip management
const canAddLedStrip = computed(() => store.data.ledStrips.length < store.data.limits.ledStrips!);
function addLedStrip() {
	const strip = new LedStrip();
	if (store.preset.ledStrips.length > store.data.ledStrips.length) {
		strip.update(store.preset.ledStrips[store.data.ledStrips.length]);
	} else if (store.preset.ledStrips.length > 0) {
		strip.update(store.preset.ledStrips[0]);
	}
	store.data.ledStrips.push(strip);
}

function deleteLedStrip(index: number) {
	for (const port of store.data.configTool.ports) {
		if (port.function === ConfigPortFunction.ledStrip) {
			if (port.index === index) {
				port.function = null;
			}  else if (port.index > index) {
				port.index -= 1;
			}
		}
	}
	store.data.ledStrips.splice(index, 1);
}

// LED strips
function getPresetLedStripValue<K extends keyof LedStrip>(index: number, key: K) {
	if (index < store.preset.ledStrips.length) {
		const presetStrip = store.preset.ledStrips[index];
		if (presetStrip !== null) {
			return presetStrip[key];
		}
	}
	return null;
}
</script>
