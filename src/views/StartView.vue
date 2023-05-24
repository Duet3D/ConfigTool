<style scoped>
.main-icon {
	color: rgb(3, 24, 209);
}
</style>

<template>
	<main class="container mt-4">
		<div class="text-center mb-4">
			<h2 class="mb-4">
				Welcome to the RepRapFirmware Config Tool!
			</h2>
			<h4 class="mb-3">
				Please follow this wizard to obtain an individual configuration bundle for your printer.
				<br><br>
				To continue, choose your firmware version:
			</h4>

			<input type="radio" class="btn-check" name="firmwareVersion" id="v34" value="v34" autocomplete="off" v-model="firmwareVersion">
			<label class="btn btn-outline-secondary btn-lg me-1" for="v34">Version 3.4 or older</label>

			<input type="radio" class="btn-check" name="firmwareVersion" id="v35" value="v35" autocomplete="off" v-model="firmwareVersion">
			<label class="btn btn-outline-success btn-lg ms-1" for="v35">Version 3.5</label>
		</div>

		<div class="d-flex justify-content-center">
			<button type="button" class="btn btn-lg btn-primary me-3" @click.prevent="startFromScratch">
				<i class="bi bi-plus-square"></i>
				Start new Configuration from Scratch
			</button>
			<button v-if="store.dataModified" type="button" class="btn btn-lg btn-secondary"
					@click.prevent="router.push('/Configuration')">
				<i class="bi bi-arrow-right-circle"></i>
				Continue Configuration
			</button>
			<!--<button type="button" class="btn btn-lg btn-primary ms-1" disabled @click.prevent="$router.push('/Templates')">
				<i class="bi bi-file-earmark-arrow-up"></i>
				Start with Existing Template
			</button>-->
		</div>

		<div class="alert alert-warning my-4">
			<i class="bi bi-exclamation-triangle"></i>
			This version of the Config Tool is still under development. If you encounter problems, please consider using the
			previous <a href="https://configtool.reprapfirmware.org" target="_blank">Config Tool</a> instead.
		</div>

		<base-dialog title="Unsupported Firmware" v-model="oldFirmwareDialogShown">
			The selected firmware version is not compatible with this version of the Config Tool.
			For this reason, you will be forwarded to the previous version of the Config Tool as soon as you click OK.
			<template #buttons>
				<a href="https://configtool.reprapfirmware.org/General" class="btn btn-primary">
					OK
				</a>
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
					Cancel
				</button>
			</template>
		</base-dialog>
	</main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useStore } from "@/store";

import BaseDialog from "@/components/dialogs/BaseDialog.vue";

const store = useStore();
const router = useRouter();

const firmwareVersion = ref<"v34" | "v35">("v35");
const oldFirmwareDialogShown = ref(false);

const startFromScratch = () => {
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
</script>