<template>
	<div class="container mt-3">
		<div v-if="loading" class="w-100 text-center text-muted">
			<h4 class="mb-3">
				Loading templates...
			</h4>
			<div class="spinner-border" role="status">
				<span class="visually-hidden">Loading templates...</span>
			</div>
		</div>
		<template v-else>
			<h5 class="mb-1">
				Here you can choose a preconfigured template:
			</h5>

			<div v-if="errorMessage" class="alert alert-danger my-3" role="alert">
				<i class="bi bi-exclamation-triangle"></i>
				{{ errorMessage }}
			</div>

			<div v-for="(group, groupName) in templates" class="ms-1 mt-2">
				{{ groupName }}
				<div v-for="(filename, template) in group" class="form-check">
					<input class="form-check-input" type="radio" name="template" :id="template.toString()" :value="filename" v-model="selectedTemplate">
					<label class="form-check-label" :for="template.toString()">
						{{ template }}
					</label>
				</div>
			</div>

			<div class="text-muted ml-1 mt-2">
				* Some templates were contributed by independent users. Use them at your own risk.
			</div>
		</template>

		<div class="d-flex justify-content-center mt-3">
			<button type="button" class="btn btn-lg btn-secondary me-1" @click="inputJsonFile!.click()">
				<i class="bi bi-cloud-arrow-up"></i>
				Import Existing Template
			</button>
			<button type="button" class="btn btn-lg btn-primary ms-1" :disabled="loadingTemplate || selectedTemplateContent === null">
				<template v-if="loadingTemplate">
					<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
					Loading...
				</template>
				<template v-else>
					<i class="bi bi-check-circle"></i>
					Use Selected Template
				</template>
			</button>
		</div>

		<input ref="inputJsonFile" type="file" accept="application/json" hidden @change="fileSelected">
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { useStore } from "@/store";
import ConfigModel from "@/store/model";
import { convertLegacyTemplate} from "@/store/compatibility";
import type { LegacyTemplate } from "@/store/compatibility/LegacyTemplate";

const router = useRouter();
const store = useStore();

// Template list
const loading = ref(true), errorMessage = ref<string | null>(null);
const templates = ref({});
onMounted(async () => {
	// Try to fetch the list of available templates
	try {
		templates.value = await fetch("templates.json", {
			cache: "no-cache",
			headers: {
				Accept: "application/json",
			}
		}).then(r => r.json());
	} catch (e) {
		errorMessage.value = (e instanceof Error) ? e.message : e as string;
		console.error(e);
	}
	loading.value = false;
});

// Template selection
const selectedTemplate = ref<null | string>(null);
const loadingTemplate = ref(false), selectedTemplateContent = ref<null | object>(null);
watch(() => selectedTemplate.value, async () => {
	// Reset the template selection
	selectedTemplateContent.value = null;
	if (selectedTemplate.value === null) {
		return;
	}

	// Attempt to download the file
	loadingTemplate.value = true;
	try {
		selectedTemplateContent.value = await fetch(selectedTemplate.value, {
			cache: "no-cache",
			headers: {
				Accept: "application/json",
			}
		}).then(r => r.json());
	} catch (e) {
		console.error(e);
		alert(`Failed to download template file ${selectedTemplate.value}:\n\n${e}`);
		selectedTemplate.value = null;
	}
	loadingTemplate.value = false;
});

const inputJsonFile = ref<HTMLInputElement>();
const fileSelected = () => {
	if (inputJsonFile.value && inputJsonFile.value.files && inputJsonFile.value.files.length > 0) {
		const fileReader = new FileReader();
		fileReader.onload = function(e) {
			try {
				const jsonContent = JSON.parse(e.target!.result as string);
				if (jsonContent instanceof Object) {
					let newModel: ConfigModel;
					if (jsonContent.configTool) {
						// New format
						newModel = new ConfigModel();
						newModel.update(jsonContent);
						newModel.validate();
					} else {
						// Old format
						newModel = convertLegacyTemplate(jsonContent as LegacyTemplate);
					}
					store.setModel(newModel);
					router.push("/Configuration");
				} else {
					console.log("Invalid JSON content");
					alert("Error: Invalid JSON content, must be an object!");
				}
			} catch (e) {
				console.log(e);
				alert("Error: The specified file could not be read!\n\n" + e);
			}
		};
		fileReader.readAsText(inputJsonFile.value?.files[0]);
	}
}
</script>