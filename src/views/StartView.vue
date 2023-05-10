<style scoped>
.main-icon {
	color: rgb(3, 24, 209);
}
</style>

<template>
	<main class="container mt-4">
		<div class="text-center">
			<h2 class="mb-4">
				Welcome to the RepRapFirmware Configuration Tool!
			</h2>
			<h4 class="text-muted">
				Please follow this wizard to obtain an individual configuration bundle for your printer.
			</h4>
		</div>

		<div class="alert alert-warning my-5">
			<i class="bi bi-exclamation-triangle"></i>
			This version of the Config Tool is still under development. If you encounter problems, please consider using the previous <a href="https://configtool.reprapfirmware.org" target="_blank">Config Tool</a> instead.
		</div>

		<div class="d-flex justify-content-center">
			<button type="button" class="btn btn-lg btn-primary me-3" @click.prevent="startFromScratch">
				<i class="bi bi-plus-square"></i>
				Start new Configuration from Scratch
			</button>
			<button v-if="store.dataModified" type="button" class="btn btn-lg btn-secondary" @click.prevent="router.push('/Configuration')">
				<i class="bi bi-arrow-right-circle"></i>
				Continue Configuration
			</button>
			<!--<button type="button" class="btn btn-lg btn-primary ms-1" disabled @click.prevent="$router.push('/Templates')">
				<i class="bi bi-file-earmark-arrow-up"></i>
				Start with Existing Template
			</button>-->
		</div>
	</main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useStore } from "@/store";

const store = useStore();
const router = useRouter();

const startFromScratch = () => {
	if (store.dataModified) {
		if (!confirm("It looks like you already started configuring. By clicking OK, you will reset the data to factory defaults. Are you sure you want to continue?")) {
			return;
		}
	}
	store.$reset();
	router.push("/Configuration");
};
</script>