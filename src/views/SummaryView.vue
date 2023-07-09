<template>
	<main class="container mt-2">
		<div class="text-center mb-4">
			<h2 class="mb-4">
				Configuration ready
			</h2>

			<h4>
				The config tool can now generate the following system files:
			</h4>
		</div>

		<div class="row mb-4">
			<div class="col-2"></div>
			<div class="col-8">
				<div class="card">
					<div class="card-body">
						<ul class="mb-0">
							<li v-for="template in templates">
								<a href="javascript:void(0)" @click="showFile(template)">
									{{ template.displayName }}
								</a>
								<progress-icon :model-value="template.state" />
							</li>
						</ul>
					</div>
				</div>

				<div v-if="!store.data.sbcMode" class="mt-3">
					<check-input v-model="includeRRF" :disabled="generating" label="Include firmware files"
								 title="Include firmware files in the configuration bundle" :preset="true">
						<template #append>
							<progress-icon :model-value="rrfState" />
						</template>
					</check-input>
					<check-input v-model="includeDWC" :disabled="generating" label="Include web interface"
								 title="Include web interface in the configuration bundle" :preset="true">
						<template #append>
							<progress-icon :model-value="dwcState" />
						</template>
					</check-input>
				</div>
			</div>
			<div class="col-2"></div>
		</div>

		<div class="d-flex flex-column">
			<button class="btn btn-primary btn-lg mx-auto mb-3" :disabled="generating" @click="generateBundle">
				<i class="bi" :class="generating ? 'bi-hourglass' : 'bi-download'"></i>
				{{ generating ? "Generating Config Bundle..." : "Download Config Bundle" }}
			</button>

			<a href="javascript:void(0)" class="mx-auto" @click="generateConfigData">
				<i class="bi bi-database-fill-down"></i>
				Save Config Template
			</a>
		</div>
	</main>
</template>

<script setup lang="ts">
import saveAs from "file-saver";
import JSZip from "jszip";
import { onMounted, ref } from "vue";

import CheckInput from "@/components/inputs/CheckInput.vue";

import { useStore } from "@/store";
import { render, renderFull } from "@/store/render";
import { getSectionTemplates } from "@/store/sections";
import ProgressIcon, { ProgressState } from "@/components/ProgressIcon.vue";

const store = useStore();

// FIXME This needs to be updated in the future
const latestFirmwareVersion = "3.5.0-beta.4";

// Template list
interface TemplateItem {
	name: string;
	displayName: string;
	data: Record<string, any> | null;
	state: ProgressState | null
}

const templates = ref<Array<TemplateItem>>([]);

onMounted(() => {
	templates.value = getSectionTemplates().map(item => ({
		name: item.template,
		displayName: item.template == 'boardtxt' ? 'board.txt' : item.template + '.g',
		data: item.data,
		state: null
	}));
});

async function showFile(item: TemplateItem) {
	if (!generating.value) {
		item.state = ProgressState.busy;
	}

	try {
		await renderFull(item.name, item.data ?? undefined);
	} catch (e) {
		console.error("Failed to generate template", item.name, item.data, e);
		alert(`Failed to generate template ${item.displayName}: ${e}`);
	}

	if (!generating.value) {
		item.state = null;
	}
}

// Bundle Generation
const generating = ref(false);

const includeRRF = ref(true), rrfState = ref<ProgressState | null>(null);
async function downloadRRF(): Promise<Array<File>> {
	const result: Array<File> = [];
	rrfState.value = ProgressState.busy;
	try {
		for (const board of store.data.boards) {
			// Download firmware file
			if (board.firmwareFileName !== null) {
				// TODO add dynamic firmware version support
				const response = await fetch(`/assets/RepRapFirmware-${latestFirmwareVersion}/${board.firmwareFileName}`);
				if (!response.ok) {
					throw new Error(`Failed to download ${board.firmwareFileName}: ${response.status} ${response.statusText}`);
				}

				const file = new File([await response.blob()], board.firmwareFileName);
				result.push(file);
			}

			// Download IAP file only for the mainboard
			if (!board.canAddress && board.iapFileNameSD !== null) {
				// Download SD IAP file
				// TODO add dynamic firmware version support
				const response = await fetch(`/assets/RepRapFirmware-${latestFirmwareVersion}/${board.iapFileNameSD}`);
				if (!response.ok) {
					throw new Error(`Failed to download ${board.iapFileNameSD}: ${response.status} ${response.statusText}`);
				}

				const file = new File([await response.blob()], board.iapFileNameSD);
				result.push(file);
			}
		}
		rrfState.value = ProgressState.ready;
		return result;
	} catch (e) {
		rrfState.value = ProgressState.error;
		throw e;
	}
}

const includeDWC = ref(true), dwcState = ref<ProgressState | null>(null);
async function downloadDWC(): Promise<Array<File>> {
	const result: Array<File> = [];
	dwcState.value = ProgressState.busy;
	try {
		// Download DWC bundle
		// TODO add dynamic DWC version support
		const response = await fetch(`/assets/DuetWebControl-v${latestFirmwareVersion}.zip`);
		const content = await response.blob();

		// Unpack it
		const zip = await JSZip.loadAsync(content), promises: Array<Promise<void>> = [];
		zip.forEach(function (_, file) {
			promises.push(file.async("blob").then(value => { result.push(new File([value], file.name)); }));
		});
		await Promise.all(promises);

		// Done
		dwcState.value = ProgressState.ready;
		return result;
	} catch (e) {
		dwcState.value = ProgressState.error;
		throw e;
	}
}

async function generateBundle() {
	generating.value = true;
	try {
		// Start downloading RRF and DWC
		const rrfPromise = (!store.data.sbcMode && includeRRF.value) ? downloadRRF() : Promise.resolve([] as Array<File>);
		const dwcPromise = (!store.data.sbcMode && includeDWC.value) ? downloadDWC() : Promise.resolve([] as Array<File>);

		// Reset states
		for (const item of templates.value) {
			item.state = null;
		}

		// Create a new ZIP file
		const zip = new JSZip();

		// Start generating templates
		for (const item of templates.value) {
			item.state = ProgressState.busy;
			try {
				const content = await render(item.name, item.data ?? undefined);
				zip.file(`sys/${item.name}.g`, content);
				item.state = ProgressState.ready;
			} catch (e) {
				item.state = ProgressState.error;
				console.error(`Failed to generate template ${item.name}.g:`, item.data, e);
				alert(`Failed to generate template ${item.name}.g: ${e}`);
			}
		}

		// Include RRF/DWC
		try {
			// Add RRF files to the bundle
			const rrfFiles = await rrfPromise;
			for (const file of rrfFiles) {
				zip.file(`firmware/${file.name}`, file);
			}

			// Add DWC files to the bundle
			const dwcFiles = await dwcPromise;
			for (const file of dwcFiles) {
				zip.file(`www/${file.name}`, file);
			}
		} catch (e) {
			console.error(e);
			alert(e);
			return;
		}

		// Add config data
		const modelJson = JSON.stringify(store.data);
		zip.file("sys/configtool.json", modelJson);

		// Build final ZIP and save it
		try {
			const zipBundle = await zip.generateAsync({ type: "blob" });
			saveAs(zipBundle, "config.zip");
		} catch (e) {
			console.error("Failed to generate ZIP bundle", e);
			alert(`Failed to generate ZIP bundle: ${e}`);
		}
	} finally {
		// Done
		generating.value = false;
	}
	store.showSavePrompt = false;
}

async function generateConfigData() {
	const modelJson = JSON.stringify(store.data);
	saveAs(new Blob([modelJson]), "configtool.json");
	store.showSavePrompt = false;
}
</script>
