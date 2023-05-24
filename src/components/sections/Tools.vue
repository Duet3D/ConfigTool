<template>
	<config-section :type="ConfigSectionType.Tools" title="Tools">
		<template #append-title>
			<button class="btn btn-sm btn-primary" :disabled="!canAddTool" @click.prevent="addTool">
				<i class="bi-plus-circle"></i>
				Add Tool
			</button>
		</template>
		<template #body>
			<table class="table table-striped table-extruders mb-0">
				<colgroup>
					<col style="width: 15%;">
					<col style="width: 20%;">
					<col style="width: 20%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: 15%;">
					<col style="width: auto;">
					<col style="width: auto;">
				</colgroup>
				<thead>
					<tr>
						<th>
							Number
						</th>
						<th>
							Name
						</th>
						<th v-show="store.data.configTool.capabilities.cnc">
							Spindle
						</th>
						<th v-show="store.data.configTool.capabilities.fff">
							Extruders
						</th>
						<th v-show="store.data.configTool.capabilities.fff">
							Filament Extruder
						</th>
						<th v-show="store.data.configTool.capabilities.fff">
							Heaters
						</th>
						<th>
							Fans
						</th>
						<th>
							<!-- Advanced -->
						</th>
						<th>
							<!-- Delete button -->
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="tool in store.data.tools">
						<tr v-if="tool !== null">
							<td>
								<select-input title="Number of this tool" :model-value="tool.number"
											  @update:model-value="setToolNumber(tool, $event)"
											  :options="getToolNumbers(tool)" />
							</td>
							<td>
								<text-input title="Optional name of this tool" v-model="tool.name" :max-length="32"
											:required="false" :preset="getPresetToolValue(tool, 'name')"
											:placeholder="`Tool ${tool.number}`" />
							</td>
							<td v-show="store.data.configTool.capabilities.cnc">
								<select-input title="Spindle mapped to this tool" v-model="tool.spindle"
											  :preset="getPresetToolValue(tool, 'spindle')" :options="spindleOptions"
											  :required="false" />
							</td>
							<td v-show="store.data.configTool.capabilities.fff">
								<extruder-list class="mt-1" :extruders="tool.extruders"
											   @extruder-added="onExtruderAdded(tool)"
											   @extruder-removed="onExtruderRemoved(tool)" />
							</td>
							<td v-show="store.data.configTool.capabilities.fff">
								<select-input title="Extruder used for filament mapping"
											  :disabled="tool.extruders.length === 0" v-model="tool.filamentExtruder"
											  :preset="getPresetToolValue(tool, 'filamentExtruder')"
											  :options="getFilamentExtruders(tool)" :required="false" />
							</td>
							<td v-show="store.data.configTool.capabilities.fff">
								<heater-list class="mt-1" :heaters="tool.heaters" />
							</td>
							<td>
								<fan-list class="mt-1" :fans="tool.fans" />
							</td>
							<td>
								<button class="btn btn-sm mt-1" :class="getToolClass(tool)" @click.prevent="configureTool(tool)">
									<i class="bi bi-gear"></i>
								</button>
							</td>
							<td>
								<button class="btn btn-sm btn-danger mt-1"
										@click.prevent="store.data.tools.splice(tool.number, 1)">
									<i class="bi bi-trash"></i>
								</button>
							</td>
						</tr>
					</template>
				</tbody>
			</table>

			<tool-dialog v-model="toolDialogShown" :tool="toolToConfigure" />
		</template>
	</config-section>
</template>

<script lang="ts">
import { computed, ref } from "vue";

import { useStore } from "@/store";
import type { SelectOption } from "../inputs/SelectInput.vue";

const store = useStore();

const spindleOptions = computed(() => {
	const result: Array<SelectOption> = [];

	for (let i = 0; i < store.data.spindles.length; i++) {
		if (store.data.spindles[i] !== null) {
			result.push({
				text: `Spindle #${i}`,
				value: i
			});
		}
	}

	result.push({
		text: "None",
		value: -1
	});
	return result;
});
</script>

<script setup lang="ts">
import { Tool } from "@duet3d/objectmodel";

import ConfigSection from "@/components/ConfigSection.vue";
import ToolDialog from "@/components/dialogs/ToolDialog.vue";
import ExtruderList from "@/components/inputs/ExtruderList.vue";
import FanList from "@/components/inputs/FanList.vue";
import HeaterList from "@/components/inputs/HeaterList.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import TextInput from "@/components/inputs/TextInput.vue";

import { ConfigSectionType } from "@/store/sections";

// Tool management
const canAddTool = computed(() => store.data.tools.length < store.data.limits.tools!);

function addTool() {
	const tool = new Tool();
	if (store.preset.tools.length > store.data.tools.length) {
		tool.update(store.preset.tools[store.data.tools.length])
	} else if (store.preset.tools.length > 0) {
		tool.update(store.preset.tools[0]);
	}
	store.data.tools.push(tool);
}

// Tools
function getToolNumbers(tool: Tool) {
	const options: Array<SelectOption> = [];
	for (let i = 0; i < store.data.limits.tools!; i++) {
		options.push({
			text: i.toString(),
			value: i,
			disabled: (i !== tool.number) && (i < store.data.tools.length) && (store.data.tools[i] !== null)
		});
	}
	return options;
}

function setToolNumber(tool: Tool, newIndex: number) {
	// Ensure we have enough items in the tools array
	while (store.data.tools.length < newIndex) {
		store.data.tools.push(null);
	}

	// Move the tool from the old slot to the new one
	store.data.tools[newIndex] = store.data.tools[tool.number];
	store.data.tools[tool.number] = null;

	// Clean up unused items at the end
	while (store.data.tools[store.data.tools.length - 1] === null) {
		store.data.tools.pop();
	}

	// Update the tool itself
	tool.number = newIndex;
}

function getPresetToolValue<K extends keyof Tool>(tool: Tool, key: K) {
	if (tool.number < store.preset.tools.length) {
		const presetTool = store.preset.tools[tool.number];
		if (presetTool !== null) {
			return presetTool[key];
		}
	}
	return null;
}

function getFilamentExtruders(tool: Tool) {
	const result: Array<SelectOption> = [];

	for (const extruder of tool.extruders) {
		result.push({
			text: `E${extruder}`,
			value: extruder
		});
	}

	result.push({
		text: "None",
		value: -1
	});
	return result;
}

function onExtruderAdded(tool: Tool) {
	if (tool.extruders.length === 1) {
		tool.filamentExtruder = tool.extruders[0];
	}
}

function onExtruderRemoved(tool: Tool) {
	if (tool.filamentExtruder >= 0 && !tool.extruders.includes(tool.filamentExtruder)) {
		tool.filamentExtruder = -1;
	}
}

// Tool Dialog
const toolDialogShown = ref(false), toolToConfigure = ref<Tool | null>(null);

function getToolClass(tool: Tool) {
	const isValid = tool.offsets.every(offset => isFinite(offset));
	return isValid ? "btn-primary" : "btn-outline-danger is-invalid";
}

function configureTool(tool: Tool) {
	toolToConfigure.value = tool;
	toolDialogShown.value = true;
}
</script>
