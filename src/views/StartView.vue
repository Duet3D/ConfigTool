<style scoped>
.main-icon {
	color: rgb(3, 24, 209);
}
</style>

<template>
	<main class="container mt-4">
		<div class="text-center mb-5">
			<h2 class="mb-4">
				Welcome to the new RepRapFirmware Config Tool
			</h2>
			<h4>
				Follow this wizard to obtain an individual configuration bundle for your machine.
			</h4>
		</div>

		<div class="row mb-5">
			<div class="col-3"></div>
			<div class="col-6 text-center">
				<h4 class="mb-3">
					Please choose your firmware version to continue:
				</h4>

				<div class="card">
					<div class="card-body py-4">
						<input type="radio" class="btn-check" name="firmwareVersion" id="v34" value="v34" autocomplete="off"
							   v-model="firmwareVersion">
						<label class="btn btn-outline-secondary btn-lg me-1" for="v34">Version 3.4 or older</label>

						<input type="radio" class="btn-check" name="firmwareVersion" id="v35" value="v35" autocomplete="off"
							   v-model="firmwareVersion">
						<label class="btn btn-outline-success btn-lg ms-1" for="v35">Version 3.5</label>
					</div>
				</div>
			</div>
			<div class="col-3"></div>
		</div>

		<div class="d-flex justify-content-center mb-3">
			<button type="button" class="btn btn-lg me-3" :class="store.dataModified ? 'btn-secondary' : 'btn-primary'"
					@click.prevent="startFromScratch">
				<i class="bi bi-plus-square"></i>
				Start new Configuration from Scratch
			</button>
			<button v-if="store.dataModified" type="button" class="btn btn-lg btn-primary"
					@click.prevent="router.push('/Configuration')">
				<i class="bi bi-arrow-right-circle"></i>
				Continue Configuration
			</button>
			<!--<button type="button" class="btn btn-lg btn-primary ms-1" disabled @click.prevent="$router.push('/Templates')">
				<i class="bi bi-file-earmark-arrow-up"></i>
				Start with Existing Template
			</button>-->
		</div>

		<div class="text-center mb-4">
			<a href="javascript:void(0)" class="mx-auto" @click="loadTemplate">
				<i class="bi bi-database-fill-up"></i>
				Load Config Template
			</a>
		</div>

		<div class="text-center">
			Version {{ packageInfo.version }}
		</div>

		<base-dialog title="Unsupported Firmware" v-model="oldFirmwareDialogShown">
			The selected firmware version is not compatible with this version of the Config Tool.
			For this reason, you will be forwarded to the previous version of the Config Tool as soon as you click OK.
			<template #buttons>
				<a href="https://configtool.reprapfirmware.org/legacy" class="btn btn-primary">
					OK
				</a>
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
					Cancel
				</button>
			</template>
		</base-dialog>

		<input ref="inputJsonFile" type="file" accept="application/json" hidden @change="fileSelected">
	</main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import BaseDialog from "@/components/dialogs/BaseDialog.vue";

import { useStore } from "@/store";
import { convertLegacyPreset } from "@/store/compatibility";

import packageInfo from "../../package.json";

const store = useStore();
const router = useRouter();

const firmwareVersion = ref<"v34" | "v35">("v35");
const oldFirmwareDialogShown = ref(false);

function startFromScratch() {
	if (store.dataModified) {
		if (!confirm("It looks like you already started configuring. By clicking OK, you will reset the data to factory defaults. Are you sure you want to continue?")) {
			return;
		}
	}

	if (firmwareVersion.value === "v34") {
		oldFirmwareDialogShown.value = true;
	} else {
		store.$reset();
		router.push("/Configuration");
	}
};


// Load existing config
const inputJsonFile = ref<HTMLInputElement | null>(null);

function loadTemplate() {
	inputJsonFile.value?.click();
}

function fileSelected() {
	if (inputJsonFile.value !== null && inputJsonFile.value.files !== null) {
		const file = inputJsonFile.value.files[0];
		try {
			const fileReader = new FileReader();
			fileReader.onload = (e) => {
				const jsonData = JSON.parse(e.target?.result as string);
				if (jsonData.configTool !== undefined) {
					// New configtool preset
					try {
						store.setModel(jsonData);
						router.push("/Configuration");
					} catch (e) {
						console.error("Failed to load preset", e);
						alert(`Failed to load preset: ${e}`);
					}
				} else {
					// Old configtool preset
					try {
						const convertedModel = convertLegacyPreset(jsonData);
						store.setModel(convertedModel);
						router.push("/Configuration");
					} catch (e) {
						console.error("Failed to load legacy preset", e);
						alert(`Failed to load legacy preset: ${e}`);
					}
				};
			};
			fileReader.readAsText(file);
		} catch (e) {
			console.error("Failed to load configuration file", file, e);
			alert(`Failed to load configuration file: ${e}`);
		}
	}
}
</script>